import { useState, useRef, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isIOS } from "@/utils/ios-detection";
import { useLocale } from "@/lib/i18n";
import { registerUpload, uploadToS3 } from "@/services/video-api";

interface VideoUploadZoneProps {
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete?: () => void;
}

type UploadState = "idle" | "registering" | "uploading" | "processing";

const VideoUploadZone = ({ onVideoLoad, onUploadComplete }: VideoUploadZoneProps) => {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = uploadState !== "idle";

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setHasAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFile = async (file: File) => {
    console.log('[VideoUpload] File received:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (!file || !file.type.startsWith("video/")) {
      toast.error(t("upload.invalidFile"));
      return;
    }

    try {
      // Step 1: Register the upload with the backend
      setUploadState("registering");
      console.log('[VideoUpload] Registering upload with backend...');
      
      const { uploadUrl, videoId, fileUrl } = await registerUpload({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });
      
      console.log('[VideoUpload] Got presigned URL, videoId:', videoId);
      
      // Step 2: Upload to S3
      setUploadState("uploading");
      console.log('[VideoUpload] Uploading to S3...');
      
      await uploadToS3(uploadUrl, file);
      
      console.log('[VideoUpload] S3 upload complete');
      
      // Step 3: Show processing state briefly, then complete
      setUploadState("processing");
      
      // If we have a fileUrl from the response, use it directly
      if (fileUrl) {
        console.log('[VideoUpload] Using fileUrl from response:', fileUrl);
        onVideoLoad(fileUrl, videoId);
        toast.success(t("upload.success"));
        setUploadState("idle");
        onUploadComplete?.();
        return;
      }
      
      // Otherwise, for local preview while backend processes, use local blob
      // This provides immediate feedback while the video is being processed
      if (isIOS()) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          onVideoLoad(dataUrl, videoId);
          toast.success(t("upload.success"));
          setUploadState("idle");
          onUploadComplete?.();
        };
        reader.onerror = () => {
          toast.error(t("upload.error"));
          setUploadState("idle");
        };
        reader.readAsDataURL(file);
      } else {
        const url = URL.createObjectURL(file);
        onVideoLoad(url, videoId);
        toast.success(t("upload.success"));
        setUploadState("idle");
        onUploadComplete?.();
      }
      
    } catch (error) {
      console.error('[VideoUpload] Upload failed:', error);
      toast.error(error instanceof Error ? error.message : t("upload.error"));
      setUploadState("idle");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div 
      className="w-full min-h-screen-safe flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-neutral-50 to-neutral-100/80"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-[480px] flex flex-col items-center">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Large circular upload button */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "w-[112px] h-[112px] rounded-full flex items-center justify-center",
            "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
            "active:scale-[0.95] transition-all duration-100",
            "hover:shadow-[0_6px_32px_rgba(0,0,0,0.12)]",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            hasAnimated ? "animate-upload-button-enter" : "opacity-0",
            isDragging && "scale-105 shadow-[0_8px_40px_rgba(0,122,255,0.2)]"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-9 h-9 text-primary animate-spin" strokeWidth={1.5} />
          ) : (
            <Plus 
              className={cn(
                "w-9 h-9 text-primary",
                hasAnimated && "animate-upload-icon-pulse"
              )} 
              strokeWidth={1.5}
            />
          )}
        </button>

        {/* Title and subtitle */}
        <div className={cn(
          "mt-8 text-center",
          hasAnimated ? "animate-fade-in" : "opacity-0"
        )}>
          <h1 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
            {uploadState === "registering" && "Preparing upload..."}
            {uploadState === "uploading" && "Uploading..."}
            {uploadState === "processing" && "Processing..."}
            {uploadState === "idle" && t("upload.title")}
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            {uploadState === "registering" && "Connecting to server"}
            {uploadState === "uploading" && "Sending video to cloud"}
            {uploadState === "processing" && "Almost ready..."}
            {uploadState === "idle" && t("upload.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadZone;
