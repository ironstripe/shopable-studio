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
}

const HotspotStylePreview = ({ 
  family, 
  hotspotStyle, 
  isActive,
  ctaLabel = "Shop",
  isLocked = false
}: HotspotStylePreviewProps) => {
  // Family-specific blurred video backgrounds
  const getPreviewBackground = (): string => {
    switch (family) {
      case "ecommerce":
        return "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800";
      case "luxury":
        return "bg-gradient-to-br from-neutral-900 via-stone-800 to-neutral-900";
      case "seasonal":
        // Dynamic based on hotspotStyle for seasonal
        if (hotspotStyle.includes("valentine")) {
          return "bg-gradient-to-br from-rose-500/80 via-pink-500/80 to-rose-600/80";
        }
        if (hotspotStyle.includes("easter")) {
          return "bg-gradient-to-br from-violet-400/70 via-emerald-400/70 to-cyan-400/70";
        }
        if (hotspotStyle.includes("black-friday")) {
          return "bg-gradient-to-br from-neutral-900 via-black to-neutral-900";
        }
        return "bg-gradient-to-br from-amber-500/70 via-orange-500/70 to-rose-500/70";
      default:
        return "bg-gradient-to-br from-gray-600 to-gray-800";
    }
  };

  return (
    <div 
      className={cn(
        "relative aspect-[1.3/1] rounded-xl overflow-hidden transition-all duration-150",
        isActive 
          ? "shadow-lg ring-2 ring-primary/20" 
          : "shadow-md",
        isLocked && "opacity-70"
      )}
    >
      {/* Blurred video-like background */}
      <div className={cn(
        "absolute inset-0",
        getPreviewBackground()
      )} />
      
      {/* Subtle blur overlay to simulate video frame */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      
      {/* Dark gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Centered hotspot preview (scaled down) */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: 'scale(0.55)' }}
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

      {/* Lock overlay for locked styles */}
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
