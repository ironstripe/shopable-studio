import { useEffect } from "react";
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
}

const HotspotInlineEditor = ({
  hotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onOpenProductSelection,
  onOpenLayoutSheet,
  autoOpenProductPanel,
}: HotspotInlineEditorProps) => {
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
      className="absolute flex gap-1 bg-white border border-[rgba(0,0,0,0.12)] rounded-lg shadow-lg p-1"
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, calc(100% + 12px))",
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
