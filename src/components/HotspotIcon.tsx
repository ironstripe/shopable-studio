import { HotspotStyle } from "@/types/video";
import { ArrowRight, Gift, Heart, Sparkles, Percent } from "lucide-react";

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
  // White pill with blue gift icon accent
  if (style === "seasonal-standard") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full shadow-md"
        style={{ 
          transform: `scale(${scale})`,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.08)"
        }}
      >
        {/* Gift icon circle */}
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#E8F0FE" }}
        >
          <Gift className="w-3 h-3" style={{ color: "#1A73E8" }} />
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#1A1A1A" }}>
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5" style={{ color: "#1A73E8" }} />
      </div>
    );
  }

  // Seasonal Easter
  // Warm pastel with egg/sparkles icon
  if (style === "seasonal-easter") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full shadow-md"
        style={{ 
          transform: `scale(${scale})`,
          backgroundColor: "#FFF8E9",
          border: "1px solid rgba(0,0,0,0.04)"
        }}
      >
        {/* Easter icon circle */}
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFE0B2" }}
        >
          <Sparkles className="w-3 h-3" style={{ color: "#FFB74D" }} />
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#5D4037" }}>
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5" style={{ color: "#FFB74D" }} />
      </div>
    );
  }

  // Seasonal Mother's Day
  // Soft rose with heart icon
  if (style === "seasonal-mothers-day") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full shadow-md"
        style={{ 
          transform: `scale(${scale})`,
          backgroundColor: "#FFE6EC",
          border: "1px solid rgba(233,30,99,0.15)"
        }}
      >
        {/* Heart icon circle */}
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#F8BBD0" }}
        >
          <Heart className="w-3 h-3" style={{ color: "#E91E63" }} />
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#AD1457" }}>
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5" style={{ color: "#E91E63" }} />
      </div>
    );
  }

  // Seasonal Black Friday
  // Dark bold with yellow percent icon
  if (style === "seasonal-black-friday") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full shadow-md"
        style={{ 
          transform: `scale(${scale})`,
          backgroundColor: "#111111",
          border: "1px solid #333333"
        }}
      >
        {/* Percent icon circle */}
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFEB3B" }}
        >
          <Percent className="w-3 h-3" style={{ color: "#111111" }} />
        </div>
        
        {/* CTA Label */}
        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#FFEB3B" }}>
          {ctaLabel}
        </span>
        
        {/* Arrow */}
        <ArrowRight className="w-3.5 h-3.5" style={{ color: "#FFEB3B" }} />
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