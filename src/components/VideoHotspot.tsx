import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";
import EmptyHotspotIndicator from "./EmptyHotspotIndicator";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isEditMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onTouchDragStart?: (e: React.TouchEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onTouchResizeStart?: (e: React.TouchEvent) => void;
  price?: string;
  hotspotIndex?: number;
  hasProduct: boolean;
  isHighlighted?: boolean;
  isNew?: boolean;
  isAnyEditing?: boolean; // True when ANY hotspot has toolbar/sheet open
}

const VideoHotspot = ({ 
  hotspot, 
  currentTime, 
  isSelected, 
  isDragging, 
  isResizing, 
  isEditMode, 
  onClick, 
  onDragStart,
  onTouchDragStart,
  onResizeStart,
  onTouchResizeStart,
  price, 
  hotspotIndex, 
  hasProduct,
  isHighlighted = false,
  isNew = false,
  isAnyEditing = false,
}: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;
  
  // Track if pop-in animation should play
  const [showPopIn, setShowPopIn] = useState(isNew);
  const [showSelectionHalo, setShowSelectionHalo] = useState(false);
  const prevSelectedRef = useRef(isSelected);

  // Clear pop-in after animation completes
  useEffect(() => {
    if (showPopIn) {
      const timer = setTimeout(() => setShowPopIn(false), 120);
      return () => clearTimeout(timer);
    }
  }, [showPopIn]);

  // Trigger selection halo when isSelected becomes true
  useEffect(() => {
    if (isSelected && !prevSelectedRef.current) {
      setShowSelectionHalo(true);
      const timer = setTimeout(() => setShowSelectionHalo(false), 200);
      return () => clearTimeout(timer);
    }
    prevSelectedRef.current = isSelected;
  }, [isSelected]);

  if (!isActive || countdown <= 0) return null;

  // Determine if this hotspot should be dimmed (another hotspot is being edited)
  const isDimmed = isAnyEditing && !isSelected;

  // In Edit mode, use larger touch area wrapper for assigned hotspots
  const editModeTouchWrapper = isEditMode && hasProduct;

  return (
    <div
      className={cn(
        "absolute select-none pointer-events-auto hotspot-draggable",
        isDragging ? "" : "transition-all duration-150",
        isSelected ? "hotspot-pulse" : "hotspot-pulse",
        isDragging ? "cursor-grabbing opacity-80" : isEditMode ? "cursor-grab" : "cursor-pointer",
        showPopIn && "animate-hotspot-pop-in",
        showSelectionHalo && "animate-selection-halo",
        isHighlighted && "hotspot-highlight-halo",
        // Active editing state
        isSelected && isAnyEditing && "hotspot-editing-active",
        // Dimmed state when another hotspot is being edited
        isDimmed && "hotspot-editing-dimmed"
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: showPopIn 
          ? undefined 
          : isSelected && isAnyEditing 
            ? "translate(-50%, -50%) scale(1.06)" 
            : "translate(-50%, -50%)",
        zIndex: isDragging || isResizing ? 100 : isSelected ? 50 : 10,
        touchAction: isEditMode ? 'none' : 'auto',
      }}
      onClick={isDimmed ? undefined : onClick}
      onMouseDown={isEditMode && !isDimmed ? onDragStart : undefined}
      onTouchStart={isEditMode && !isDimmed ? onTouchDragStart : undefined}
    >
      {!hasProduct ? (
        // Unassigned hotspot - EmptyHotspotIndicator handles its own larger size in edit mode
        <EmptyHotspotIndicator
          index={hotspotIndex || 0}
          isSelected={isSelected}
          isDragging={isDragging}
          isResizing={isResizing}
          scale={hotspot.scale}
          isEditMode={isEditMode}
        />
      ) : editModeTouchWrapper ? (
        // Assigned hotspot in Edit mode - wrap in larger touch area
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            width: '48px', 
            height: '48px',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          {/* Actual visual style renders at its normal size */}
          <HotspotIcon
            style={hotspot.style}
            countdown={countdown}
            ctaLabel={hotspot.ctaLabel}
            isSelected={isSelected}
            scale={hotspot.scale}
            price={price}
          />
        </div>
      ) : (
        // Assigned hotspot in Preview mode - render at actual style size
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
          className={cn(
            "absolute -bottom-2 -right-2 w-6 h-6 bg-white/85 border border-[#D0D0D0] rounded-full cursor-se-resize flex items-center justify-center transition-all hover:border-neutral-400 hover:shadow-sm hotspot-resize-handle",
            isResizing && "animate-resize-pulse"
          )}
          style={{ touchAction: 'none' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onTouchResizeStart?.(e);
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
