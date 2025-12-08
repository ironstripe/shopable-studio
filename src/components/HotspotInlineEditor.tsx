import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { Hotspot, Product } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Tag, Settings, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotspotInlineEditorProps {
  hotspot: Hotspot;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: () => void;
  onOpenProductSelection: (hotspotId: string) => void;
  onOpenLayoutSheet: (hotspot: Hotspot) => void;
  autoOpenProductPanel?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

const HotspotInlineEditor = ({
  hotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onOpenProductSelection,
  onOpenLayoutSheet,
  autoOpenProductPanel,
  containerRef,
}: HotspotInlineEditorProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  
  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialOffsetRef = useRef({ x: 0, y: 0 });

  // Refs for stable access to current values in event listeners
  const hotspotRef = useRef(hotspot);
  const onUpdateHotspotRef = useRef(onUpdateHotspot);

  // Keep refs in sync
  useEffect(() => {
    hotspotRef.current = hotspot;
    onUpdateHotspotRef.current = onUpdateHotspot;
  });

  // Document-level pointer tracking for reliable dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      e.preventDefault();

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const newOffset = {
        x: initialOffsetRef.current.x + dx,
        y: initialOffsetRef.current.y + dy,
      };

      onUpdateHotspotRef.current({
        ...hotspotRef.current,
        toolbarOffset: newOffset,
      });
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [containerRef]);

  // Calculate toolbar position using bounding rects
  useLayoutEffect(() => {
    if (!containerRef.current || !toolbarRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const toolbar = toolbarRef.current.getBoundingClientRect();
    const gap = 12;
    const hotspotRadius = 16;

    // Hotspot position in pixels relative to container
    const hotspotCenterX = hotspot.x * container.width;
    const hotspotCenterY = hotspot.y * container.height;

    // Default: center toolbar above hotspot
    let left = hotspotCenterX - toolbar.width / 2;
    let top = hotspotCenterY - hotspotRadius - toolbar.height - gap;

    // If not enough space above → place below
    if (top < gap) {
      top = hotspotCenterY + hotspotRadius + gap;
    }

    // Apply custom offset if user dragged
    left += hotspot.toolbarOffset?.x ?? 0;
    top += hotspot.toolbarOffset?.y ?? 0;

    // Clamp to container bounds
    left = Math.max(gap, Math.min(container.width - toolbar.width - gap, left));
    top = Math.max(gap, Math.min(container.height - toolbar.height - gap, top));

    setPosition({ left, top });
    setIsPositioned(true);
  }, [hotspot.x, hotspot.y, hotspot.toolbarOffset, containerRef]);

  // Drag handler - only starts the drag, document listeners handle the rest
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't start drag if clicking a button
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = hotspot.toolbarOffset ?? { x: 0, y: 0 };
    
    document.body.style.cursor = 'grabbing';
  }, [hotspot.toolbarOffset]);

  // Auto-open product selection when requested
  useEffect(() => {
    if (autoOpenProductPanel && !hotspot.productId) {
      onOpenProductSelection(hotspot.id);
    }
  }, [autoOpenProductPanel, hotspot.id, hotspot.productId, onOpenProductSelection]);

  const hasProduct = !!hotspot.productId;

  // Redirect to product picker if trying to open layout without product
  const handleLayoutClick = () => {
    if (!hasProduct) {
      onOpenProductSelection(hotspot.id);
      return;
    }
    onOpenLayoutSheet(hotspot);
  };

  const handleProductClick = () => {
    onOpenProductSelection(hotspot.id);
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "absolute flex gap-0.5 bg-white border border-[rgba(0,0,0,0.12)] rounded-lg shadow-lg p-1 animate-toolbar-enter touch-none",
        !isPositioned && "opacity-0"
      )}
      style={{
        left: position.left,
        top: position.top,
        zIndex: 100,
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={handlePointerDown}
    >
      {/* Grip handle for dragging */}
      <div 
        className="flex items-center justify-center w-5 h-8 cursor-grab active:cursor-grabbing text-[#9CA3AF] hover:text-[#6B7280] rounded-md hover:bg-[rgba(0,0,0,0.04)]"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="w-px h-6 bg-[rgba(0,0,0,0.08)] my-auto" />

      {/* Product Selector */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleProductClick}
        className={cn(
          "h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]",
          "text-[#374151]"
        )}
        title={hasProduct ? "Change Product" : "Assign Product"}
      >
        <Tag className="w-4 h-4" />
      </Button>

      {/* Layout & Behavior - Only show if product is assigned */}
      {hasProduct && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLayoutClick}
          className={cn(
            "h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]",
            "text-[#374151]"
          )}
          title="Layout & Behavior"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Delete */}
      <div className="w-px h-6 bg-[rgba(0,0,0,0.08)] my-auto mx-0.5" />
      <Button
        size="sm"
        variant="ghost"
        onClick={onDeleteHotspot}
        className="h-8 w-8 p-0 text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
        title="Delete Hotspot"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default HotspotInlineEditor;
