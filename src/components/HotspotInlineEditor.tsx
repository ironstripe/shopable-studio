import { useState } from "react";
import { Hotspot, Product } from "@/types/video";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tag, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductPanel from "./ProductPanel";
import LayoutBehaviorPanel from "./LayoutBehaviorPanel";

interface HotspotInlineEditorProps {
  hotspot: Hotspot;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: () => void;
  onUpdateProduct: (product: Product) => void;
  onCreateProduct: (product: Omit<Product, "id">) => void;
}

const HotspotInlineEditor = ({
  hotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onUpdateProduct,
  onCreateProduct,
}: HotspotInlineEditorProps) => {
  const [productOpen, setProductOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);

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
      {/* Product Selector */}
      <Popover open={productOpen} onOpenChange={setProductOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]",
              productOpen ? "bg-[rgba(59,130,246,0.12)] text-[#3B82F6]" : "text-[#374151]"
            )}
            title="Change Product"
          >
            <Tag className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0 shadow-none" align="start" sideOffset={8}>
          <ProductPanel
            products={products}
            selectedProductId={hotspot.productId}
            onSelectProduct={(productId) => {
              onUpdateHotspot({ ...hotspot, productId });
              setProductOpen(false);
            }}
            onUpdateProduct={onUpdateProduct}
            onCreateProduct={(newProduct) => {
              const id = `product-${Date.now()}`;
              onCreateProduct(newProduct);
              onUpdateHotspot({ ...hotspot, productId: id });
            }}
            onClose={() => setProductOpen(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Layout & Behavior */}
      <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]",
              layoutOpen ? "bg-[rgba(59,130,246,0.12)] text-[#3B82F6]" : "text-[#374151]"
            )}
            title="Layout & Behavior"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0 shadow-none" align="start" sideOffset={8}>
          <LayoutBehaviorPanel
            hotspot={hotspot}
            onUpdateHotspot={(updated) => {
              onUpdateHotspot(updated);
              setLayoutOpen(false);
            }}
            onClose={() => setLayoutOpen(false)}
          />
        </PopoverContent>
      </Popover>

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
