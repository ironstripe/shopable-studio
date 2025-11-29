import { Hotspot, Product, ClickBehavior } from "@/types/video";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import ProductManager from "./ProductManager";
import HotspotList from "./HotspotList";

interface PropertiesPanelProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onUpdateProducts: (products: Record<string, Product>) => void;
  onSelectFromList: (hotspot: Hotspot) => void;
  onClose: () => void;
  onClosePanel: () => void;
}

const PropertiesPanel = ({
  hotspots,
  selectedHotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
  onUpdateProducts,
  onSelectFromList,
  onClose,
  onClosePanel,
}: PropertiesPanelProps) => {
  const duration = selectedHotspot ? selectedHotspot.timeEnd - selectedHotspot.timeStart : 0;

  return (
    <div className="fixed right-0 top-0 h-full w-[360px] bg-[#1A1A1A] border-l border-border shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Editor</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClosePanel}
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Hotspot List - Always visible */}
      <HotspotList
        hotspots={hotspots}
        products={products}
        selectedHotspotId={selectedHotspot?.id || null}
        onSelectHotspot={onSelectFromList}
        onDeleteHotspot={onDeleteHotspot}
      />

      {/* Hotspot Properties - Only when selected */}
      {selectedHotspot && (
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

        {/* CLICK BEHAVIOR Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Click Behavior
          </h3>
          <RadioGroup
            value={selectedHotspot.clickBehavior}
            onValueChange={(value) =>
              onUpdateHotspot({ ...selectedHotspot, clickBehavior: value as ClickBehavior })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card-then-shop" id="card-then-shop" />
              <Label htmlFor="card-then-shop" className="text-[#CCCCCC] text-sm cursor-pointer">
                Product Card → Shop (Standard)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct-shop" id="direct-shop" />
              <Label htmlFor="direct-shop" className="text-[#CCCCCC] text-sm cursor-pointer">
                Direct to Shop
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card-only" id="card-only" />
              <Label htmlFor="card-only" className="text-[#CCCCCC] text-sm cursor-pointer">
                Product Card only
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* STYLE Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Style
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="hotspotStyle" className="text-[#CCCCCC] text-sm mb-1.5 block">
                Hotspot Style
              </Label>
              <Select
                value={selectedHotspot.style}
                onValueChange={(value) =>
                  onUpdateHotspot({ ...selectedHotspot, style: value as any })
                }
              >
                <SelectTrigger className="bg-[#242424] border-[#333333] text-white">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart-badge">Smart Badge</SelectItem>
                  <SelectItem value="screen">Screen Icon</SelectItem>
                  <SelectItem value="flash-circle">Flash Circle</SelectItem>
                  <SelectItem value="tag-bubble">Tag Bubble</SelectItem>
                  <SelectItem value="lux-dot">Luxury Dot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ctaLabel" className="text-[#CCCCCC] text-sm mb-1.5 block">
                CTA Label
              </Label>
              <Input
                id="ctaLabel"
                type="text"
                value={selectedHotspot.ctaLabel}
                onChange={(e) =>
                  onUpdateHotspot({
                    ...selectedHotspot,
                    ctaLabel: e.target.value,
                  })
                }
                placeholder="z.B. Kaufen"
                className="bg-[#242424] border-[#333333] text-white"
              />
            </div>
          </div>
        </div>

        {/* SIZE Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Size
          </h3>
          <div>
            <Label htmlFor="scale" className="text-[#CCCCCC] text-sm mb-1.5 block">
              Scale
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[selectedHotspot.scale * 100]}
                min={50}
                max={200}
                step={5}
                onValueChange={(value) =>
                  onUpdateHotspot({ ...selectedHotspot, scale: value[0] / 100 })
                }
                className="flex-1"
              />
              <span className="text-white text-sm w-16 text-right">
                {Math.round(selectedHotspot.scale * 100)}%
              </span>
            </div>
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
      )}
    </div>
  );
};

export default PropertiesPanel;
