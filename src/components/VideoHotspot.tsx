import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";
import EmptyHotspotIndicator from "./EmptyHotspotIndicator";
import HotspotCountdown from "./HotspotCountdown";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useLayoutEffect } from "react";

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
  forceVisible?: boolean; // When true, always render even if outside time range
  onMeasure?: (id: string, width: number, height: number) => void; // Report measured dimensions
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
  forceVisible = false,
  onMeasure,
}: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;
  
  // Ref for measuring actual DOM dimensions
  const hotspotRef = useRef<HTMLDivElement>(null);
  
  // Track if pop-in animation should play
  const [showPopIn, setShowPopIn] = useState(isNew);
  const [showSelectionHalo, setShowSelectionHalo] = useState(false);
  const prevSelectedRef = useRef(isSelected);
  
  // Measure actual DOM dimensions after render and report to parent
  useLayoutEffect(() => {
    if (hotspotRef.current && onMeasure) {
      const rect = hotspotRef.current.getBoundingClientRect();
      onMeasure(hotspot.id, rect.width, rect.height);
    }
  }, [hotspot.id, hotspot.style, hotspot.scale, hasProduct, onMeasure]);

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

  // Allow forced visibility when selected/editing (even if outside time range)
  if (!forceVisible && (!isActive || countdown <= 0)) return null;

  // Determine if this hotspot should be dimmed (another hotspot is being edited)
  const isDimmed = isAnyEditing && !isSelected;


  return (
    <div
      ref={hotspotRef}
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
      ) : (
        // Assigned hotspot - render HotspotIcon with countdown and resize handle
        <div className="flex flex-col items-center gap-1.5">
          {/* Countdown ABOVE */}
          {hotspot.countdown?.active && hotspot.countdown.position === "above" && (
            <HotspotCountdown 
              config={hotspot.countdown} 
              isPreviewMode={!isEditMode} 
              scale={hotspot.scale}
            />
          )}
          
          {/* Hotspot card wrapper with resize handle - SCALE APPLIED HERE */}
          <div 
            className="relative"
            style={{ 
              transform: `scale(${hotspot.scale})`,
              transformOrigin: 'center center'
            }}
          >
            <HotspotIcon
              style={hotspot.style}
              source="video"
              countdown={countdown}
              ctaLabel={hotspot.ctaLabel}
              isSelected={isSelected}
              price={price}
            />
            
            {/* Countdown CORNER (absolute positioned) */}
            {hotspot.countdown?.active && hotspot.countdown.position === "corner" && (
              <div className="absolute -top-2 -right-2 z-[15]">
                <HotspotCountdown 
                  config={hotspot.countdown} 
                  isPreviewMode={!isEditMode} 
                  scale={hotspot.scale * 0.85}
                />
              </div>
            )}
            
            {/* Resize handle - positioned at bottom-right corner of actual card */}
            {isEditMode && isSelected && (
              <div
                className={cn(
                  "absolute w-5 h-5 bg-white/90 border border-neutral-300 rounded-full cursor-se-resize flex items-center justify-center transition-all hover:border-neutral-400 hover:shadow-sm hotspot-resize-handle pointer-events-auto",
                  isResizing && "animate-resize-pulse"
                )}
                style={{ 
                  bottom: '-10px', 
                  right: '-10px',
                  touchAction: 'none',
                  zIndex: 120,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onTouchResizeStart?.(e);
                }}
              >
                <svg 
                  width="8" 
                  height="8" 
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
          
          {/* Countdown BELOW */}
          {hotspot.countdown?.active && hotspot.countdown.position === "below" && (
            <HotspotCountdown 
              config={hotspot.countdown} 
              isPreviewMode={!isEditMode} 
              scale={hotspot.scale}
            />
          )}
        </div>
      )}
      
    </div>
  );
};

export default VideoHotspot;
