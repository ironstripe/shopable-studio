import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isEditMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

const VideoHotspot = ({ hotspot, currentTime, isSelected, isDragging, isResizing, isEditMode, onClick, onDragStart, onResizeStart }: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;

  if (!isActive || countdown <= 0) return null;

  return (
    <div
      className={`absolute select-none ${
        isDragging ? "" : "transition-all"
      } ${
        isSelected ? "hotspot-pulse scale-110" : "hotspot-pulse"
      } ${
        isDragging ? "cursor-grabbing opacity-80" : isEditMode ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging || isResizing ? 100 : 10,
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
        scale={hotspot.scale}
      />
      
      {/* Resize handle - only visible in edit mode when selected */}
      {isEditMode && isSelected && (
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#0E76FD] border-2 border-white rounded-full cursor-se-resize shadow-md hover:scale-110 transition-transform"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
        />
      )}
    </div>
  );
};

export default VideoHotspot;
