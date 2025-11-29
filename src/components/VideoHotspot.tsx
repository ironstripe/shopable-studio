import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";
import EmptyHotspotIndicator from "./EmptyHotspotIndicator";

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
  price?: string;
  hotspotIndex?: number;
  hasProduct: boolean;
}

const VideoHotspot = ({ hotspot, currentTime, isSelected, isDragging, isResizing, isEditMode, onClick, onDragStart, onResizeStart, price, hotspotIndex, hasProduct }: VideoHotspotProps) => {
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
      {!hasProduct ? (
        <EmptyHotspotIndicator
          index={hotspotIndex || 0}
          isSelected={isSelected}
          isDragging={isDragging}
          isResizing={isResizing}
          scale={hotspot.scale}
        />
      ) : (
        <HotspotIcon
          style={hotspot.style}
          countdown={countdown}
          ctaLabel={hotspot.ctaLabel}
          isSelected={isSelected}
          scale={hotspot.scale}
          price={price}
        />
      )}
      
      {/* Resize handle - only visible in edit mode when selected */}
      {isEditMode && isSelected && (
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white/85 border border-[#D0D0D0] rounded-full cursor-se-resize flex items-center justify-center transition-all hover:border-neutral-400 hover:shadow-sm"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
        >
          {/* Diagonal resize icon */}
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 10 10" 
            className="text-neutral-500"
          >
            <path 
              d="M9 1L1 9M9 5L5 9" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default VideoHotspot;
