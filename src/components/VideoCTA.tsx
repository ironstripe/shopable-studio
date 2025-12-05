import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { VideoCTA as VideoCTAType, VideoCTAStyle } from "@/types/video";
import { GripVertical, ArrowRight } from "lucide-react";
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

  // Calculate visibility based on enabled state, type, timing, and edit state
  useEffect(() => {
    // Don't show if CTA is disabled
    if (!videoCTA.enabled) {
      setIsVisible(false);
      return;
    }

    // Don't show if type is full-video-link (handled separately in VideoPlayer)
    if (videoCTA.type === "full-video-link") {
      setIsVisible(false);
      return;
    }

    // In edit mode, always show if URL is set and enabled
    if (isEditMode) {
      setIsVisible(!!videoCTA.url && videoCTA.enabled);
      return;
    }

    // In preview mode, use timing logic
    const timing = videoCTA.timing;
    
    if (timing.mode === "entire-video") {
      setIsVisible(isPlaying);
      return;
    }

    if (timing.mode === "end-only") {
      const timeRemaining = videoDuration - currentTime;
      setIsVisible(timeRemaining <= 3 && timeRemaining > 0 && isPlaying);
      return;
    }

    if (timing.mode === "fade-in-at" && timing.fadeInAt !== undefined) {
      setIsVisible(currentTime >= timing.fadeInAt && isPlaying);
      return;
    }

    // Fallback to old mode for backward compatibility
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
  }, [videoCTA.enabled, videoCTA.type, videoCTA.timing, videoCTA.mode, currentTime, videoDuration, isPlaying, isEditMode, videoCTA.url]);

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

  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    // If URL doesn't start with http:// or https://, add https://
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleClick = () => {
    if (videoCTA.url && !isEditMode) {
      window.open(normalizeUrl(videoCTA.url), "_blank");
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

  const getStyleClasses = (style: VideoCTAStyle) => {
    const baseClasses = "transition-all duration-150 flex items-center gap-2";
    
    switch (style) {
      // eCommerce styles
      case "ecommerce-solid-white":
        return cn(baseClasses, "bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:shadow-md font-medium text-[13px]");
      case "ecommerce-solid-dark":
        return cn(baseClasses, "bg-[#1A1A1A] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md font-medium text-[13px]");
      case "ecommerce-pill-accent":
        return cn(baseClasses, "bg-[#3B82F6] text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md font-medium text-[13px]");
      
      // Luxury styles
      case "luxury-ghost":
        return cn(baseClasses, "bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white/10 font-light text-[13px]");
      case "luxury-underline":
        return cn(baseClasses, "bg-transparent text-white font-light text-[14px] border-b border-white/50 hover:border-white pb-1");
      case "luxury-corner-badge":
        return cn(baseClasses, "bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded text-[11px] font-light");
      
      // Editorial styles
      case "editorial-bottom-ribbon":
        return cn(baseClasses, "bg-black/80 backdrop-blur-sm text-white px-6 py-3 w-full justify-center text-[14px] font-normal");
      case "editorial-floating-label":
        return cn(baseClasses, "bg-white/90 backdrop-blur-sm text-black px-3 py-1.5 rounded text-[11px] font-medium shadow-sm");
      case "editorial-top-badge":
        return cn(baseClasses, "bg-black text-white px-3 py-1.5 rounded-sm text-[11px] font-medium uppercase tracking-wide");
      
      // Minimal styles
      case "minimal-tiny-pill":
        return cn(baseClasses, "bg-white text-black px-3 py-1 rounded-full text-[11px] font-medium shadow-sm");
      case "minimal-dot-label":
        return cn(baseClasses, "bg-transparent text-white text-[12px] font-light");
      case "minimal-underline-text":
        return cn(baseClasses, "bg-transparent text-white text-[13px] font-light underline hover:no-underline");
      
      default:
        return cn(baseClasses, "bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:shadow-md font-medium text-[13px]");
    }
  };

  const ctaElement = (
    <div
      ref={ctaRef}
      style={{
        position: "fixed",
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
      }}
      className="animate-cta-intro"
    >
      <button
        onClick={handleClick}
        onMouseDown={handleDragStart}
        className={cn(
          getStyleClasses(videoCTA.style),
          isEditMode && "border-2 border-dashed border-[#3B82F6] cursor-grab",
          isDragging && "cursor-grabbing shadow-lg"
        )}
      >
        {isEditMode && (
          <GripVertical className="w-3.5 h-3.5 text-[#6B7280]" />
        )}
        {videoCTA.style === "minimal-dot-label" && (
          <span className="w-2 h-2 rounded-full bg-white" />
        )}
        {videoCTA.label}
        {(videoCTA.style === "luxury-underline" || videoCTA.style === "minimal-underline-text") && (
          <ArrowRight className="w-3 h-3" />
        )}
        {isEditMode && (
          <span className="text-[10px] text-[#9CA3AF]">✎</span>
        )}
      </button>
    </div>
  );

  return createPortal(ctaElement, document.body);
};

export default VideoCTA;
