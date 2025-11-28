import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  isSelected: boolean;
  isDragging: boolean;
  isEditMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

const VideoHotspot = ({ hotspot, currentTime, isSelected, isDragging, isEditMode, onClick, onDragStart }: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;

  if (!isActive || countdown <= 0) return null;

  return (
    <div
      className={`absolute transition-all select-none ${
        isSelected ? "hotspot-pulse scale-110" : "hotspot-pulse"
      } ${
        isDragging ? "cursor-grabbing opacity-80" : isEditMode ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        pointerEvents: 'auto',
      }}
      onClick={onClick}
      onMouseDown={isEditMode ? onDragStart : undefined}
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
