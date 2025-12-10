// src/components/VideoUploadZone.tsx

import React, { useCallback, useState, DragEvent, ChangeEvent } from "react";
import { API_BASE_URL, isApiConfigured } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, Film, Images } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoUploadZoneProps = {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete?: () => void;
  onOpenVideoGallery?: () => void;
};

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ onVideoLoad, onUploadComplete, onOpenVideoGallery }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isDragging) setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please drop a video file.");
      return;
    }

    uploadFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }

    uploadFile(file);
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isApiConfigured || !API_BASE_URL) {
        toast.error("Upload API base URL is not configured.");
        console.error("[VideoUploadZone] Missing or invalid API_BASE_URL:", API_BASE_URL);
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadUrl = `${API_BASE_URL.replace(/\/+$/, "")}/uploads`;
        console.log("[VideoUploadZone] Uploading to:", uploadUrl);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("[VideoUploadZone] Upload failed:", response.status, text);
          toast.error("Upload failed. Please try again.");
          return;
        }

        let json: any = {};
        try {
          json = await response.json();
        } catch {
          json = {};
        }

        const videoId: string | undefined = json.videoId || json.id || json.video_id || undefined;

        if (!videoId) {
          console.warn("[VideoUploadZone] Upload succeeded, but no videoId was returned. Response:", json);
          toast.warning("Upload succeeded, but backend did not return a video ID.");
        }

        // Local preview for the editor session
        const objectUrl = URL.createObjectURL(file);

        onVideoLoad(objectUrl, videoId);
        onUploadComplete?.();

        toast.success("Video uploaded successfully.");
      } catch (error) {
        console.error("[VideoUploadZone] Unexpected upload error:", error);
        toast.error("Unexpected error during upload.");
      } finally {
        setIsUploading(false);
      }
    },
    [onVideoLoad, onUploadComplete],
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center transition-all",
          isDragging ? "border-blue-500 bg-blue-50/60" : "border-[rgba(0,0,0,0.08)] bg-[rgba(249,250,251,0.9)]",
          isUploading && "opacity-70 pointer-events-none",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
          <UploadCloud className="w-7 h-7 text-blue-500" />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload a video to start</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Drag &amp; drop a video file here, or choose one from your device. You can also pick an existing upload from
          your gallery.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <label>
            <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            <Button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-medium"
              disabled={isUploading}
            >
              <Film className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload from device"}
            </Button>
          </label>

          {onOpenVideoGallery && (
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-medium border-[rgba(0,0,0,0.08)]"
              onClick={onOpenVideoGallery}
              disabled={isUploading}
            >
              <Images className="w-4 h-4" />
              Choose from gallery
            </Button>
          )}
        </div>

        {!isApiConfigured && (
          <p className="mt-4 text-xs text-amber-600">
            Backend URL is not fully configured. Check VITE_API_BASE_URL in your environment.
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoUploadZone;
