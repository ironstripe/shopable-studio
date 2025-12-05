import { useEffect } from "react";

interface TapIndicatorProps {
  x: number;
  y: number;
  onComplete: () => void;
  isMobile?: boolean;
}

const TapIndicator = ({ x, y, onComplete, isMobile = false }: TapIndicatorProps) => {
  const size = isMobile ? 40 : 28;

  useEffect(() => {
    const timer = setTimeout(onComplete, 280);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none animate-tap-ripple"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        zIndex: 8,
        // iOS Safari animation optimization
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.55)",
          border: "1.5px solid rgba(255, 255, 255, 0.65)",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.25)",
        }}
      />
    </div>
  );
};

export default TapIndicator;
