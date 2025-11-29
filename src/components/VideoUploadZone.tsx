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

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    if (isValidVideoUrl(pastedText)) {
      setUrlInput(pastedText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
  };

  return (
    <div className="w-full aspect-video flex items-center justify-center p-8">
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center",
          "bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300",
          "transition-all duration-300 cursor-pointer",
          "hover:border-primary hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(14,118,253,0.15)]",
          isDragging && "border-primary bg-primary/5 shadow-[0_0_30px_rgba(14,118,253,0.25)] scale-[1.02]"
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

        <div className="flex flex-col items-center gap-6 pointer-events-none">
          <div className={cn(
            "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center",
            "transition-all duration-300",
            isDragging && "bg-primary/20 scale-110"
          )}>
            <Plus className={cn(
              "w-10 h-10 text-primary transition-transform duration-300",
              isDragging && "scale-125"
            )} />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Upload your video
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Drag & drop a file, paste a link, or browse your computer.
            </p>
          </div>

          {/* URL Input */}
          <div
            className="pointer-events-auto mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-4 py-3 w-96 max-w-full hover:border-primary transition-colors">
              <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Or paste a video URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
              />
              {urlInput && (
                <button
                  onClick={handleUrlSubmit}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/10"
                >
                  Load
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadZone;
