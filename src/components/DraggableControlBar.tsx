import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableControlBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
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
  onSeek,
}: DraggableControlBarProps) => {
  const [offset, setOffset] = useState({ x: 16, y: -16 }); // Default: bottom-left (16px from edges)
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false); // Track if any actual dragging occurred
  const isScrubbingRef = useRef(false); // Track progress bar scrubbing
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time as m:ss
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle progress bar interaction (seek)
  const handleProgressInteraction = useCallback((clientX: number) => {
    if (!progressRef.current || duration <= 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    
    onSeek(newTime);
  }, [duration, onSeek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bar drag
    e.preventDefault();
    isScrubbingRef.current = true;
    handleProgressInteraction(e.clientX);
  }, [handleProgressInteraction]);

  const handleProgressTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent bar drag
    isScrubbingRef.current = true;
    if (e.touches[0]) {
      handleProgressInteraction(e.touches[0].clientX);
    }
  }, [handleProgressInteraction]);

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
      // Handle progress bar scrubbing
      if (isScrubbingRef.current) {
        handleProgressInteraction(e.clientX);
        return;
      }
      
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
      // Handle progress bar scrubbing
      if (isScrubbingRef.current) {
        const touch = e.touches[0];
        if (touch) {
          e.preventDefault();
          handleProgressInteraction(touch.clientX);
        }
        return;
      }
      
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
      // Handle progress bar scrub end
      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
        return;
      }
      
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
  }, [onPlayPause, handleProgressInteraction]);

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
      
      {/* Progress/Scrub Bar - enlarged for finger touch */}
      <div
        ref={progressRef}
        className="relative w-28 h-10 flex items-center cursor-pointer"
        onMouseDown={handleProgressMouseDown}
        onTouchStart={handleProgressTouchStart}
      >
        {/* Track background */}
        <div className="absolute left-0 right-0 h-1.5 bg-white/30 rounded-full" />
        
        {/* Progress fill */}
        <div 
          className="absolute left-0 h-1.5 bg-white rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Thumb indicator - larger for touch */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-md transform -translate-x-1/2 active:scale-125 transition-transform"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
      
      {/* Current time / duration */}
      <span className="text-white text-xs font-medium tabular-nums min-w-[70px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
};

export default DraggableControlBar;
