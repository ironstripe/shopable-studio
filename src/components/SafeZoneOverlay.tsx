import { cn } from "@/lib/utils";
import { SAFE_ZONE_MARGINS } from "@/utils/safe-zone";

interface SafeZoneOverlayProps {
  className?: string;
  visible?: boolean;
}

/**
 * SafeZoneOverlay uses SAFE_ZONE_MARGINS directly to ensure
 * the visual lines match the clamping logic exactly.
 */
const SafeZoneOverlay = ({ className, visible = true }: SafeZoneOverlayProps) => {
  // Use the same margins as the clamp function
  const rightPct = SAFE_ZONE_MARGINS.rightMargin * 100;
  const bottomPct = SAFE_ZONE_MARGINS.bottomMargin * 100;
  
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none z-[3] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Right safe zone - Dotted vertical line at (100% - rightMargin) from left */}
      <div
        className="absolute top-0 bottom-0"
        style={{ right: `${rightPct}%` }}
      >
        <div className="absolute inset-y-0 right-0 w-px border-r-2 border-dashed border-red-400/50" />
        {/* Small label */}
        <div className="absolute top-4 right-2 transform translate-x-full">
          <span className="text-[9px] text-red-400/60 font-medium whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
            Safe zone
          </span>
        </div>
      </div>

      {/* Bottom safe zone - Dotted horizontal line at (100% - bottomMargin) from top */}
      <div
        className="absolute left-0"
        style={{
          bottom: `${bottomPct}%`,
          right: `${rightPct}%`,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px border-b-2 border-dashed border-red-400/50" />
        {/* Small label */}
        <div className="absolute bottom-2 left-4 transform translate-y-full">
          <span className="text-[9px] text-red-400/60 font-medium whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
            Controls area
          </span>
        </div>
      </div>

      {/* Corner marker */}
      <div
        className="absolute"
        style={{
          right: `${rightPct}%`,
          bottom: `${bottomPct}%`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-red-400/40 transform translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
};

export default SafeZoneOverlay;
