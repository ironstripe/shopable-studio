import { useState, useRef, useEffect } from "react";
import { Plus, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoUploadZoneProps {
  onVideoLoad: (src: string) => void;
}

const VideoUploadZone = ({ onVideoLoad }: VideoUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setHasAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isValidVideoUrl = (url: string): boolean => {
    const videoUrlPatterns = [
      /youtube\.com\/watch\?v=/i,
      /youtu\.be\//i,
      /vimeo\.com\//i,
      /\.(mp4|webm|mov|ogg)(\?.*)?$/i,
    ];
    return videoUrlPatterns.some((pattern) => pattern.test(url));
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      onVideoLoad(url);
      toast.success("Video loaded successfully");
    } else {
      toast.error("Please select a valid video file");
    }
  };

  const handleUrlSubmit = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    if (isValidVideoUrl(trimmedUrl)) {
      onVideoLoad(trimmedUrl);
      toast.success("Video URL loaded successfully");
      setUrlInput("");
    } else {
      toast.error("Please enter a valid video URL (YouTube, Vimeo, or direct MP4 link)");
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
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
  };

  return (
    <div 
      className="w-full min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-neutral-50 to-neutral-100/80"
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
          className={cn(
            "w-[112px] h-[112px] rounded-full flex items-center justify-center",
            "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
            "active:scale-[0.95] transition-all duration-100",
            "hover:shadow-[0_6px_32px_rgba(0,0,0,0.12)]",
            hasAnimated ? "animate-upload-button-enter" : "opacity-0",
            isDragging && "scale-105 shadow-[0_8px_40px_rgba(0,122,255,0.2)]"
          )}
        >
          <Plus 
            className={cn(
              "w-9 h-9 text-primary",
              hasAnimated && "animate-upload-icon-pulse"
            )} 
            strokeWidth={1.5}
          />
        </button>

        {/* Title and subtitle */}
        <div className={cn(
          "mt-8 text-center",
          hasAnimated ? "animate-fade-in" : "opacity-0"
        )}>
          <h1 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
            Upload your video
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            Tap to upload or paste a link.
          </p>
        </div>

        {/* Modern divider */}
        <div className={cn(
          "mt-8 flex items-center justify-center",
          hasAnimated ? "animate-fade-in" : "opacity-0"
        )} style={{ animationDelay: "100ms" }}>
          <span className="text-sm text-neutral-400 font-light">
            — or paste link —
          </span>
        </div>

        {/* URL input field */}
        <div className={cn(
          "mt-6 w-full",
          hasAnimated ? "animate-fade-in" : "opacity-0"
        )} style={{ animationDelay: "150ms" }}>
          <div className={cn(
            "flex items-center gap-3 h-12 px-4",
            "bg-white/80 rounded-[14px] border border-neutral-200/80",
            "shadow-sm transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white focus-within:border-primary/30"
          )}>
            <Link className="w-[18px] h-[18px] text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Paste a video URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-[15px] outline-none bg-transparent text-neutral-800 placeholder:text-neutral-400"
            />
            {urlInput && (
              <button
                onClick={handleUrlSubmit}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
              >
                Load
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadZone;
