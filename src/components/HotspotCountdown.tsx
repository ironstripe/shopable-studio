import { useState, useEffect } from "react";
import { HotspotCountdown as CountdownConfig } from "@/types/video";
import { cn } from "@/lib/utils";

interface HotspotCountdownProps {
  config: CountdownConfig;
  isPreviewMode: boolean;
  scale?: number;
  className?: string;
}

const HotspotCountdown = ({
  config,
  isPreviewMode,
  scale = 1,
  className,
}: HotspotCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Simulated countdown for preview (counts down from a demo value)
  useEffect(() => {
    if (!isPreviewMode || !config.active) {
      return;
    }

    // Start with demo time of 2:34:12 and count down
    let totalSeconds = 2 * 3600 + 34 * 60 + 12;

    const updateTimer = () => {
      if (totalSeconds <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      totalSeconds -= 1;
      setTimeLeft({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    // Initial set
    setTimeLeft({
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    });

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isPreviewMode, config.active]);

  // Smart time formatting: MM:SS if < 1 hour, HH:MM:SS otherwise
  const formatTime = () => {
    if (isExpired) return "Ended";
    
    // Static display for edit mode
    if (!isPreviewMode) {
      return "02:34";
    }
    
    if (!timeLeft) return "00:00";
    
    if (timeLeft.hours > 0) {
      return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
    }
    return `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  };

  if (!config.active) return null;

  const isLight = config.style === "light";
  const isBold = config.style === "bold";

  // Position-based transform origin
  const getTransformOrigin = () => {
    switch (config.position) {
      case "corner":
        return "top right";
      case "above":
        return "bottom center";
      case "below":
        return "top center";
      default:
        return "center";
    }
  };

  return (
    <div 
      className={cn(
        "pointer-events-none flex items-center justify-center whitespace-nowrap",
        className
      )}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: getTransformOrigin(),
      }}
    >
      {/* Light style: Semi-transparent white pill with dark text */}
      {isLight && (
        <div 
          className="flex items-center gap-1 px-2.5 py-1"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <span 
            className="text-[12px] font-medium"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(0, 0, 0, 0.75)',
            }}
          >
            {isExpired ? formatTime() : `Ends in ${formatTime()}`}
          </span>
        </div>
      )}

      {/* Bold style: Dark prominent pill with white text */}
      {isBold && (
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          }}
        >
          <span 
            className="text-[14px] font-semibold text-white"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {isExpired ? formatTime() : `Ends in ${formatTime()}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default HotspotCountdown;
