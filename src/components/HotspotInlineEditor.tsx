import { useState } from "react";
import { Hotspot, Product, ClickBehavior } from "@/types/video";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Link2, Clock, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotspotInlineEditorProps {
  hotspot: Hotspot;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: () => void;
}

const HotspotInlineEditor = ({
  hotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
}: HotspotInlineEditorProps) => {
  const [productOpen, setProductOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);

  const currentProduct = products[hotspot.productId];

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
            className="h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]"
            title="Change Product"
          >
            <Tag className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#6B7280] uppercase">
              Product
            </Label>
            <Select
              value={hotspot.productId}
              onValueChange={(value) => {
                onUpdateHotspot({ ...hotspot, productId: value });
                setProductOpen(false);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
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
        </PopoverContent>
      </Popover>

      {/* Link Editor */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]"
            title="Edit Link"
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">
                Click Behavior
              </Label>
              <Select
                value={hotspot.clickBehavior}
                onValueChange={(value) =>
                  onUpdateHotspot({ ...hotspot, clickBehavior: value as ClickBehavior })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card-then-shop">Card → Shop</SelectItem>
                  <SelectItem value="direct-shop">Direct to Shop</SelectItem>
                  <SelectItem value="card-only">Card Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-link" className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">
                Product URL
              </Label>
              <Input
                id="product-link"
                type="url"
                value={currentProduct?.link || ""}
                disabled
                className="h-9 text-sm bg-[rgba(0,0,0,0.02)] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">
                Edit in Product Manager
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Time Editor */}
      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]"
            title="Adjust Timing"
          >
            <Clock className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div>
              <Label htmlFor="time-start" className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">
                Start (s)
              </Label>
              <Input
                id="time-start"
                type="number"
                step="0.1"
                value={hotspot.timeStart.toFixed(1)}
                onChange={(e) =>
                  onUpdateHotspot({
                    ...hotspot,
                    timeStart: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="time-end" className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5 block">
                End (s)
              </Label>
              <Input
                id="time-end"
                type="number"
                step="0.1"
                value={hotspot.timeEnd.toFixed(1)}
                onChange={(e) =>
                  onUpdateHotspot({
                    ...hotspot,
                    timeEnd: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="pt-1 border-t border-[rgba(0,0,0,0.06)]">
              <p className="text-[11px] text-[#6B7280]">
                Duration: {(hotspot.timeEnd - hotspot.timeStart).toFixed(1)}s
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* CTA Label Editor */}
      <Popover open={ctaOpen} onOpenChange={setCtaOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-[rgba(59,130,246,0.08)] hover:text-[#3B82F6]"
            title="Edit CTA Label"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <Label htmlFor="cta-label" className="text-xs font-semibold text-[#6B7280] uppercase">
              CTA Label
            </Label>
            <Input
              id="cta-label"
              type="text"
              value={hotspot.ctaLabel}
              onChange={(e) =>
                onUpdateHotspot({
                  ...hotspot,
                  ctaLabel: e.target.value,
                })
              }
              placeholder="e.g. Kaufen"
              className="h-9 text-sm"
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete */}
      <div className="w-px h-6 bg-[rgba(0,0,0,0.08)] my-auto mx-0.5" />
      <Button
        size="sm"
        variant="ghost"
        onClick={onDeleteHotspot}
        className="h-8 w-8 p-0 hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
        title="Delete Hotspot"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default HotspotInlineEditor;
