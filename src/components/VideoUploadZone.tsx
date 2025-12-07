import { useState, useRef, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { isIOS } from "@/utils/ios-detection";
import { useLocale } from "@/lib/i18n";

interface VideoUploadZoneProps {
  onVideoLoad: (src: string) => void;
}

const VideoUploadZone = ({ onVideoLoad }: VideoUploadZoneProps) => {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setHasAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFile = (file: File) => {
    console.log('[VideoUpload] File received:', file.name, 'Type:', file.type, 'Size:', file.size);
    console.log('[VideoUpload] isIOS() result:', isIOS());
    console.log('[VideoUpload] User Agent:', navigator.userAgent);
    
    if (!file || !file.type.startsWith("video/")) {
      toast.error(t("upload.invalidFile"));
      return;
    }

    // iOS Safari/Chrome: use FileReader to create data URL (blob URLs cause black screen)
    // Other browsers: use createObjectURL (faster)
    if (isIOS()) {
      console.log('[VideoUpload] iOS detected - using FileReader for data URL');
      setIsLoading(true);
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setIsLoading(false);
        const dataUrl = reader.result as string;
        console.log('[VideoUpload] Data URL created, length:', dataUrl.length);
        onVideoLoad(dataUrl);
        toast.success(t("upload.success"));
      };
      
      reader.onerror = () => {
        setIsLoading(false);
        console.error('[VideoUpload] FileReader error:', reader.error);
        toast.error(t("upload.error"));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log('[VideoUpload] Loading progress:', percent + '%');
        }
      };
      
      reader.readAsDataURL(file);
    } else {
      // Standard approach for desktop browsers
      const url = URL.createObjectURL(file);
      console.log('[VideoUpload] Blob URL created:', url);
      onVideoLoad(url);
      toast.success(t("upload.success"));
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
            {isLoading ? t("upload.loading") : t("upload.title")}
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            {isLoading ? t("upload.loadingHint") : t("upload.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadZone;
