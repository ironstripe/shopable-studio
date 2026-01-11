import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface InVideoPlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

/**
 * Minimal in-video play/pause button.
 * Auto-fades after 1.5s of inactivity, reappears on tap.
 */
const InVideoPlayButton = ({ isPlaying, onToggle }: InVideoPlayButtonProps) => {
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

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[25] pointer-events-auto"
      onClick={handleContainerTap}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleContainerTap(e);
      }}
    >
      <button
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-black/60 backdrop-blur-sm text-white shadow-lg",
          "hover:bg-black/70 active:scale-95",
          "border border-white/20",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" fill="currentColor" />
        ) : (
          <Play className="w-6 h-6 ml-1" fill="currentColor" />
        )}
      </button>
    </div>
  );
};

export default InVideoPlayButton;
