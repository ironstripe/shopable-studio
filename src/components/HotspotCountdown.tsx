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

  // Calculate time left for preview mode
  useEffect(() => {
    if (!isPreviewMode || !config.active || config.mode !== "fixed-end" || !config.endTime) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(config.endTime!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isPreviewMode, config.active, config.endTime, config.mode]);

  // Format time display
  const formatTime = () => {
    if (isExpired) return "Sale ended";
    
    // Static display for edit mode
    if (!isPreviewMode) {
      return "02:34:12";
    }
    
    // Evergreen mode shows static time
    if (config.mode === "evergreen") {
      return "02:34:12";
    }
    
    if (!timeLeft) return "00:00:00";
    return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  };

  if (!config.active) return null;

  const isLight = config.style === "light";
  const isBold = config.style === "bold";

  return (
    <div 
      className={cn(
        "pointer-events-none flex items-center justify-center whitespace-nowrap",
        className
      )}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: config.position === "top-right" ? "top right" : "center",
      }}
    >
      {isLight && (
        <span 
          className="text-[13px] font-semibold"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'rgba(0,0,0,0.75)',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          }}
        >
          {isExpired ? formatTime() : `Ends in ${formatTime()}`}
        </span>
      )}

      {isBold && (
        <div 
          className="flex items-center gap-1 px-2 py-1"
          style={{
            background: 'rgba(0,0,0,0.70)',
            borderRadius: '8px',
            padding: '4px 8px',
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