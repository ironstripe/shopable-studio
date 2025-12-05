import { useState, useEffect } from "react";
import { Hotspot, ClickBehavior } from "@/types/video";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { X, Check, ShoppingBag, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

// Template families
type TemplateFamily = "ecommerce" | "luxury" | "seasonal";

// Style definitions per family
const FAMILY_STYLES: Record<TemplateFamily, { id: string; label: string; preview: string }[]> = {
  ecommerce: [
    { id: "light-card", label: "Light Card", preview: "Clean white card" },
    { id: "sale-boost", label: "Sale Boost", preview: "Promo badge style" },
    { id: "minimal", label: "Minimal", preview: "Ultra-clean" },
  ],
  luxury: [
    { id: "ultra-clean", label: "Ultra-Clean", preview: "Premium white" },
    { id: "serif-premium", label: "Serif Premium", preview: "Gold accents" },
    { id: "monochrome", label: "Monochrome", preview: "Black & white" },
  ],
  seasonal: [
    { id: "easter", label: "Easter", preview: "Pastel colors" },
    { id: "mothers-day", label: "Mother's Day", preview: "Pink & rose" },
    { id: "black-friday", label: "Black Friday", preview: "Bold contrast" },
  ],
};

// Default CTA labels per family
const FAMILY_CTA_DEFAULTS: Record<TemplateFamily, string> = {
  ecommerce: "Shop Now",
  luxury: "Discover",
  seasonal: "Get the Deal",
};

// Default click behavior per family
const FAMILY_CLICK_DEFAULTS: Record<TemplateFamily, ClickBehavior> = {
  ecommerce: "show-card",
  luxury: "show-card",
  seasonal: "direct-link",
};

interface LayoutBehaviorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspot: Hotspot | null;
  onUpdateHotspot: (hotspot: Hotspot) => void;
}

