import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface InVideoPlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  size?: "default" | "large";
}

/**
 * Large centered in-video play/pause button.
 * Auto-fades after 1.5s of inactivity when playing, always visible when paused.
 * Tap video → shows button, tap button → toggles play/pause.
 */
const InVideoPlayButton = ({ 
  isPlaying, 
  onToggle,
  size = "large" 
}: InVideoPlayButtonProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset visibility timer whenever playback state changes or button is shown
  const resetFadeTimer = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    setIsVisible(true);
    fadeTimerRef.current = setTimeout(() => {
      // Only auto-fade while playing
      if (isPlaying) {
        setIsVisible(false);
      }
    }, 1500);
  };

  // Show button when playback state changes
  useEffect(() => {
    resetFadeTimer();
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Handle container tap to show button before fading
  const handleContainerTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isVisible) {
      setIsVisible(true);
      resetFadeTimer();
    } else {
      onToggle();
      resetFadeTimer();
    }
  };

  const buttonSize = size === "large" ? "w-20 h-20" : "w-14 h-14";
  const iconSize = size === "large" ? "w-10 h-10" : "w-6 h-6";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-[25] pointer-events-auto"
      onClick={handleContainerTap}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleContainerTap(e);
      }}
    >
      <button
        className={cn(
          buttonSize,
          "rounded-full flex items-center justify-center transition-all duration-300",
          "bg-black/50 backdrop-blur-sm text-white shadow-2xl",
          "hover:bg-black/60 active:scale-95",
          "border-2 border-white/30",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className={cn(iconSize)} fill="currentColor" />
        ) : (
          <Play className={cn(iconSize, "ml-1")} fill="currentColor" />
        )}
      </button>
    </div>
  );
};

export default InVideoPlayButton;
