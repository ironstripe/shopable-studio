import { HotspotStyle } from "@/types/video";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
  scale?: number;
}

const HotspotIcon = ({ style, countdown, ctaLabel, isSelected, scale = 1 }: HotspotIconProps) => {
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

  // Badge Bubble variants
  if (style === "badge-bubble-small") {
    return (
      <div className="flex flex-col items-center" style={glowStyle}>
        <div className="flex items-center gap-1.5 bg-[#FF6A00] border border-black rounded-full px-3 py-1.5 shadow-md">
          <span className="text-white font-bold text-sm">{countdown}</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white font-medium text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "badge-bubble-large") {
    return (
      <div className="flex flex-col items-center" style={glowStyle}>
        <div className="flex items-center gap-2 bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 shadow-lg">
          <span className="text-white font-bold text-base">{countdown}</span>
          <span className="text-white/60 text-base">•</span>
          <span className="text-white font-semibold text-sm">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "badge-bubble-light") {
    return (
      <div className="flex flex-col items-center" style={glowStyle}>
        <div className="flex items-center gap-1.5 bg-[#FF6A00] border border-black/40 rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-white font-bold text-sm">{countdown}</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white font-medium text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  if (style === "badge-bubble-strong") {
    return (
      <div className="flex flex-col items-center" style={glowStyle}>
        <div className="flex items-center gap-1.5 bg-[#FF6A00] border-2 border-black rounded-full px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <span className="text-white font-bold text-sm">{countdown}</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white font-medium text-xs">{ctaLabel}</span>
        </div>
      </div>
    );
  }

  // Minimal Dot (Fine Line) variants - text-based with semi-transparent dark backgrounds
  if (style === "minimal-dot-small") {
    return (
      <div 
        className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5"
        style={{ ...glowStyle, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        <span className="text-white text-sm font-medium">{countdown}</span>
        <span className="text-white/50 text-sm">•</span>
        <span className="text-white text-xs">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "minimal-dot-large") {
    return (
      <div 
        className="flex items-center gap-2 bg-black/35 backdrop-blur-sm rounded-full px-4 py-2"
        style={{ ...glowStyle, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        <span className="text-white text-base font-medium">{countdown}</span>
        <span className="text-white/50 text-base">•</span>
        <span className="text-white text-sm">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "minimal-dot-light") {
    return (
      <div 
        className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5"
        style={{ ...glowStyle, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        <span className="text-white text-sm font-light">{countdown}</span>
        <span className="text-white/50 text-sm">•</span>
        <span className="text-white text-xs font-light">{ctaLabel}</span>
      </div>
    );
  }

  if (style === "minimal-dot-strong") {
    return (
      <div 
        className="flex items-center gap-1.5 bg-black/45 rounded-full px-3 py-1.5"
        style={{ ...glowStyle, textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
      >
        <span className="text-white text-base font-semibold">{countdown}</span>
        <span className="text-white/50 text-base">•</span>
        <span className="text-white text-sm font-semibold">{ctaLabel}</span>
      </div>
    );
  }

  // Luxury Line variants
  if (style === "luxury-line-serif-minimal") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '240ms', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        <span className="font-spectral text-[13px] font-light text-white tracking-wide">
          {countdown}. {ctaLabel}
        </span>
        <div className="w-full h-[1px] bg-white/60" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
      </div>
    );
  }

  if (style === "luxury-line-gold-accent") {
    return (
      <div 
        className="flex flex-col items-start gap-0.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '240ms', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-spectral text-[13px] font-light text-[#E8DCC0]">{countdown}.</span>
          <span className="font-spectral text-[13px] font-light text-white tracking-wide">{ctaLabel}</span>
        </div>
        <div className="w-full h-[1px] bg-[#D4C7A1]" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
      </div>
    );
  }

  if (style === "luxury-line-floating-label") {
    return (
      <div 
        className="bg-black/40 backdrop-blur-sm rounded px-2.5 py-1.5 animate-fade-in"
        style={{ ...baseStyle, animationDuration: '240ms' }}
      >
        <span className="font-inter-thin text-[12px] font-extralight text-white tracking-wide">
          {ctaLabel}
        </span>
      </div>
    );
  }

  if (style === "luxury-line-ultra-dot") {
    return (
      <div 
        className="flex items-center gap-2 group animate-fade-in"
        style={{ ...baseStyle, animationDuration: '240ms' }}
      >
        <div className="w-[3px] h-[3px] rounded-full bg-white group-hover:opacity-30 transition-opacity duration-200" style={{ boxShadow: '0 0 4px rgba(255,255,255,0.6)' }} />
        <span 
          className="font-inter-thin text-[12px] font-extralight text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {ctaLabel}
        </span>
      </div>
    );
  }

  return null;
};

export default HotspotIcon;