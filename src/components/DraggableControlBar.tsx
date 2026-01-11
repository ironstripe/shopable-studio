import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableControlBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
}

/**
 * Compact, draggable control bar for video playback.
 * Positioned at bottom-left by default, can be dragged anywhere within the video.
 * Only covers its own area, allowing touch events to pass through elsewhere.
 */
const DraggableControlBar = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
}: DraggableControlBarProps) => {
  const [offset, setOffset] = useState({ x: 16, y: -16 }); // Default: bottom-left (16px from edges)
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false); // Track if any actual dragging occurred
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  // Format time as m:ss
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false; // Reset on new drag start
    startMouseRef.current = { x: clientX, y: clientY };
    startOffsetRef.current = { ...offset };
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  }, [offset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  }, [handleDragStart]);

  useEffect(() => {
    const DRAG_THRESHOLD = 5; // Pixels moved to count as drag, not tap
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startMouseRef.current.x;
      const deltaY = e.clientY - startMouseRef.current.y;
      
      // Check if we've exceeded drag threshold
      if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }
      
      setOffset({
        x: startOffsetRef.current.x + deltaX,
        y: startOffsetRef.current.y + deltaY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      const deltaX = touch.clientX - startMouseRef.current.x;
      const deltaY = touch.clientY - startMouseRef.current.y;
      
      // Check if we've exceeded drag threshold
      if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }
      
      setOffset({
        x: startOffsetRef.current.x + deltaX,
        y: startOffsetRef.current.y + deltaY,
      });
    };

    const handleEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        
        // If it was a tap (no dragging), toggle play/pause
        if (!hasDraggedRef.current) {
          onPlayPause();
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, [onPlayPause]);

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute z-[25] pointer-events-auto",
        "flex items-center gap-2 px-3 py-2",
        "bg-black/70 backdrop-blur-sm rounded-full",
        "border border-white/20 shadow-lg",
        "select-none touch-none",
        "transition-shadow hover:shadow-xl"
      )}
      style={{
        left: offset.x,
        bottom: -offset.y, // Convert to bottom positioning
        cursor: "grab",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Drag grip indicator */}
      <GripVertical className="w-4 h-4 text-white/50" />
      
      {/* Play/Pause icon - visual only, the whole bar triggers play/pause via parent */}
      <div className="flex items-center justify-center w-6 h-6">
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
        )}
      </div>
      
      {/* Current time / duration */}
      <span className="text-white text-xs font-medium tabular-nums min-w-[70px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
};

export default DraggableControlBar;
