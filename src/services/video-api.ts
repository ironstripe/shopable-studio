import { API_BASE_URL } from "./api-config";

export interface VideoDto {
  id: string;
  title?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  fileUrl?: string; // public or signed playback URL
  createdAt?: string;
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
  // API returns { items: [...] }, extract and map to VideoDto
  const items = data.items || [];
  return items.map((item: any) => ({
    id: item.videoId || item.id,
    title: item.title || item.objectKey?.replace(/\.[^/.]+$/, "") || "Untitled",
    thumbnailUrl: item.thumbnailUrl,
    fileUrl: item.fileUrl,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    durationSeconds: item.durationSeconds,
  }));
}

/**
 * Register a new video upload and get a presigned S3 URL
 */
export async function registerUpload(
  payload: RegisterUploadRequest
): Promise<RegisterUploadResponse> {
  console.log('[Uploads] Registering upload:', payload);
  const res = await fetch(`${API_BASE_URL}/uploads/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Uploads] register failed", res.status, text);
    throw new Error(`Failed to register upload (${res.status})`);
  }
  return res.json();
}

/**
 * Upload a file directly to S3 using the presigned URL
 */
export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  console.log('[Uploads] Uploading to S3, size:', file.size, 'type:', file.type);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Uploads] S3 PUT failed", res.status, text);
    throw new Error(`S3 upload failed (${res.status})`);
  }
  console.log('[Uploads] S3 upload complete');
}
