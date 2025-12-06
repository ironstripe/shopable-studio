import { useEffect } from "react";

interface TapIndicatorProps {
  x: number;
  y: number;
  onComplete: () => void;
  isMobile?: boolean;
  showLabel?: boolean;
}

const TapIndicator = ({ x, y, onComplete, isMobile = false, showLabel = true }: TapIndicatorProps) => {
  const size = isMobile ? 44 : 32;
  // Offset ripple 32px above touch point to be visible above thumb
  const yOffset = isMobile ? -32 : 0;

  useEffect(() => {
    const timer = setTimeout(onComplete, 320);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Haptic feedback on mount
  useEffect(() => {
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isMobile]);

  return (
    <div
      className="absolute pointer-events-none animate-tap-ripple-improved"
      style={{
        left: x - size / 2,
        top: y + yOffset - size / 2,
        width: size,
        height: size,
        zIndex: 8,
        // iOS Safari animation optimization
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      {/* Primary ripple - Blue */}
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: "hsla(215, 98%, 53%, 0.5)",
          border: "2px solid hsla(215, 98%, 53%, 0.8)",
          boxShadow: "0 0 12px hsla(215, 98%, 53%, 0.4)",
        }}
      />
      
      {/* Micro-label "Place hotspot" */}
      {showLabel && isMobile && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in">
          <span className="text-[10px] font-medium text-white/95 bg-black/70 px-2.5 py-1 rounded-full shadow-sm">
            Place hotspot
          </span>
        </div>
      )}
    </div>
  );
};

export default TapIndicator;
