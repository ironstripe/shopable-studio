import { API_BASE_URL } from "./api-config";
import { getAuthHeaders, getAuthHeadersForUpload } from "./api-auth";

// S3 bucket base URL for constructing playable video URLs
const S3_BASE_URL = "https://shopable-prod-media.s3.eu-west-1.amazonaws.com/";

export type RenderStatus = "NOT_STARTED" | "PENDING" | "READY" | "NONE";

export interface VideoDto {
  id: string;
  title: string;
  createdAt: string | null;
  status: "REGISTERED" | "UPLOADED" | "READY" | "FAILED" | string;
  thumbnailUrl?: string;
  fileUrl: string | null;
  renderStatus: RenderStatus | null;
  renderUpdatedAt: string | null;
  state?: "draft" | "editing" | "ready_to_post" | "posted" | null; // Video state machine
  customSlug?: string | null; // Custom URL slug for tiny URLs
}

export interface TriggerRenderResponse {
  videoId: string;
  renderStatus: RenderStatus;
  renderUpdatedAt: string | null;
}

/**
 * Infer a human-readable title from video key or ID
 */
function inferTitleFromKey(videoId: string, originalVideoKey?: string | null): string {
  const source = originalVideoKey || videoId;
  const lastPart = source.split("/").pop() || source;
  const nameWithoutExt = lastPart.replace(/\.[^.]+$/, "");
  return nameWithoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Untitled Video";
}

/**
 * Check if a videoId represents a real video (not hotspots, test data, etc.)
 */
function isValidVideoEntry(videoId: string): boolean {
  if (!videoId) return false;
  
  // Filter out non-video entries
  if (videoId.startsWith("hotspots/")) return false;
  if (videoId.endsWith(".json")) return false;
  if (videoId === "TEST123") return false;
  if (videoId === "DEIN-VIDEO-ID") return false;
  
  return true;
}

/**
 * Map backend item to VideoDto
 */
function mapBackendItemToVideoDto(item: any): VideoDto | null {
  const rawVideoId: string = item.videoId || item.id || "";
  
  // Skip invalid entries
  if (!isValidVideoEntry(rawVideoId)) {
    return null;
  }

  // Use the part before "/" as id if there is a path (e.g., "uuid/filename.mp4" -> "uuid")
  const id = rawVideoId.includes("/")
    ? rawVideoId.split("/")[0]
    : rawVideoId;

  // Determine fileUrl - prefer rendered over original
  let fileUrl: string | null = item.renderedUrl || item.originalUrl || null;

  // If we don't have URLs but only keys, construct URL from S3
  if (!fileUrl) {
    const key = item.renderedVideoKey || item.originalVideoKey || null;
    if (key) {
      fileUrl = S3_BASE_URL + key;
    }
  }

  return {
    id,
    fileUrl,
    title: inferTitleFromKey(rawVideoId, item.originalVideoKey),
    status: item.status || "UPLOADED",
    renderStatus: (item.renderStatus as RenderStatus) || null,
    renderUpdatedAt: item.renderUpdatedAt || null,
    createdAt: item.createdAt || null,
    state: item.state || null, // Video state machine
    customSlug: item.custom_slug || item.customSlug || null, // Custom URL slug
  };
}

/**
 * Fetch all videos for the current user from the backend
 */
export async function listVideos(): Promise<VideoDto[]> {
  console.log('[Videos] Fetching video list from:', API_BASE_URL);
  
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/videos`, {
    method: "GET",
    headers,
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Videos] listVideos failed", res.status, text);
    throw new Error(`Failed to load videos (${res.status})`);
  }
  
  const data = await res.json();
  
  // Handle both array format and { items: [] } format
  const items = Array.isArray(data) ? data : (data.items || data.videos || []);
  
  if (!Array.isArray(items)) {
    console.error("[Videos] /videos response is not an array:", data);
    return [];
  }
  
  console.log('[Videos] Raw items from backend:', items.length);
  
  const mapped = items
    .map(mapBackendItemToVideoDto)
    .filter((v): v is VideoDto => v !== null && v.fileUrl !== null);
  
  // Sort by createdAt descending (newest first)
  mapped.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  console.log('[Videos] Filtered and sorted videos:', mapped.length);
  
  return mapped;
}

/**
 * Trigger video rendering for a specific video
 */
export async function triggerRender(videoId: string): Promise<TriggerRenderResponse> {
  const url = `${API_BASE_URL}/videos/${encodeURIComponent(videoId)}/render`;
  console.log("[Render] Calling:", "POST", url);

  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: "POST",
    headers,
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
    renderStatus: data.renderStatus,
    renderUpdatedAt: data.renderUpdatedAt,
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

  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: "POST",
    headers,
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

  if (!data.videoId) {
    console.error("[Uploads] Backend did not return videoId:", data);
    throw new Error("Backend did not return video ID");
  }

  return {
    uploadUrl: data.uploadUrl as string,
    videoId: data.videoId as string,
    fileUrl: data.fileUrl ?? undefined,
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
