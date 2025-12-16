import { Hotspot } from "@/types/video";
import HotspotIcon from "./HotspotIcon";
import EmptyHotspotIndicator from "./EmptyHotspotIndicator";
import HotspotCountdown from "./HotspotCountdown";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { AlertCircle } from "lucide-react";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isEditMode: boolean;
  isAddingHotspot?: boolean;
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
  isAnyEditing?: boolean;
  forceVisible?: boolean;
  onContentMeasure?: (width: number, height: number) => void;
  // TOP-LEFT positioning: derived position for rendering
  renderX?: number;  // normalized 0-1, TOP-LEFT
  renderY?: number;  // normalized 0-1, TOP-LEFT
}

const VideoHotspot = ({ 
  hotspot, 
  currentTime, 
  isSelected, 
  isDragging, 
  isResizing, 
  isEditMode, 
  isAddingHotspot = false,
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
  onContentMeasure,
  renderX,  // TOP-LEFT X position (normalized 0-1)
  renderY,  // TOP-LEFT Y position (normalized 0-1)
}: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
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

  // Measure CONTENT ONLY (not wrapper with toolbar) and report via callback
  // Also set up ResizeObserver for dynamic size changes
  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || !onContentMeasure) return;

    const measure = () => {
      const rect = contentEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        onContentMeasure(rect.width, rect.height);
      }
    };

    // Initial measurement
    measure();

    // ResizeObserver for dynamic content size changes
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(contentEl);

    return () => {
      observer.disconnect();
    };
  }, [onContentMeasure, hasProduct, hotspot.style, hotspot.scale]);

  // Allow forced visibility when selected/editing (even if outside time range)
  if (!forceVisible && (!isActive || countdown <= 0)) return null;

  // Determine if this hotspot should be dimmed (another hotspot is being edited)
  const isDimmed = isAnyEditing && !isSelected;


  return (
    <div
      ref={wrapperRef}
      className={cn(
        "absolute select-none pointer-events-auto hotspot-draggable",
        isDragging ? "" : "transition-all duration-150",
        isSelected ? "hotspot-pulse" : "hotspot-pulse",
        // Cursor: pointer in adding mode (to select), grab for edit mode, pointer for preview/dimmed
        isDragging ? "cursor-grabbing opacity-80" 
          : isAddingHotspot ? "cursor-pointer"
          : isDimmed ? "cursor-pointer" 
          : isEditMode ? "cursor-grab" 
          : "cursor-pointer",
        showPopIn && "animate-hotspot-pop-in",
        showSelectionHalo && "animate-selection-halo",
        isHighlighted && "hotspot-highlight-halo",
        // Active editing state
        isSelected && isAnyEditing && "hotspot-editing-active",
        // Dimmed state when another hotspot is being edited - but STILL CLICKABLE
        isDimmed && "hotspot-editing-dimmed"
      )}
      style={{
        // TOP-LEFT positioning: use renderX/renderY if provided, fallback to hotspot.x/y
        // NO translate(-50%, -50%) - position is already top-left
        left: `${(renderX ?? hotspot.x) * 100}%`,
        top: `${(renderY ?? hotspot.y) * 100}%`,
        // Only apply scale transform for selection effect, NOT translation
        transform: showPopIn 
          ? undefined 
          : isSelected && isAnyEditing 
            ? "scale(1.06)" 
            : undefined,
        zIndex: isDragging || isResizing ? 100 : isSelected ? 50 : 10,
        touchAction: isEditMode ? 'none' : 'auto',
      }}
      onClick={onClick}
      onMouseDown={isEditMode ? onDragStart : undefined}
      onTouchStart={isEditMode ? onTouchDragStart : undefined}
    >
      {/* Incomplete warning badge - show in edit mode for hotspots without products */}
      {isEditMode && !hasProduct && !isSelected && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm animate-pulse">
            <AlertCircle className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      )}
      
      {/* CONTENT REF: Wrap only the visual content that must stay in safe zone */}
      <div ref={contentRef}>
        {!hasProduct ? (
          // Unassigned hotspot
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
            
            {/* Hotspot card wrapper - SCALE APPLIED HERE */}
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
              
              {/* Countdown CORNER (absolute positioned - extends outside, NOT measured) */}
              {hotspot.countdown?.active && hotspot.countdown.position === "corner" && (
                <div className="absolute -top-2 -right-2 z-[15]">
                  <HotspotCountdown 
                    config={hotspot.countdown} 
                    isPreviewMode={!isEditMode} 
                    scale={hotspot.scale * 0.85}
                  />
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
      
      {/* Resize handle - OUTSIDE contentRef, NOT measured */}
      {isEditMode && isSelected && hasProduct && (
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
  );
};

export default VideoHotspot;
