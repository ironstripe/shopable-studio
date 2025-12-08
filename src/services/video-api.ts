import { API_BASE_URL } from "./api-config";

export interface VideoDto {
  id: string;
  title: string;
  createdAt: number;
  status: "REGISTERED" | "UPLOADED" | "READY" | "FAILED" | string;
  thumbnailUrl?: string;
  fileUrl?: string;
}

function extractTitleFromObjectKey(objectKey: string | undefined, fallbackId: string): string {
  if (!objectKey) return fallbackId;
  const filename = objectKey.split('/').pop() || objectKey;
  return filename.replace(/\.[^/.]+$/, "") || fallbackId;
}

/**
 * Build direct S3 URL from bucket and objectKey for immediate playback
 */
function buildS3Url(bucket: string, objectKey: string): string {
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  return `https://${bucket}.s3.eu-west-1.amazonaws.com/${encodedKey}`;
}

export interface RegisterUploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface RegisterUploadResponse {
  uploadUrl: string; // S3 presigned URL for PUT
  videoId: string;
  fileUrl?: string; // optional playback URL after processing
}

/**
 * Fetch all videos for the current user from the backend
 */
export async function listVideos(): Promise<VideoDto[]> {
  console.log('[Videos] Fetching video list from:', API_BASE_URL);
  const res = await fetch(`${API_BASE_URL}/videos`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Videos] listVideos failed", res.status, text);
    throw new Error(`Failed to load videos (${res.status})`);
  }
  const data = await res.json();
  const items = data.items || [];
  return items.map((item: any): VideoDto => {
    // Build fallback URL for videos missing fileUrl
    let fileUrl = item.fileUrl;
    if (!fileUrl && item.bucket && item.objectKey) {
      fileUrl = buildS3Url(item.bucket, item.objectKey);
      console.log('[Videos] Built fallback S3 URL for video:', item.videoId, fileUrl);
    }
    
    return {
      id: item.videoId || item.id,
      title: extractTitleFromObjectKey(item.objectKey, item.videoId || item.id),
      createdAt: item.createdAt || Date.now(),
      status: item.status || "UPLOADED",
      thumbnailUrl: item.thumbnailUrl,
      fileUrl,
    };
  });
}

/**
 * Register a new video upload and get a presigned S3 URL
 */
export async function registerUpload(
  payload: RegisterUploadRequest
): Promise<RegisterUploadResponse> {
  const url = `${API_BASE_URL}/uploads/register`;
  console.log("[Uploads] Calling:", "POST", url);
  console.log("[Uploads] Payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const responseText = await res.clone().text();
  console.log("[Uploads] registerUpload response:", url, "POST", res.status, responseText);

  if (!res.ok) {
    console.error("[Uploads] register failed", res.status, responseText);
    throw new Error(`Failed to register upload (${res.status})`);
  }

  // First parse the outer JSON
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error("[Uploads] Failed to parse JSON response", err);
    throw new Error("Backend returned invalid JSON");
  }

  // Handle Lambda proxy format (body holds inner JSON)
  if (!data.uploadUrl && data.body) {
    try {
      const inner = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      console.log("[Uploads] Parsed inner body:", inner);
      data = inner;
    } catch (err) {
      console.error("[Uploads] Failed to parse inner body JSON", err, data);
      throw new Error("Backend did not return upload URL");
    }
  }

  // Validate fields
  if (!data.uploadUrl) {
    console.error("[Uploads] Backend did not return uploadUrl:", data);
    throw new Error("Backend did not return upload URL");
  }
  if (!data.videoId) {
    console.error("[Uploads] Backend did not return videoId:", data);
    throw new Error("Backend did not return video ID");
  }

  return {
    uploadUrl: data.uploadUrl,
    videoId: data.videoId,
    fileUrl: data.fileUrl ?? undefined
  };
}

/**
 * Upload a file directly to S3 using the presigned URL
 */
export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  console.log('[Uploads] S3 PUT to:', uploadUrl);
  console.log('[Uploads] File details:', { name: file.name, type: file.type, size: file.size });
  console.log('[Uploads] URL includes query params:', uploadUrl.includes('?'));
  
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Uploads] S3 upload failed", res.status, text);
    throw new Error(`S3 upload failed (${res.status})`);
  }
  
  console.log('[Uploads] S3 upload complete, status:', res.status);
}
