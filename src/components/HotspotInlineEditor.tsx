import { useEffect, useMemo } from "react";
import { Hotspot, Product } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Tag, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotspotInlineEditorProps {
  hotspot: Hotspot;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: () => void;
  onOpenProductSelection: (hotspotId: string) => void;
  onOpenLayoutSheet: (hotspot: Hotspot) => void;
  autoOpenProductPanel?: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

// Calculate smart position for toolbar to avoid viewport overflow
const useSmartToolbarPosition = (
  hotspotX: number, 
  hotspotY: number,
  containerWidth: number = 400,
  containerHeight: number = 600
) => {
  return useMemo(() => {
    const margin = 16;
    const toolbarWidth = 140;
    const toolbarHeight = 44;
    const hotspotSize = 32;
    
    // Calculate pixel positions
    const hotspotPixelX = hotspotX * containerWidth;
    const hotspotPixelY = hotspotY * containerHeight;
    
    // Determine horizontal placement
    let horizontal: 'left' | 'center' | 'right' = 'center';
    if (hotspotPixelX + toolbarWidth / 2 > containerWidth - margin) {
      horizontal = 'left'; // Place toolbar to the left of hotspot
    } else if (hotspotPixelX - toolbarWidth / 2 < margin) {
      horizontal = 'right'; // Place toolbar to the right of hotspot
    }
    
    // Determine vertical placement
    let vertical: 'above' | 'below' = 'below';
    const spaceBelow = containerHeight - hotspotPixelY - hotspotSize / 2;
    if (spaceBelow < toolbarHeight + margin + 20) {
      vertical = 'above';
    }
    
    return { horizontal, vertical };
  }, [hotspotX, hotspotY, containerWidth, containerHeight]);
};

const HotspotInlineEditor = ({
  hotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onOpenProductSelection,
  onOpenLayoutSheet,
  autoOpenProductPanel,
  containerWidth = 400,
  containerHeight = 600,
}: HotspotInlineEditorProps) => {
  const { horizontal, vertical } = useSmartToolbarPosition(
    hotspot.x, 
    hotspot.y, 
    containerWidth, 
    containerHeight
  );

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

  // Calculate transform based on smart positioning
  const getTransform = () => {
    const xTransform = horizontal === 'center' 
      ? '-50%' 
      : horizontal === 'left' 
        ? '-100%' 
        : '0%';
    
    const yTransform = vertical === 'below' 
      ? 'calc(100% + 12px)' 
      : 'calc(-100% - 12px)';
    
    return `translate(${xTransform}, ${yTransform})`;
  };

  // Calculate left position
  const getLeftStyle = () => {
    if (horizontal === 'center') {
      return `${hotspot.x * 100}%`;
    } else if (horizontal === 'left') {
      return `calc(${hotspot.x * 100}% - 8px)`;
    } else {
      return `calc(${hotspot.x * 100}% + 8px)`;
    }
  };

  return (
    <div
      className="absolute flex gap-1 bg-white border border-[rgba(0,0,0,0.12)] rounded-lg shadow-lg p-1 animate-scale-in"
      style={{
        left: getLeftStyle(),
        top: `${hotspot.y * 100}%`,
        transform: getTransform(),
        zIndex: 100,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Product Selector - now opens the sheet */}
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
