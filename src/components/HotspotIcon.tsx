import { HotspotStyle } from "@/types/video";
import { ArrowRight, Gift, Heart, Sparkles } from "lucide-react";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
  scale?: number;
  price?: string;
  source?: "video" | "layout-preview" | "unknown";
  productIndex?: number;
}

const HotspotIcon = ({ 
  style, 
  countdown, 
  ctaLabel, 
  isSelected, 
  scale = 1, 
  price, 
  source = "unknown",
  productIndex = 1 
}: HotspotIconProps) => {
  
  // E-Commerce Light Card
  // White rounded pill, light shadow, product index, CTA, arrow
  if (style === "ecommerce-light-card") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-md border border-border/30"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Product index circle */}
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-primary">
            {productIndex}
          </span>
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5 text-primary" />
      </div>
    );
  }

  // Luxury Fine Line
  // Minimal thin outline, off-white/light grey, refined aesthetic
  if (style === "luxury-fine-line") {
    return (
      <div
        className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/50"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Small number */}
        <span className="text-[11px] font-light text-white/80 tracking-wide">
          {productIndex}
        </span>
        
        {/* Divider */}
        <div className="w-px h-3 bg-white/30" />
        
        {/* Label - refined sans-serif */}
        <span className="text-[12px] font-light text-white/90 tracking-wide whitespace-nowrap">
          {ctaLabel}
        </span>
      </div>
    );
  }

  // Seasonal Standard
  // White pill with festive icon accent
  if (style === "seasonal-standard") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-md border border-border/30"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Festive icon circle */}
        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
          <Gift className="w-3 h-3 text-amber-600" />
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5 text-primary" />
      </div>
    );
  }

  // Seasonal Valentine (locked, but render similar to standard with pink accent)
  if (style === "seasonal-valentine") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-md border border-rose-200"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
          <Heart className="w-3 h-3 text-rose-500" />
        </div>
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {ctaLabel}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
      </div>
    );
  }

  // Seasonal Easter (locked, pastel accent)
  if (style === "seasonal-easter") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-md border border-violet-200"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-violet-500" />
        </div>
        <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
          {ctaLabel}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-violet-500" />
      </div>
    );
  }

  // Seasonal Black Friday (locked, dark accent)
  if (style === "seasonal-black-friday") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 shadow-md border border-amber-500/50"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
          <span className="text-[10px] font-bold text-neutral-900">%</span>
        </div>
        <span className="text-[13px] font-medium text-white whitespace-nowrap">
          {ctaLabel}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
      </div>
    );
  }

  // Default fallback - simple dot
  return (
    <div
      className="w-8 h-8 rounded-full bg-white/90 shadow-md border border-border/50 flex items-center justify-center"
      style={{ transform: `scale(${scale})` }}
    >
      <span className="text-[11px] font-semibold text-muted-foreground">
        {productIndex}
      </span>
    </div>
  );
};

export default HotspotIcon;
