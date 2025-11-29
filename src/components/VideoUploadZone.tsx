import { useState, useRef } from "react";
import { Plus, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoUploadZoneProps {
  onVideoLoad: (src: string) => void;
}

const VideoUploadZone = ({ onVideoLoad }: VideoUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="w-full aspect-video flex flex-col items-center justify-center py-20 px-8 animate-upload-enter">
      {/* Upload Area - File picker and drag & drop */}
      <div
        className={cn(
          "w-full flex-1 flex flex-col items-center justify-center",
          "bg-white rounded-3xl border-2 border-dashed border-gray-300",
          "transition-all duration-200 cursor-pointer shadow-sm",
          "hover:border-[rgba(0,122,255,0.8)] hover:bg-gray-50 hover:shadow-[0_0_12px_rgba(0,122,255,0.25)]",
          isDragging && "border-[rgba(0,122,255,0.8)] bg-primary/5 shadow-[0_0_12px_rgba(0,122,255,0.25)]"
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-8">
          <div className={cn(
            "w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center",
            "transition-all duration-200 shadow-sm",
            isDragging && "bg-primary/15 scale-110 shadow-md"
          )}>
            <Plus className={cn(
              "w-12 h-12 text-primary transition-transform duration-200 animate-icon-pulse",
              isDragging && "scale-125"
            )} />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Upload your video
            </h2>
            <p className="text-[#505050] text-base max-w-md font-light">
              Drag & drop a file or browse your computer.
            </p>
          </div>
        </div>
      </div>

      {/* OR Separator */}
      <div className="flex items-center justify-center my-6">
        <div className="h-px bg-gray-200 w-12"></div>
        <span className="mx-4 text-sm text-gray-400 font-light tracking-wide">OR</span>
        <div className="h-px bg-gray-200 w-12"></div>
      </div>

      {/* URL Input - Always visible */}
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3.5 hover:border-[rgba(0,122,255,0.8)] hover:bg-white transition-all duration-200 shadow-sm">
          <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Paste a video URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400 font-light"
          />
          {urlInput && (
            <button
              onClick={handleUrlSubmit}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
            >
              Load
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadZone;
