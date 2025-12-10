import { API_BASE_URL } from "./api-config";

export type RenderStatus = "NONE" | "PENDING" | "READY";

export interface VideoDto {
  id: string;
  videoId: string;
  title?: string | null;
  fileUrl: string | null;
  renderStatus: RenderStatus;
  renderUpdatedAt: string | null;
  createdAt: string | null;
}

export interface TriggerRenderResponse {
  videoId: string;
  renderStatus: RenderStatus;
  renderUpdatedAt: string | null;
}

/**
 * Infer a human-readable title from video key or ID
 */
function inferTitleFromId(videoId: string): string {
  const lastPart = videoId.split("/").pop() || videoId;
  const nameWithoutExt = lastPart.replace(/\.[^.]+$/, "");
  return nameWithoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Untitled Video";
}

/**
 * Map backend item to VideoDto
 */
function mapBackendItemToVideoDto(item: any): VideoDto {
  const id = item.id || item.videoId || "";
  const videoId = item.videoId || item.id || "";
  
  // Use fileUrl directly from backend, or null if missing
  let fileUrl: string | null = item.fileUrl || null;
  
  if (!fileUrl) {
    console.warn(`[Videos] Video ${id} has no fileUrl, video may not be playable`);
  }

  return {
    id,
    videoId,
    title: item.title || inferTitleFromId(videoId),
    fileUrl,
    renderStatus: (item.renderStatus as RenderStatus) || "NONE",
    renderUpdatedAt: item.renderUpdatedAt || null,
    createdAt: item.createdAt || null,
  };
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
  
  // Handle both array format and { items: [], videos: [] } format
  const items = Array.isArray(data) ? data : (data.items || data.videos || []);
  
  if (!Array.isArray(items)) {
    console.error("[Videos] /videos response is not an array:", data);
    return [];
  }
  
  console.log('[Videos] Raw items from backend:', items.length);
  
  const mapped = items.map(mapBackendItemToVideoDto);
  
  // Sort by createdAt descending (newest first)
  mapped.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  console.log('[Videos] Mapped videos:', mapped.length);
  
  return mapped;
}

/**
 * Trigger video rendering for a specific video
 */
export async function triggerRender(videoId: string): Promise<TriggerRenderResponse> {
  const url = `${API_BASE_URL}/videos/${encodeURIComponent(videoId)}/render`;
  console.log("[Render] Calling:", "POST", url);

  const res = await fetch(url, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Render] triggerRender failed", res.status, text);
    throw new Error(`Failed to trigger render (${res.status})`);
  }

  const data = await res.json();
  console.log("[Render] Response:", data);
  
  return {
    videoId: data.videoId,
    renderStatus: data.renderStatus || "READY",
    renderUpdatedAt: data.renderUpdatedAt || null,
  };
}

/**
 * Register a new video upload and get a presigned S3 URL
 */
export async function registerUpload(payload: {
  filename: string;
  contentType: string;
  sizeBytes: number;
}) {
  const url = `${API_BASE_URL}/uploads/register`;
  console.log("[Uploads] Calling:", "POST", url);
  console.log("[Uploads] Payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.clone().text();
  console.log("[Uploads] registerUpload raw HTTP response:", res.status, raw);

  if (!res.ok) {
    console.error("[Uploads] register failed", res.status, raw);
    throw new Error(`Failed to register upload (${res.status})`);
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("[Uploads] Failed to parse JSON response", err);
    throw new Error("Backend returned invalid JSON");
  }

  if (!data.uploadUrl) {
    console.error("[Uploads] Backend did not return uploadUrl:", data);
    throw new Error("Backend did not return upload URL");
  }

  if (!data.videoId && !data.id) {
    console.error("[Uploads] Backend did not return videoId:", data);
    throw new Error("Backend did not return video ID");
  }

  return {
    uploadUrl: data.uploadUrl as string,
    videoId: (data.videoId || data.id) as string,
    fileUrl: data.fileUrl ?? null,
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