const LayoutBehaviorSheet = ({
  open,
  onOpenChange,
  hotspot,
  onUpdateHotspot,
}: LayoutBehaviorSheetProps) => {
  // Parse current style into family and variant
  const parseStyle = (style: string): { family: TemplateFamily; variant: string } => {
    // Map old styles to new families
    if (style.startsWith("ecommerce-line") || style.startsWith("badge-bubble")) {
      return { family: "ecommerce", variant: "light-card" };
    }
    if (style.startsWith("luxury-line")) {
      return { family: "luxury", variant: "ultra-clean" };
    }
    if (style.startsWith("editorial-line") || style.startsWith("minimal-dot")) {
      return { family: "luxury", variant: "monochrome" };
    }
    return { family: "ecommerce", variant: "light-card" };
  };

  const initialParsed = hotspot ? parseStyle(hotspot.style) : { family: "ecommerce" as TemplateFamily, variant: "light-card" };
  
  const [selectedFamily, setSelectedFamily] = useState<TemplateFamily>(initialParsed.family);
  const [selectedStyle, setSelectedStyle] = useState<string>(initialParsed.variant);
  const [ctaLabel, setCtaLabel] = useState(hotspot?.ctaLabel || "Shop Now");
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot?.clickBehavior || "show-card");
  const [duration, setDuration] = useState(hotspot ? hotspot.timeEnd - hotspot.timeStart : 3);

  // Reset form when hotspot changes
  useEffect(() => {
    if (hotspot) {
      const parsed = parseStyle(hotspot.style);
      setSelectedFamily(parsed.family);
      setSelectedStyle(parsed.variant);
      setCtaLabel(hotspot.ctaLabel || FAMILY_CTA_DEFAULTS[parsed.family]);
      setClickBehavior(hotspot.clickBehavior || FAMILY_CLICK_DEFAULTS[parsed.family]);
      setDuration(hotspot.timeEnd - hotspot.timeStart);
    }
  }, [hotspot?.id]);

  // Update defaults when family changes
  const handleFamilyChange = (family: TemplateFamily) => {
    setSelectedFamily(family);
    setSelectedStyle(FAMILY_STYLES[family][0].id);
    setCtaLabel(FAMILY_CTA_DEFAULTS[family]);
    setClickBehavior(FAMILY_CLICK_DEFAULTS[family]);
  };

  const handleSave = () => {
    if (!hotspot) return;
    
    // Convert to legacy style format for compatibility
    const legacyStyleMap: Record<string, string> = {
      "ecommerce-light-card": "ecommerce-line-compact-price-tag",
      "ecommerce-sale-boost": "ecommerce-line-cta-pill-focus",
      "ecommerce-minimal": "ecommerce-line-label-strip",
      "luxury-ultra-clean": "luxury-line-serif-whisper",
      "luxury-serif-premium": "luxury-line-gold-accent",
      "luxury-monochrome": "luxury-line-glass-veil",
      "seasonal-easter": "badge-bubble-classic",
      "seasonal-mothers-day": "badge-bubble-ghost",
      "seasonal-black-friday": "badge-bubble-accent-split",
    };

    const styleKey = `${selectedFamily}-${selectedStyle}`;
    const legacyStyle = legacyStyleMap[styleKey] || "badge-bubble-classic";

    onUpdateHotspot({
      ...hotspot,
      style: legacyStyle as Hotspot["style"],
      ctaLabel,
      clickBehavior,
      timeEnd: hotspot.timeStart + duration,
    });
    onOpenChange(false);
  };

  const isValid = selectedFamily && selectedStyle;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-2xl p-0 flex flex-col bg-background"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/30">
          <SheetClose asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </SheetClose>
          <SheetTitle className="text-base font-semibold">Layout & Behavior</SheetTitle>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid}
            className="h-9 px-4 rounded-full"
          >
            Save
          </Button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Section A: Template Family */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Template Family
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(["ecommerce", "luxury", "seasonal"] as TemplateFamily[]).map((family) => {
                const isActive = selectedFamily === family;
                const icons = {
                  ecommerce: ShoppingBag,
                  luxury: Sparkles,
                  seasonal: Gift,
                };
                const Icon = icons[family];
                const labels = {
                  ecommerce: "E-Commerce",
                  luxury: "Luxury",
                  seasonal: "Seasonal",
                };

                return (
                  <button
                    key={family}
                    onClick={() => handleFamilyChange(family)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-150",
                      "min-h-[80px]",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {labels[family]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section B: Style Selection Grid */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Style
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {FAMILY_STYLES[selectedFamily].map((style) => {
                const isActive = selectedStyle === style.id;
                
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-150",
                      "min-h-[100px]",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {/* Preview Thumbnail */}
                    <div className={cn(
                      "w-full aspect-square rounded-lg mb-2 flex items-center justify-center",
                      selectedFamily === "ecommerce" && "bg-gradient-to-br from-blue-50 to-blue-100",
                      selectedFamily === "luxury" && "bg-gradient-to-br from-amber-50 to-amber-100",
                      selectedFamily === "seasonal" && style.id === "easter" && "bg-gradient-to-br from-pink-50 to-purple-100",
                      selectedFamily === "seasonal" && style.id === "mothers-day" && "bg-gradient-to-br from-rose-50 to-pink-100",
                      selectedFamily === "seasonal" && style.id === "black-friday" && "bg-gradient-to-br from-gray-800 to-gray-900",
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        selectedFamily === "seasonal" && style.id === "black-friday"
                          ? "bg-red-500 text-white"
                          : "bg-white shadow-sm text-foreground"
                      )}>
                        1
                      </div>
                    </div>
                    
                    {/* Label */}
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {style.label}
                    </span>

                    {/* Checkmark */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section C: CTA & Click Behavior */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Call to Action
            </h3>
            
            {/* CTA Label */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-foreground">CTA Label</label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Shop Now"
                className="h-12 text-base bg-background border-border"
              />
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2">
                {["Shop Now", "Buy", "More Info", "Get Deal"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCtaLabel(preset)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                      ctaLabel === preset
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Click Behavior */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Click Behavior</label>
              <div className="flex rounded-xl border border-border overflow-hidden">
                {([
                  { value: "show-card", label: "Show card" },
                  { value: "direct-link", label: "Direct link" },
                  { value: "no-action", label: "No click" },
                ] as { value: ClickBehavior; label: string }[]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setClickBehavior(option.value)}
                    className={cn(
                      "flex-1 py-3 text-sm font-medium transition-colors",
                      clickBehavior === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section D: Timing */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Timing
            </h3>
            
            {/* Start Time (read-only) */}
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Start Time</span>
              <span className="text-sm font-medium text-foreground">
                {hotspot?.timeStart.toFixed(1)}s
              </span>
            </div>

            {/* Duration Slider */}
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Duration</span>
                <span className="text-sm font-semibold text-primary">
                  {duration.toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(values) => setDuration(values[0])}
                min={1}
                max={6}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1s</span>
                <span>6s</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 px-4 py-4 border-t border-border/30 bg-background pb-safe-plus">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 h-12 rounded-xl text-base"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LayoutBehaviorSheet;
