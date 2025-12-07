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
  const res = await fetch(`${API_BASE_URL}/videos`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to load videos (${res.status})`);
  }
  return res.json();
}

/**
 * Register a new video upload and get a presigned S3 URL
 */
export async function registerUpload(
  payload: RegisterUploadRequest
): Promise<RegisterUploadResponse> {
  const res = await fetch(`${API_BASE_URL}/uploads/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to register upload (${res.status})`);
  }
  return res.json();
}

/**
 * Upload a file directly to S3 using the presigned URL
 */
export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload to S3 (${res.status})`);
  }
}
