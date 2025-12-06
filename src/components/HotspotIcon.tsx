import { HotspotStyle } from "@/types/video";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
  scale?: number;
  price?: string;
  source?: "video" | "layout-preview" | "unknown";
}

const HotspotIcon = ({ style, countdown, ctaLabel, isSelected, scale = 1, price, source = "unknown" }: HotspotIconProps) => {
  console.log('[HotspotIcon]', source, 'style:', style);
  
  const baseStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
  };
  
  const glowStyle = isSelected
    ? { ...baseStyle, filter: "drop-shadow(0 0 12px #1A73E8)" }
    : baseStyle;

  // Fine Line variants - creative style-based designs
  if (style === "minimal-dot-pure-line") {
    return (
      <div 
        className="flex items-center gap-2 border border-white/70 rounded px-3 py-1.5 animate-fade-in group"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <span className="text-white text-sm font-light" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{countdown}</span>
        <div className="w-[0.5px] h-4 bg-white/50" />
        <span className="text-white text-xs font-light tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{ctaLabel}</span>
      </div>
    );
  }

  if (style === "minimal-dot-soft-glass") {
    return (
      <div 
        className="flex items-center gap-1.5 bg-white/10 backdrop-blur-[4px] border border-white/30 rounded px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] animate-fade-in group"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <span className="text-white text-sm font-light" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{countdown}</span>
        <span className="text-white/50 text-sm">•</span>
        <span className="text-white text-xs font-light" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{ctaLabel}</span>
      </div>
    );
  }

  if (style === "minimal-dot-editorial-slim") {
    return (
      <div 
        className="flex flex-col items-center gap-0.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <div className="w-full h-[0.5px] bg-white/60" />
        <div className="flex items-center gap-1.5 px-2 py-1">
          <span className="text-white text-[10px] font-light align-super" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{countdown}</span>
          <span className="text-white text-xs font-light tracking-wider" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{ctaLabel.toUpperCase()}</span>
        </div>
        <div className="w-full h-[0.5px] bg-white/60" />
      </div>
    );
  }

  if (style === "minimal-dot-micro-dot") {
    return (
      <div 
        className="flex items-center gap-2 group animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <div className="w-[5px] h-[5px] rounded-full bg-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
        <span className="text-white text-xs font-light" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{ctaLabel}</span>
      </div>
    );
  }

  // Luxury Line variants - Refined luxury aesthetics
  if (style === "luxury-line-serif-whisper") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-fade-in group"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <span 
          className="font-spectral text-[13px] font-light text-[#F7F5EF] tracking-wide group-hover:opacity-100 opacity-90 transition-opacity duration-150"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {countdown}. {ctaLabel}
        </span>
        <div className="w-full h-[0.5px] bg-[#F7F5EF]/60 group-hover:bg-[#F7F5EF]/80 transition-colors duration-150" />
      </div>
    );
  }

  if (style === "luxury-line-gold-accent") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-fade-in group"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-spectral text-[13px] font-light text-[#D6C29A]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{countdown}.</span>
          <span className="font-spectral text-[13px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{ctaLabel}</span>
        </div>
        <div className="w-full h-[0.5px] bg-[#C9B58F] opacity-70 group-hover:opacity-100 transition-opacity duration-150" />
      </div>
    );
  }

  if (style === "luxury-line-glass-veil") {
    return (
      <div 
        className="bg-white/10 backdrop-blur-[6px] border border-white/20 rounded px-3 py-1.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms', transform: `scale(${scale})` }}
      >
        <span className="text-[12px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          <sup className="text-[9px] mr-1">{countdown}</sup>{ctaLabel}
        </span>
      </div>
    );
  }

  if (style === "luxury-line-dot-reveal") {
    return (
      <div 
        className="flex items-center gap-2 group animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <div className="w-[4px] h-[4px] rounded-full bg-[#F7F5EF] opacity-80 group-hover:opacity-100 transition-opacity duration-200" style={{ boxShadow: '0 0 6px rgba(247,245,239,0.7)' }} />
        <span 
          className="font-spectral text-[12px] font-light text-white opacity-80 group-hover:opacity-100 transition-opacity duration-200"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {ctaLabel}
        </span>
      </div>
    );
  }

  // E-Commerce Line variants
  // Light Card - Clean vertical card with CTA label + price row
  if (style === "ecommerce-line-compact-price-tag") {
    return (
      <div 
        className="flex flex-col items-start bg-white rounded-2xl px-4 py-3 animate-scale-in"
        style={{ 
          ...baseStyle, 
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          minWidth: '160px',
          maxWidth: '200px',
        }}
      >
        {/* CTA Label - Top line */}
        <span 
          className="text-[#1A1A1A] text-[16px] font-semibold leading-5 truncate w-full"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {ctaLabel}
        </span>
        
        {/* Price Row - Bottom line */}
        <div className="flex items-center gap-1.5 mt-1">
          <span 
            className="text-[#1A73E8] text-[16px] font-medium"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {price || "$0.00"}
          </span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#1A73E8" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    );
  }

  // E-Commerce Minimal - Frosted glass with title, price, chevron
  if (style === "ecommerce-line-label-strip") {
    return (
      <div 
        className="flex flex-col items-stretch animate-fade-in"
        style={{ 
          ...baseStyle, 
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.45)',
          borderRadius: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          padding: '10px 14px',
          minWidth: '180px',
          maxWidth: '220px',
          animationDuration: '120ms',
        }}
      >
        {/* Title */}
        <span 
          className="text-[15px] font-medium truncate"
          style={{ 
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'rgba(0,0,0,0.85)',
            lineHeight: '1.3',
          }}
        >
          {ctaLabel}
        </span>
        
        {/* Price Row with Chevron */}
        <div className="flex items-center justify-between mt-1">
          <span 
            className="text-[15px] font-semibold"
            style={{ 
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(0,0,0,0.70)',
            }}
          >
            {price || "$0.00"}
          </span>
          
          {/* Chevron Arrow */}
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="rgba(0,0,0,0.55)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    );
  }

  // Sale Boost - Promo card with badge, strikethrough price, CTA button
  if (style === "ecommerce-line-cta-pill-focus") {
    // Parse price: support "newPrice|oldPrice" format
    const [newPrice, oldPrice] = (price || "$29.99").split("|");
    const hasOldPrice = !!oldPrice;
    
    return (
      <div 
        className="flex flex-col items-stretch bg-white rounded-2xl animate-scale-in"
        style={{ 
          ...baseStyle, 
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
          padding: '14px 16px',
          minWidth: '180px',
          maxWidth: '240px',
        }}
      >
        {/* Promo Badge */}
        <div 
          className="self-start bg-[#1A73E8] rounded-xl px-2.5 flex items-center justify-center mb-2"
          style={{ height: '24px' }}
        >
          <span 
            className="text-white text-[12px] font-bold uppercase"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.01em' }}
          >
            SALE
          </span>
        </div>
        
        {/* Product Title */}
        <span 
          className="text-[#1A1A1A] text-[15px] font-semibold leading-5 truncate mb-2"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {ctaLabel}
        </span>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span 
            className="text-[#E53935] text-[18px] font-bold"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {newPrice}
          </span>
          {hasOldPrice && (
            <span 
              className="text-[14px] font-medium line-through"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(0,0,0,0.35)' }}
            >
              {oldPrice}
            </span>
          )}
        </div>
        
        {/* CTA Button */}
        <div 
          className="w-full h-10 bg-[#1A73E8] rounded-xl flex items-center justify-center"
        >
          <span 
            className="text-white text-[15px] font-semibold"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Shop Now
          </span>
        </div>
      </div>
    );
  }

  if (style === "ecommerce-line-product-card-lite") {
    return (
      <div 
        className="flex flex-col items-start bg-white/95 backdrop-blur-sm border border-[#E0E0E0] rounded-lg px-3 py-2 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms', borderRadius: '8px' }}
      >
        <span className="text-[#111111] text-[13px] font-medium leading-tight">{ctaLabel}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#6B7280] text-[12px]">{price || "–.–"}</span>
          <span className="text-[#3B82F6] text-[12px]">→</span>
        </div>
      </div>
    );
  }

  // Editorial Line variants - typography-focused with cinematic motion
  if (style === "editorial-line-headline-tag") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-slide-up"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-playfair text-[14px] font-normal text-white tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
            {ctaLabel}
          </span>
          <span className="text-white/70 text-[12px]">→</span>
        </div>
        <div className="w-full h-[0.5px] bg-white/80" />
      </div>
    );
  }

  if (style === "editorial-line-vertical-label") {
    const letters = ctaLabel.slice(0, 6).split(''); // Max 6 letters for vertical display
    return (
      <div 
        className="flex flex-col items-center gap-1 animate-slide-left"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center text-white font-playfair text-[14px] font-light tracking-wider leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
            {letters.map((letter, i) => (
              <span key={i}>{letter.toUpperCase()}</span>
            ))}
          </div>
          <div className="w-[0.5px] h-16 bg-white/70" />
        </div>
        <span className="text-white/60 text-[10px] font-light">View →</span>
      </div>
    );
  }

  if (style === "editorial-line-caption-frame") {
    return (
      <div 
        className="border border-white/70 rounded px-3 py-2 animate-micro-zoom"
        style={{ ...baseStyle, animationDuration: '240ms', backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(2px)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-spectral text-[13px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {ctaLabel}
          </span>
          {price && (
            <span className="text-white/70 text-[12px] font-light">{price}</span>
          )}
          <span className="text-white/60 text-[11px]">→</span>
        </div>
      </div>
    );
  }

  if (style === "editorial-line-dash-marker") {
    return (
      <div 
        className="flex items-center gap-2 animate-slide-left"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <span className="font-spectral text-[14px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          — {ctaLabel}
        </span>
        <span className="text-white/50 text-[12px] font-light">More</span>
      </div>
    );
  }

  // Seasonal variants
  if (style === "seasonal-valentine") {
    return (
      <div 
        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full px-3 py-1.5 shadow-[0_2px_12px_rgba(244,63,94,0.4)] animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <span className="text-white text-sm">♥</span>
        <span className="text-white font-medium text-xs">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "seasonal-easter") {
    return (
      <div 
        className="flex items-center gap-2 bg-gradient-to-r from-violet-400 to-emerald-400 rounded-full px-3 py-1.5 shadow-[0_2px_12px_rgba(167,139,250,0.3)] animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <span className="text-white text-sm">🐣</span>
        <span className="text-white font-medium text-xs drop-shadow-sm">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "seasonal-black-friday") {
    return (
      <div 
        className="flex items-center gap-2 bg-black rounded-full px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.5)] border border-amber-500/60 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '180ms' }}
      >
        <span className="text-amber-400 font-bold text-sm">%</span>
        <span className="text-white font-medium text-xs">{ctaLabel}</span>
      </div>
    );
  }

  return null;
};

export default HotspotIcon;
