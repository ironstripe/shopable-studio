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

  switch (style) {
    case "icon-only":
      return (
        <div className="flex items-center justify-center" style={glowStyle}>
          {/* Small numbered dot */}
          <div className="w-10 h-10 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{countdown}</span>
          </div>
        </div>
      );

    case "icon-cta-pill":
      return (
        <div className="flex items-center gap-2" style={glowStyle}>
          {/* Dot + CTA capsule */}
          <div className="w-9 h-9 rounded-full bg-[#FF6A00] border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{countdown}</span>
          </div>
          <div className="bg-[#FF6A00] border-2 border-white rounded-full px-3 py-1.5 shadow-lg">
            <span className="text-white font-medium text-xs">{ctaLabel}</span>
          </div>
        </div>
      );

    case "badge-small":
      return (
        <div className="flex flex-col items-center" style={glowStyle}>
          {/* Compact smart badge */}
          <div className="flex items-center gap-1.5 bg-[#FF6A00] border border-black rounded-full px-3 py-1.5 shadow-md">
            <span className="text-white font-bold text-sm">{countdown}</span>
            <span className="text-white/60 text-sm">•</span>
            <span className="text-white font-medium text-xs">{ctaLabel}</span>
          </div>
        </div>
      );

    case "badge-large":
      return (
        <div className="flex flex-col items-center" style={glowStyle}>
          {/* Full smart badge */}
          <div className="flex items-center gap-2 bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 shadow-lg">
            <span className="text-white font-bold text-lg">{countdown}</span>
            <span className="text-white/60 text-lg">•</span>
            <span className="text-white font-semibold text-sm">{ctaLabel}</span>
          </div>
          {/* Stand */}
          <div className="w-12 h-2 bg-black rounded-sm mt-1" />
        </div>
      );

    case "minimal-dot":
      return (
        <div className="flex items-center justify-center" style={glowStyle}>
          {/* Ultra-minimal dot */}
          <div className="w-8 h-8 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">{countdown}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default HotspotIcon;
