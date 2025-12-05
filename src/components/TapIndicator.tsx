import { useEffect } from "react";

interface TapIndicatorProps {
  x: number;
  y: number;
  onComplete: () => void;
  isMobile?: boolean;
}

const TapIndicator = ({ x, y, onComplete, isMobile = false }: TapIndicatorProps) => {
  const size = isMobile ? 36 : 28;

  useEffect(() => {
    const timer = setTimeout(onComplete, 180);
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
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      />
    </div>
  );
};

export default TapIndicator;
