import React, { useCallback, useState } from "react";
import { API_BASE_URL, isApiConfigured } from "@/services/api-config";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoUploadZoneProps {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete: () => void;
  onOpenVideoGallery: () => void;
}

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ onVideoLoad, onUploadComplete, onOpenVideoGallery }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isApiConfigured) {
        toast.error("API is not configured. Missing VITE_API_BASE_URL.");
        return;
      }

      try {
        setIsUploading(true);

        const uploadUrl = `${API_BASE_URL}/uploads`;
        console.log("[Upload] POST", uploadUrl);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("[Upload] Response:", data);

        if (!data || !data.videoId || !data.fileUrl) {
          throw new Error("Backend did not return videoId + fileUrl");
        }

        onVideoLoad(data.fileUrl, data.videoId);
        onUploadComplete();
        toast.success("Upload successful!");
      } catch (err) {
        console.error("[Upload] Error:", err);
        toast.error("Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [onVideoLoad, onUploadComplete],
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg">
      <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" id="video-upload-input" />

      <label htmlFor="video-upload-input" className="cursor-pointer text-center">
        <div className="text-gray-600 mb-2">Tap to upload a video</div>
        <Button disabled={isUploading}>{isUploading ? "Uploading..." : "Select File"}</Button>
      </label>

      <Button variant="ghost" onClick={onOpenVideoGallery} className="mt-4 text-blue-500 underline">
        Open Gallery
      </Button>
    </div>
  );
};

export default VideoUploadZone;
