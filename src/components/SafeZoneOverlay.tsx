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
  // Safe zone boundaries (percentage from LEFT/TOP edges):
  // - Left boundary: leftMargin (0% = at left edge)
  // - Right boundary: (1 - rightMargin) = 85% from left (not "at 15% from left")
  // - Top boundary: topMargin (0% = at top edge)  
  // - Bottom boundary: (1 - bottomMargin) = 82% from top
  
  // For CSS positioning, we use "left" property to position FROM the left edge
  const rightBoundaryFromLeft = (1 - SAFE_ZONE_MARGINS.rightMargin) * 100; // 85%
  const bottomBoundaryFromTop = (1 - SAFE_ZONE_MARGINS.bottomMargin) * 100; // 82%
  
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none z-[3] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Right safe zone - Vertical line at 85% from left (15% from right) */}
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{ left: `${rightBoundaryFromLeft}%` }}
      >
        <div className="absolute inset-y-0 left-0 w-px border-l-2 border-dashed border-red-400/50" />
        {/* Small label */}
        <div className="absolute top-4 left-2">
          <span className="text-[9px] text-red-400/60 font-medium whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
            Safe zone
          </span>
        </div>
      </div>

      {/* Bottom safe zone - Horizontal line at 82% from top (18% from bottom) */}
      <div
        className="absolute left-0 h-px"
        style={{
          top: `${bottomBoundaryFromTop}%`,
          right: `${100 - rightBoundaryFromLeft}%`, // Stop at right boundary
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px border-t-2 border-dashed border-red-400/50" />
        {/* Small label */}
        <div className="absolute top-2 left-4">
          <span className="text-[9px] text-red-400/60 font-medium whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
            Controls area
          </span>
        </div>
      </div>

      {/* Corner marker at intersection */}
      <div
        className="absolute"
        style={{
          left: `${rightBoundaryFromLeft}%`,
          top: `${bottomBoundaryFromTop}%`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-red-400/40 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

export default SafeZoneOverlay;
