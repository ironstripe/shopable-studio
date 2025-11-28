import { HotspotStyle } from "@/types/video";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
}

const HotspotIcon = ({ style, countdown, ctaLabel, isSelected }: HotspotIconProps) => {
  const glowStyle = isSelected
    ? { filter: "drop-shadow(0 0 12px #FF6A00)" }
    : {};

  switch (style) {
    case "smart-badge":
      return (
        <div className="flex flex-col items-center" style={glowStyle}>
          {/* Smart Badge - Capsule with countdown • separator • CTA */}
          <div className="flex items-center gap-2 bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 shadow-lg">
            <span className="text-white font-bold text-lg">{countdown}</span>
            <span className="text-white/60 text-lg">•</span>
            <span className="text-white font-semibold text-sm">{ctaLabel}</span>
          </div>
          {/* Stand */}
          <div className="w-12 h-2 bg-black rounded-sm mt-1" />
        </div>
      );

    case "screen":
      return (
        <div className="flex flex-col items-center" style={glowStyle}>
          {/* Screen - Rectangle with countdown */}
          <div className="relative bg-[#FF6A00] border-4 border-black rounded-2xl w-16 h-12 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">{countdown}</span>
          </div>
          {/* Stand */}
          <div className="w-12 h-2 bg-black rounded-sm mt-1" />
          {/* CTA below */}
          <span className="text-white font-semibold text-xs mt-1">{ctaLabel}</span>
        </div>
      );

    case "flash-circle":
      return (
        <div className="flex items-center gap-3" style={glowStyle}>
          {/* Radial gradient circle with countdown */}
          <div className="relative w-16 h-16 rounded-full border-2 border-black shadow-lg flex items-center justify-center" 
               style={{ 
                 background: "radial-gradient(circle, #FF9A3D 0%, #FF6A00 100%)" 
               }}>
            <span className="text-white font-bold text-xl">{countdown}</span>
          </div>
          {/* White capsule button with orange text */}
          <div className="bg-white border-2 border-black rounded-full px-4 py-2 shadow-lg">
            <span className="text-[#FF6A00] font-semibold text-sm">{ctaLabel}</span>
          </div>
        </div>
      );

    case "tag-bubble":
      return (
        <div className="flex items-center gap-2" style={glowStyle}>
          {/* White circle with countdown in orange */}
          <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-lg">
            <span className="text-[#FF6A00] font-bold text-lg">{countdown}</span>
          </div>
          {/* Orange capsule tag with CTA */}
          <div className="bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 shadow-lg">
            <span className="text-white font-semibold text-sm">{ctaLabel}</span>
          </div>
        </div>
      );

    case "lux-dot":
      return (
        <div className="flex items-center gap-3" style={glowStyle}>
          {/* Small orange dot with white ring and countdown */}
          <div className="relative w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-[#FF6A00]">
            <span className="text-white font-bold text-sm">{countdown}</span>
          </div>
          {/* Semi-transparent black capsule with CTA */}
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-white font-medium text-xs">{ctaLabel}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default HotspotIcon;
