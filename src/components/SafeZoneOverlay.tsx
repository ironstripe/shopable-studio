import { SafeZone } from "@/types/video";
import { cn } from "@/lib/utils";

interface SafeZoneOverlayProps {
  safeZone: SafeZone;
  className?: string;
}

const SafeZoneOverlay = ({ safeZone, className }: SafeZoneOverlayProps) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-[3]", className)}>
      {/* Right safe zone - Platform icons area */}
      <div
        className="absolute top-0 right-0 bottom-0 bg-red-500/10 border-l border-dashed border-red-400/40"
        style={{ width: `${safeZone.right * 100}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-red-400/70 font-medium rotate-90 whitespace-nowrap">
            Platform UI
          </span>
        </div>
        {/* Diagonal stripes pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(239, 68, 68, 0.1) 8px,
              rgba(239, 68, 68, 0.1) 16px
            )`,
          }}
        />
      </div>

      {/* Bottom safe zone - Captions and controls area */}
      <div
        className="absolute left-0 bottom-0 bg-red-500/10 border-t border-dashed border-red-400/40"
        style={{
          height: `${safeZone.bottom * 100}%`,
          right: `${safeZone.right * 100}%`, // Don't overlap with right zone
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-red-400/70 font-medium whitespace-nowrap">
            Captions & Controls
          </span>
        </div>
        {/* Diagonal stripes pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              rgba(239, 68, 68, 0.1) 8px,
              rgba(239, 68, 68, 0.1) 16px
            )`,
          }}
        />
      </div>

      {/* Corner overlap indicator */}
      <div
        className="absolute bg-red-500/15"
        style={{
          right: 0,
          bottom: 0,
          width: `${safeZone.right * 100}%`,
          height: `${safeZone.bottom * 100}%`,
        }}
      />
    </div>
  );
};

export default SafeZoneOverlay;
