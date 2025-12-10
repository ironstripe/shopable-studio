import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type VideoUploadZoneProps = {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete: () => void;
  onOpenVideoGallery: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

if (!API_BASE_URL) {
  console.warn("[VideoUploadZone] No API base URL configured. Set VITE_API_BASE_URL or VITE_API_URL.");
}

type RegisterUploadResponse = {
  videoId: string;
  uploadUrl: string;
  fileUrl?: string | null;
  originalVideoKey?: string | null;
  renderStatus?: string;
  createdAt?: string;
  renderUpdatedAt?: string | null;
};

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ onVideoLoad, onUploadComplete, onOpenVideoGallery }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;

      if (!API_BASE_URL) {
        toast.error("Upload API base URL is not configured.");
        return;
      }

      try {
        setIsUploading(true);

        // 1) Upload in Backend registrieren
        const registerRes = await fetch(`${API_BASE_URL}/uploads/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "video/mp4",
          }),
        });

        if (!registerRes.ok) {
          const text = await registerRes.text();
          console.error("[VideoUploadZone] Register failed:", text);
          throw new Error("Failed to register upload");
        }

        const registerData = (await registerRes.json()) as RegisterUploadResponse;

        if (!registerData.uploadUrl || !registerData.videoId) {
          console.error("[VideoUploadZone] Invalid register response:", registerData);
          throw new Error("Backend did not return uploadUrl or videoId");
        }

        // 2) File via pre-signed URL nach S3 hochladen
        const uploadRes = await fetch(registerData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "video/mp4",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          console.error("[VideoUploadZone] Upload to S3 failed:", uploadRes.status, await uploadRes.text());
          throw new Error("Upload to storage failed");
        }

        // 3) Video-URL bestimmen
        let finalFileUrl: string;

        if (registerData.fileUrl && registerData.fileUrl.trim().length > 0) {
          // Idealfall: Backend gibt bereits eine abspielbare URL zurück
          finalFileUrl = registerData.fileUrl;
        } else {
          // Fallback: lokale Object URL, damit der Editor SOFORT funktioniert
          console.warn(
            "[VideoUploadZone] Backend did not return fileUrl – using local object URL as fallback",
            registerData,
          );
          finalFileUrl = URL.createObjectURL(file);
        }

        // 4) Editor informieren
        onVideoLoad(finalFileUrl, registerData.videoId);
        onUploadComplete();

        toast.success("Video uploaded successfully.");
      } catch (err: any) {
        console.error("[VideoUploadZone] Upload error:", err);
        toast.error(err?.message || "Upload failed");
      } finally {
        setIsUploading(false);
        setDragActive(false);
      }
    },
    [onVideoLoad, onUploadComplete],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
      <div
        className={cn(
          "w-full border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-all",
          dragActive
            ? "border-blue-500 bg-blue-50/60"
            : "border-[rgba(0,0,0,0.08)] bg-[rgba(249,250,251,0.9)] hover:border-blue-400 hover:bg-blue-50/40",
          isUploading && "opacity-70 cursor-wait",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id="video-upload-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />

        <label htmlFor="video-upload-input" className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="text-sm font-medium text-gray-900">
            {isUploading ? "Uploading video..." : "Upload a video"}
          </div>
          <div className="text-xs text-gray-500">Drag &amp; drop your file hier, oder klicke zum Auswählen</div>
          <div className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-black text-white hover:bg-gray-900 transition-colors">
            {isUploading ? "Please wait..." : "Choose file"}
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={onOpenVideoGallery}
        className="text-xs text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
        disabled={isUploading}
      >
        Or pick a video from your gallery
      </button>
    </div>
  );
};

export default VideoUploadZone;
