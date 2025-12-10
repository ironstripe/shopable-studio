import React, { useCallback, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClickSelect = () => {
    // Manuell den versteckten Input triggern
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset, damit derselbe File erneut gewählt werden kann
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isApiConfigured) {
        console.error("[Upload] API not configured, missing VITE_API_BASE_URL?");
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
          console.error("[Upload] Non-OK response:", response.status);
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("[Upload] Response JSON:", data);

        // Erwartete Struktur: { videoId, fileUrl }
        if (!data || !data.videoId || !data.fileUrl) {
          console.error("[Upload] Invalid backend response:", data);
          throw new Error("Backend did not return videoId + fileUrl");
        }

        // Video in den Player laden
        onVideoLoad(data.fileUrl, data.videoId);
        // Liste refreshen
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
      {/* Verstecktes File-Input */}
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      <div className="text-center">
        <div className="text-gray-600 mb-2">Upload a video to start editing</div>
        <Button onClick={handleClickSelect} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Select video file"}
        </Button>
      </div>

      <Button variant="ghost" onClick={onOpenVideoGallery} className="mt-4 text-blue-500 underline">
        Open gallery
      </Button>
    </div>
  );
};

export default VideoUploadZone;
