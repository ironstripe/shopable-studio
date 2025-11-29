import { HotspotStyle } from "@/types/video";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
  scale?: number;
  price?: string;
}

const HotspotIcon = ({ style, countdown, ctaLabel, isSelected, scale = 1, price }: HotspotIconProps) => {
  const baseStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
  };
  
  const glowStyle = isSelected
    ? { ...baseStyle, filter: "drop-shadow(0 0 12px #FF6A00)" }
    : baseStyle;

  // Icon Only variants
  if (style === "icon-only-small") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-9 h-9 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-only-large") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-12 h-12 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-base">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-only-light") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-9 h-9 rounded-full bg-white border border-[#FF6A00] shadow-sm flex items-center justify-center">
          <span className="text-[#FF6A00] font-bold text-sm">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-only-strong") {
    return (
      <div className="flex items-center justify-center" style={baseStyle}>
        <div className="w-10 h-10 rounded-full bg-[#FF6A00] border-2 border-white shadow-[0_0_16px_rgba(255,106,0,0.6)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
      </div>
    );
  }

  // Icon + CTA Pill variants
  if (style === "icon-cta-pill-small") {
    return (
      <div className="flex items-center gap-1.5" style={glowStyle}>
        <div className="w-7 h-7 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">{countdown}</span>
        </div>
        <div className="bg-[#FF6A00] border-2 border-white rounded-full px-2.5 py-1 shadow-md">
          <span className="text-white font-medium text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-cta-pill-large") {
    return (
      <div className="flex items-center gap-2" style={glowStyle}>
        <div className="w-10 h-10 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
        <div className="bg-[#FF6A00] border-2 border-white rounded-full px-4 py-1.5 shadow-lg">
          <span className="text-white font-semibold text-sm">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-cta-pill-light") {
    return (
      <div className="flex items-center gap-1.5" style={glowStyle}>
        <div className="w-7 h-7 rounded-full bg-[#FF6A00] border border-white shadow-sm flex items-center justify-center">
          <span className="text-white font-bold text-[10px]">{countdown}</span>
        </div>
        <div className="bg-[#FF6A00] border border-white rounded-full px-2 py-0.5 shadow-sm">
          <span className="text-white font-medium text-[10px]">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "icon-cta-pill-strong") {
    return (
      <div className="flex items-center gap-2" style={glowStyle}>
        <div className="w-9 h-9 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
        <div className="bg-[#FF6A00] border-2 border-white rounded-full px-3 py-1.5 shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
          <span className="text-white font-semibold text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  // Badge Bubble variants - 4 creative styles
  if (style === "badge-bubble-classic") {
    return (
      <div className="flex items-center gap-1.5 bg-[#FF6A00] rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] animate-fade-in" style={{ ...glowStyle, animationDuration: '180ms' }}>
        <span className="text-white font-medium text-sm">{countdown}</span>
        <span className="text-white/60 text-sm">•</span>
        <span className="text-white font-medium text-xs">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "badge-bubble-outline") {
    return (
      <div className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-[#FF6A00] rounded-full px-3 py-1.5 animate-fade-in" style={{ ...glowStyle, animationDuration: '180ms' }}>
        <span className="text-[#FF6A00] font-medium text-sm">{countdown}</span>
        <span className="text-[#FF6A00]/60 text-sm">•</span>
        <span className="text-[#FF6A00] font-medium text-xs">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "badge-bubble-ghost") {
    return (
      <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-[6px] rounded-full px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-fade-in" style={{ ...glowStyle, animationDuration: '180ms' }}>
        <span className="text-white font-medium text-sm">{countdown}</span>
        <span className="text-white/60 text-sm">•</span>
        <span className="text-white font-medium text-xs">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "badge-bubble-accent-split") {
    return (
      <div className="flex items-center gap-2 animate-fade-in" style={{ ...glowStyle, animationDuration: '180ms' }}>
        {/* Left: number circle */}
        <div className="w-8 h-8 rounded-full bg-[#FF6A00] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
        {/* Right: CTA pill */}
        <div className="flex items-center justify-center bg-[#FF6A00] rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-[#E55A00] transition-colors duration-150">
          <span className="text-white font-medium text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

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
        <div className="w-[2px] h-[2px] rounded-full bg-[#F7F5EF] opacity-40 group-hover:opacity-100 transition-opacity duration-200" style={{ boxShadow: '0 0 3px rgba(247,245,239,0.5)' }} />
        <span 
          className="font-spectral text-[12px] font-light text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {ctaLabel}
        </span>
      </div>
    );
  }

  // E-Commerce Line variants
  if (style === "ecommerce-line-price-tag-compact") {
    return (
      <div 
        className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#E0E0E0] rounded-lg px-3 py-1.5 shadow-sm animate-fade-in"
        style={{ ...baseStyle, animationDuration: '200ms' }}
      >
        <span className="text-[#111111] text-[13px] font-medium">{countdown}</span>
        <span className="text-[#9CA3AF] text-[13px]">·</span>
        <span className="text-[#111111] text-[13px] font-medium">{ctaLabel}</span>
        <span className="text-[#3B82F6] text-[13px]">→</span>
      </div>
    );
  }

  if (style === "ecommerce-line-product-label-extended") {
    return (
      <div 
        className="flex flex-col items-start bg-white/95 backdrop-blur-sm border border-[#E0E0E0] rounded-lg px-3 py-2 shadow-sm animate-fade-in"
        style={{ ...baseStyle, animationDuration: '200ms' }}
      >
        <span className="text-[#111111] text-[13px] font-medium leading-tight">{ctaLabel}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[#6B7280] text-[12px]">{price || "–.–"}</span>
          <span className="text-[#6B7280] text-[12px]">·</span>
          <span className="text-[#3B82F6] text-[12px] font-medium">Shop →</span>
        </div>
      </div>
    );
  }

  if (style === "ecommerce-line-cta-pill-focus") {
    return (
      <div 
        className="flex items-center gap-2 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '200ms' }}
      >
        <div className="w-8 h-8 rounded-full bg-[#F5F5F5]/90 backdrop-blur-sm border border-[#E0E0E0] shadow-sm flex items-center justify-center">
          <span className="text-[#111111] text-[13px] font-medium">{countdown}</span>
        </div>
        <div className="bg-[#3B82F6] hover:bg-[#2563EB] rounded-full px-3 py-1.5 shadow-sm transition-colors duration-150">
          <span className="text-white text-[13px] font-medium">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "ecommerce-line-ecom-meta-strip") {
    return (
      <div 
        className="flex items-center justify-between gap-4 bg-[#F5F5F5]/90 backdrop-blur-sm border border-[#EAEAEA] rounded px-3 py-1.5 shadow-sm animate-fade-in"
        style={{ ...baseStyle, animationDuration: '200ms', minWidth: '120px' }}
      >
        <span className="text-[#111111] text-[13px] font-medium">{ctaLabel}</span>
        <span className="text-[#6B7280] text-[12px]">{price || "–.–"}</span>
      </div>
    );
  }

  // Editorial Line variants - typography-focused with cinematic motion
  if (style === "editorial-line-headline-tag") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
      >
        <span className="font-playfair text-[14px] font-light text-white tracking-wide">
          {ctaLabel}
        </span>
        <div className="w-full h-[0.5px] bg-white/80" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }} />
      </div>
    );
  }

  if (style === "editorial-line-vertical-label") {
    const letters = ctaLabel.slice(0, 6).split(''); // Max 6 letters for vertical display
    return (
      <div 
        className="flex items-center gap-2 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <div className="flex flex-col items-center text-white font-playfair text-[14px] font-light tracking-wider leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {letters.map((letter, i) => (
            <span key={i}>{letter.toUpperCase()}</span>
          ))}
        </div>
        <div className="w-[0.5px] h-16 bg-white/70" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
      </div>
    );
  }

  if (style === "editorial-line-caption-box") {
    return (
      <div 
        className="border-[0.75px] border-white/70 rounded px-3 py-1.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms', backgroundColor: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }}
      >
        <span className="font-spectral text-[13px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {ctaLabel}
        </span>
        {price && (
          <span className="text-white/80 text-[12px] font-light ml-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {price}
          </span>
        )}
      </div>
    );
  }

  if (style === "editorial-line-editorial-marker") {
    return (
      <div 
        className="animate-fade-in"
        style={{ ...baseStyle, animationDuration: '220ms' }}
      >
        <span className="font-spectral text-[14px] font-light text-white tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          — {ctaLabel}
        </span>
      </div>
    );
  }

  return null;
};

export default HotspotIcon;