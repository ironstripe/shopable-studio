// src/components/VideoUploadZone.tsx

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// nutzt deine existierenden Services
import { registerUpload, uploadToS3 } from "@/services/video-api";
import { isApiConfigured } from "@/services/api-config";

type VideoUploadZoneProps = {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete: () => void;
  onOpenVideoGallery?: () => void;
};

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ onVideoLoad, onUploadComplete, onOpenVideoGallery }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isApiConfigured) {
        toast.error("API is not configured. Please set VITE_API_BASE_URL in your environment.");
        return;
      }

      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a video file.");
        return;
      }

      console.log("[Upload] Starting S3 pre-signed upload", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      setIsUploading(true);

      try {
        // 1) Registrierung beim Backend: NUR Metadaten
        const registerResponse = await registerUpload({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        });

        const { uploadUrl, videoId, fileUrl } = registerResponse || {};

        if (!uploadUrl || !videoId) {
          console.error("[Upload] Invalid registerUpload response", registerResponse);
          throw new Error("Backend did not return uploadUrl + videoId");
        }

        console.log("[Upload] Got presigned URL + videoId", {
          videoId,
          uploadUrl,
        });

        // 2) Datei direkt nach S3 hochladen
        await uploadToS3(uploadUrl, file);
        console.log("[Upload] S3 upload successful");

        // 3) finale abspielbare URL bestimmen
        const finalUrl = fileUrl || uploadUrl.split("?")[0];

        if (!finalUrl) {
          throw new Error("Could not determine final video URL after S3 upload.");
        }

        console.log("[Upload] Using final video URL", finalUrl);

        onVideoLoad(finalUrl, videoId);
        onUploadComplete();
        toast.success("Upload successful");
      } catch (err) {
        console.error("[Upload] Error:", err);

        if (err instanceof TypeError) {
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

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      await uploadFile(file);
    },
    [uploadFile],
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={[
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-blue-500 bg-blue-50/60" : "border-gray-200 bg-gray-50",
        ].join(" ")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleBrowseClick}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drop your video here</p>
            <p className="text-xs text-muted-foreground mt-1">MP4, MOV, or WebM</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <Button
              type="button"
              size="sm"
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              {isUploading ? "Uploading..." : "Choose file"}
            </Button>
            {onOpenVideoGallery && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVideoGallery();
                }}
              >
                <Images className="w-4 h-4 mr-1" />
                Open gallery
              </Button>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
      </div>

    </div>
  );
};

export default VideoUploadZone;
