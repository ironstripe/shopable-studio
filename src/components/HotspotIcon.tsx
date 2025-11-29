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

  // Minimal Dot (Fine Line) variants
  if (style === "minimal-dot-small") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-7 h-7 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white font-bold text-[10px]">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "minimal-dot-large") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-10 h-10 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "minimal-dot-light") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-7 h-7 rounded-full bg-[#FF6A00]/60 border border-white shadow-sm flex items-center justify-center">
          <span className="text-white font-bold text-[10px]">{countdown}</span>
        </div>
      </div>
    );
  }

  if (style === "minimal-dot-strong") {
    return (
      <div className="flex items-center justify-center" style={glowStyle}>
        <div className="w-8 h-8 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xs">{countdown}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default HotspotIcon;