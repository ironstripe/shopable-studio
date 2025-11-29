import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { VideoCTA as VideoCTAType } from "@/types/video";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCTAProps {
  videoCTA: VideoCTAType;
  currentTime: number;
  videoDuration: number;
  containerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
  isEditMode?: boolean;
  onPositionUpdate?: (x: number, y: number) => void;
}

const VideoCTA = ({ videoCTA, currentTime, videoDuration, containerRef, isPlaying, isEditMode = false, onPositionUpdate }: VideoCTAProps) => {
  const [position, setPosition] = useState({ bottom: 24, right: 24 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLDivElement>(null);

  // Calculate visibility based on mode and edit state
  useEffect(() => {
    // In edit mode, always show if URL is set
    if (isEditMode) {
      setIsVisible(!!videoCTA.url);
      return;
    }

    // In preview mode, use existing logic
    if (videoCTA.mode === "off") {
      setIsVisible(false);
      return;
    }

    if (videoCTA.mode === "always-visible") {
      setIsVisible(isPlaying);
      return;
    }

    if (videoCTA.mode === "show-at-end") {
      const timeRemaining = videoDuration - currentTime;
      setIsVisible(timeRemaining <= 3 && timeRemaining > 0 && isPlaying);
      return;
    }
  }, [videoCTA.mode, currentTime, videoDuration, isPlaying, isEditMode, videoCTA.url]);

  // Calculate position based on video container and stored position
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Use stored position (0-1 range) or default to bottom-right
      const x = videoCTA.position?.x ?? 0.85;
      const y = videoCTA.position?.y ?? 0.85;

      setPosition({
        bottom: window.innerHeight - rect.top - (y * rect.height),
        right: window.innerWidth - rect.left - (x * rect.width),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [containerRef, videoCTA.position]);

  const handleClick = () => {
    if (videoCTA.url && !isEditMode) {
      window.open(videoCTA.url, "_blank");
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isEditMode || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = videoCTA.position?.x ?? 0.85;
    const y = videoCTA.position?.y ?? 0.85;
    
    const currentX = x * rect.width;
    const currentY = y * rect.height;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    setDragOffset({
      x: clickX - currentX,
      y: clickY - currentY,
    });
    
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const handleDragMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(1, (e.clientX - rect.left - dragOffset.x) / rect.width));
      const newY = Math.max(0, Math.min(1, (e.clientY - rect.top - dragOffset.y) / rect.height));
      
      if (onPositionUpdate) {
        onPositionUpdate(newX, newY);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging, dragOffset, onPositionUpdate]);

  if (!isVisible || !videoCTA.url) return null;

  const ctaElement = (
    <div
      ref={ctaRef}
      style={{
        position: "fixed",
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
      }}
      className="animate-fade-in"
    >
      <button
        onClick={handleClick}
        onMouseDown={handleDragStart}
        className={cn(
          "bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 text-neutral-900 text-[13px] font-medium backdrop-blur-sm flex items-center gap-2",
          isEditMode && "border-2 border-dashed border-[#3B82F6] cursor-grab",
          isDragging && "cursor-grabbing shadow-lg"
        )}
      >
        {isEditMode && (
          <GripVertical className="w-3.5 h-3.5 text-[#6B7280]" />
        )}
        {videoCTA.label}
        {isEditMode && (
          <span className="text-[10px] text-[#9CA3AF]">✎</span>
        )}
      </button>
    </div>
  );

  return createPortal(ctaElement, document.body);
};

export default VideoCTA;
