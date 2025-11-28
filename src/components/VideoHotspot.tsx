import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const VideoHotspot = ({ hotspot, currentTime, isSelected, onClick }: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;

  if (!isActive || countdown <= 0) return null;

  return (
    <div
      className={`absolute cursor-pointer transition-all ${
        isSelected ? "hotspot-pulse scale-110" : "hotspot-pulse"
      }`}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        pointerEvents: 'auto',
      }}
      onClick={onClick}
    >
      <HotspotIcon
        style={hotspot.style}
        countdown={countdown}
        ctaLabel={hotspot.ctaLabel}
        isSelected={isSelected}
      />
    </div>
  );
};

export default VideoHotspot;
