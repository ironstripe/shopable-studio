import { cn } from "@/lib/utils";
import HotspotIcon from "./HotspotIcon";
import { HotspotStyle } from "@/types/video";

type TemplateFamily = "ecommerce" | "luxury" | "seasonal";

interface HotspotStylePreviewProps {
  family: TemplateFamily;
  hotspotStyle: HotspotStyle;
  isActive: boolean;
  ctaLabel?: string;
}

const HotspotStylePreview = ({ 
  family, 
  hotspotStyle, 
  isActive,
  ctaLabel = "Shop"
}: HotspotStylePreviewProps) => {
  // Family-specific blurred video backgrounds with seasonal style awareness
  const getPreviewBackground = (): string => {
    switch (family) {
    case "ecommerce":
      return "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900";
      case "luxury":
        return "bg-gradient-to-br from-neutral-900 via-stone-800 to-neutral-900";
      case "seasonal":
        // Dynamic based on hotspotStyle for seasonal
        if (hotspotStyle.includes("valentine")) {
          return "bg-gradient-to-br from-rose-600/80 via-pink-600/80 to-rose-700/80";
        }
        if (hotspotStyle.includes("easter")) {
          return "bg-gradient-to-br from-violet-400/70 via-emerald-400/70 to-cyan-400/70";
        }
        if (hotspotStyle.includes("black-friday")) {
          return "bg-gradient-to-br from-neutral-900 via-black to-neutral-900";
        }
        return "bg-gradient-to-br from-rose-500/70 via-purple-600/70 to-indigo-700/70";
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
          : "shadow-md"
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
          countdown={1}
          ctaLabel={ctaLabel}
          scale={1}
          price="$49"
        />
      </div>
    </div>
  );
};

export default HotspotStylePreview;
