import { cn } from "@/lib/utils";
import HotspotIcon from "./HotspotIcon";
import { HotspotStyle } from "@/types/video";

type TemplateFamily = "ecommerce" | "luxury" | "seasonal";

interface HotspotStylePreviewProps {
  family: TemplateFamily;
  hotspotStyle: HotspotStyle;
  isActive: boolean;
  ctaLabel?: string;
  isLocked?: boolean;
  compact?: boolean;
}

const HotspotStylePreview = ({ 
  family, 
  hotspotStyle, 
  isActive,
  ctaLabel = "Shop",
  isLocked = false,
  compact = false
}: HotspotStylePreviewProps) => {
  // Family-specific backgrounds - lighter/neutral for accurate previews
  const getPreviewBackground = (): string => {
    // Luxury needs dark background to show white text
    if (family === "luxury") {
      return "bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800";
    }
    // E-Commerce and Seasonal use light neutral backgrounds
    if (family === "seasonal") {
      if (hotspotStyle.includes("valentine")) {
        return "bg-gradient-to-br from-rose-100 to-pink-50";
      }
      if (hotspotStyle.includes("easter")) {
        return "bg-gradient-to-br from-amber-50 to-orange-50";
      }
      if (hotspotStyle.includes("black-friday")) {
        return "bg-gradient-to-br from-neutral-200 to-neutral-300";
      }
      return "bg-gradient-to-br from-slate-100 to-slate-200";
    }
    // E-Commerce - light neutral
    return "bg-gradient-to-br from-slate-100 to-slate-200";
  };

  const previewScale = compact ? 0.45 : 0.55;

  return (
    <div 
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden transition-all duration-150",
        isActive && "ring-2 ring-primary/30",
        isLocked && "opacity-70"
      )}
    >
      {/* Background */}
      <div className={cn(
        "absolute inset-0",
        getPreviewBackground()
      )} />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10" />
      
      {/* Centered hotspot preview */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${previewScale})` }}
      >
        <HotspotIcon 
          style={hotspotStyle}
          source="layout-preview"
          countdown={1}
          ctaLabel={ctaLabel}
          scale={1}
          price="$49"
          productIndex={1}
        />
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-1">
            <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-[9px] font-medium text-white/80">Coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotspotStylePreview;