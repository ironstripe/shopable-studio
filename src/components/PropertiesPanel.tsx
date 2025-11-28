import { Hotspot, Product } from "@/types/video";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import ProductManager from "./ProductManager";

interface PropertiesPanelProps {
  selectedHotspot: Hotspot | null;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onUpdateProducts: (products: Record<string, Product>) => void;
  onClose: () => void;
}

const PropertiesPanel = ({
  selectedHotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onUpdateProducts,
  onClose,
}: PropertiesPanelProps) => {
  if (!selectedHotspot) {
    return null;
  }

  const duration = selectedHotspot.timeEnd - selectedHotspot.timeStart;

  return (
    <div className="fixed right-0 top-0 h-full w-[360px] bg-[#1A1A1A] border-l border-border shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Hotspot Properties</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* TIME Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Time
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="timeStart" className="text-[#CCCCCC] text-sm mb-1.5 block">
                Start Time (s)
              </Label>
              <Input
                id="timeStart"
                type="number"
                step="0.01"
                value={selectedHotspot.timeStart.toFixed(2)}
                onChange={(e) =>
                  onUpdateHotspot({
                    ...selectedHotspot,
                    timeStart: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-[#242424] border-[#333333] text-white"
              />
            </div>

            <div>
              <Label htmlFor="timeEnd" className="text-[#CCCCCC] text-sm mb-1.5 block">
                End Time (s)
              </Label>
              <Input
                id="timeEnd"
                type="number"
                step="0.01"
                value={selectedHotspot.timeEnd.toFixed(2)}
                onChange={(e) =>
                  onUpdateHotspot({
                    ...selectedHotspot,
                    timeEnd: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-[#242424] border-[#333333] text-white"
              />
            </div>

            <div>
              <Label className="text-[#CCCCCC] text-sm mb-1.5 block">
                Duration
              </Label>
              <Input
                value={`${duration.toFixed(2)} s`}
                disabled
                className="bg-[#242424] border-[#333333] text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* PRODUCT Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Product
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="productId" className="text-[#CCCCCC] text-sm mb-1.5 block">
                Product
              </Label>
              <Select
                value={selectedHotspot.productId}
                onValueChange={(value) =>
                  onUpdateHotspot({ ...selectedHotspot, productId: value })
                }
              >
                <SelectTrigger className="bg-[#242424] border-[#333333] text-white">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(products).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ProductManager
              products={products}
              onUpdateProducts={onUpdateProducts}
            />
          </div>
        </div>

        {/* POSITION Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Position
          </h3>
          <div className="space-y-3">
            <div>
              <Label className="text-[#CCCCCC] text-sm mb-1.5 block">
                X (%)
              </Label>
              <Input
                value={`${(selectedHotspot.x * 100).toFixed(1)}%`}
                disabled
                className="bg-[#242424] border-[#333333] text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-[#CCCCCC] text-sm mb-1.5 block">
                Y (%)
              </Label>
              <Input
                value={`${(selectedHotspot.y * 100).toFixed(1)}%`}
                disabled
                className="bg-[#242424] border-[#333333] text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* DELETE Section */}
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              onDeleteHotspot(selectedHotspot.id);
              onClose();
            }}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete Hotspot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
