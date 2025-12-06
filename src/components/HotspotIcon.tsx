import { HotspotStyle } from "@/types/video";
import { ArrowRight, Gift, Heart, Sparkles, Percent, ChevronRight } from "lucide-react";

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
  // Vertical layout: CTA on top, price + arrow on bottom
  if (style === "ecommerce-light-card") {
    return (
      <div
        className="flex flex-col items-start gap-1 bg-white animate-ecommerce-card-enter"
        style={{ 
          transform: `scale(${scale})`,
          padding: "12px 16px",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          minWidth: "160px",
        }}
      >
        {/* CTA Label (top line) */}
        <span 
          className="font-semibold whitespace-nowrap truncate max-w-[200px]"
          style={{ 
            fontSize: "16px", 
            lineHeight: "20px",
            color: "#1A1A1A" 
          }}
        >
          {ctaLabel}
        </span>
        
        {/* Price row (bottom line) */}
        <div className="flex items-center gap-1.5">
          <span 
            className="font-medium"
            style={{ 
              fontSize: "16px", 
              color: "#1A73E8" 
            }}
          >
            {price || "$0"}
          </span>
          <ArrowRight 
            className="w-4 h-4" 
            style={{ color: "#1A73E8" }} 
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  }

  // E-Commerce Sale Boost
  // Promo badge, strikethrough old price, bold new price, full-width CTA
  if (style === "ecommerce-sale-boost") {
    return (
      <div
        className="flex flex-col items-stretch bg-white animate-sale-boost-enter"
        style={{ 
          transform: `scale(${scale})`,
          padding: "14px 16px",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
          minWidth: "180px",
          maxWidth: "240px",
        }}
      >
        {/* Promo Badge */}
        <div 
          className="self-start mb-2 px-2.5 py-1 rounded-[12px]"
          style={{ backgroundColor: "#1A73E8" }}
        >
          <span 
            className="text-[12px] font-bold text-white uppercase"
            style={{ letterSpacing: "0.01em" }}
          >
            SALE
          </span>
        </div>
        
        {/* Product Title */}
        <span 
          className="font-semibold truncate mb-1"
          style={{ fontSize: "15px", color: "#1A1A1A" }}
        >
          {ctaLabel}
        </span>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          {/* Old Price with strikethrough */}
          <span 
            className="line-through font-medium"
            style={{ fontSize: "14px", color: "rgba(0,0,0,0.35)" }}
          >
            $89
          </span>
          {/* New Price */}
          <span 
            className="font-bold"
            style={{ fontSize: "18px", color: "#E53935" }}
          >
            {price || "$49"}
          </span>
        </div>
        
        {/* CTA Button */}
        <div
          className="w-full h-10 rounded-[12px] flex items-center justify-center"
          style={{ backgroundColor: "#1A73E8" }}
        >
          <span className="text-[15px] font-semibold text-white">
            Shop Now
          </span>
        </div>
      </div>
    );
  }

  // E-Commerce Minimal
  // Frosted glass, title + price + chevron, ultra-light
  if (style === "ecommerce-minimal") {
    return (
      <div
        className="flex flex-col items-start animate-ecommerce-minimal-enter"
        style={{ 
          transform: `scale(${scale})`,
          padding: "10px 14px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          minWidth: "180px",
          maxWidth: "220px",
        }}
      >
        {/* Title */}
        <span 
          className="font-medium truncate w-full"
          style={{ 
            fontSize: "15px", 
            color: "rgba(0,0,0,0.85)",
            lineHeight: "1.3"
          }}
        >
          {ctaLabel}
        </span>
        
        {/* Price row with chevron */}
        <div className="flex items-center justify-between w-full mt-1">
          <span 
            className="font-semibold"
            style={{ 
              fontSize: "15px", 
              color: "rgba(0,0,0,0.70)" 
            }}
          >
            {price || "$0"}
          </span>
          <ChevronRight 
            className="w-3.5 h-3.5 ml-1.5" 
            style={{ color: "rgba(0,0,0,0.55)" }} 
            strokeWidth={2}
          />
        </div>
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