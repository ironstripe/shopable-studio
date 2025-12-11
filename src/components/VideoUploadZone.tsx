// src/components/VideoUploadZone.tsx

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_BASE_URL, isApiConfigured } from "@/services/api-config";

type VideoUploadZoneProps = {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete: () => void;
  onOpenVideoGallery: () => void;
};

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ onVideoLoad, onUploadComplete, onOpenVideoGallery }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFileClick = () => {
    if (!isApiConfigured) {
      toast.error("Upload API base URL is not configured.");
      console.error("[Upload] API is not configured. Check VITE_API_BASE_URL or api-config.ts");
      return;
    }
    fileInputRef.current?.click();
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isApiConfigured) {
        toast.error("Upload API base URL is not configured.");
        console.error("[Upload] API is not configured. Check VITE_API_BASE_URL or api-config.ts");
        return;
      }

      const trimmedBase = API_BASE_URL.replace(/\/$/, "");
      const uploadUrl = `${trimmedBase}/uploads`;

      console.log("[Upload] Starting upload to:", uploadUrl);
      console.log("[Upload] File:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);

      try {
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        // HTTP-Fehler: Body auslesen & loggen
        if (!response.ok) {
          let errorMessage = `Upload failed with status ${response.status}`;

          try {
            const errorData = await response.json();
            console.error("[Upload] Error response JSON:", errorData);
            if (errorData && typeof errorData === "object") {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } catch {
            try {
              const text = await response.text();
              console.error("[Upload] Error response text:", text);
            } catch {
              console.error("[Upload] Failed to read error response");
            }
          }

          throw new Error(errorMessage);
        }

        // Erfolgsfall: JSON parsen
        let data: any;
        try {
          data = await response.json();
        } catch (err) {
          console.error("[Upload] Failed to parse JSON response:", err);
          throw new Error("Backend returned invalid JSON");
        }

        console.log("[Upload] Response JSON:", data);

        if (!data) {
          throw new Error("Backend returned empty response");
        }

        // Flexible Auswertung: akzeptiere unterschiedliche Feldnamen
        const videoId: string | undefined = data.videoId || data.id;
        const fileUrl: string | undefined = data.fileUrl || data.originalVideoKey || data.renderedVideoKey;

        if (!fileUrl) {
          console.error("[Upload] Missing video URL in response:", data);
          throw new Error("Backend did not return a valid video URL (fileUrl, originalVideoKey, or renderedVideoKey)");
        }

        // Falls nur ein S3-Key zurückkommt und keine vollständige URL:
        let finalUrl = fileUrl;
        if (!fileUrl.startsWith("http")) {
          // hier musst du bei Bedarf deinen S3-Public-URL-Präfix anpassen
          // Beispiel:
          // const bucketBase = "https://shopable-prod-media.s3.eu-west-1.amazonaws.com/";
          // finalUrl = bucketBase + fileUrl.replace(/^\/+/, "");
          console.warn("[Upload] fileUrl looks like a key, not a full URL:", fileUrl);
        }

        console.log("[Upload] Using final video URL:", finalUrl);

        onVideoLoad(finalUrl, videoId);
        onUploadComplete();
        toast.success("Upload successful");
      } catch (err) {
        console.error("[Upload] Error:", err);

        if (err instanceof TypeError) {
          // Typischerweise Netzwerk / CORS / DNS
          toast.error("Network error. Check API configuration, CORS, or backend availability.");
        } else if (err instanceof Error) {
          toast.error(`Upload failed: ${err.message}`);
        } else {
          toast.error("Upload failed.");
        }
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onVideoLoad, onUploadComplete],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
      <div
        className={[
          "w-full border-2 border-dashed rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center transition-colors",
          isDragging ? "border-blue-500 bg-blue-50/60" : "border-gray-200 bg-gray-50/60",
        ].join(" ")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p className="text-sm text-gray-700 mb-2 font-medium">Upload a video to start adding hotspots</p>
        <p className="text-xs text-gray-500 mb-4">Drag &amp; drop your MP4 here or choose a file</p>

        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
          <Button type="button" onClick={handleSelectFileClick} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Select video"}
          </Button>
          <Button type="button" variant="outline" onClick={onOpenVideoGallery} disabled={isUploading}>
            Open gallery
          </Button>
        </div>

        {!isApiConfigured && (
          <p className="mt-3 text-xs text-red-500">
            API base URL is not configured. Set VITE_API_BASE_URL for uploads.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default VideoUploadZone;
