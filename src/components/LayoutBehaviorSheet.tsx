import { useState, useEffect } from "react";
import { Hotspot, ClickBehavior, HotspotStyle, CountdownMode, CountdownStyle, CountdownPosition } from "@/types/video";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import HotspotStylePreview from "./HotspotStylePreview";

// Template families
type TemplateFamily = "ecommerce" | "luxury" | "seasonal";

// Style definitions per family with actual HotspotStyle mappings
const FAMILY_STYLES: Record<TemplateFamily, { id: string; label: string; hotspotStyle: HotspotStyle }[]> = {
  ecommerce: [
    { id: "light-card", label: "Light Card", hotspotStyle: "ecommerce-line-compact-price-tag" },
    { id: "sale-boost", label: "Sale Boost", hotspotStyle: "ecommerce-line-cta-pill-focus" },
    { id: "minimal", label: "Minimal", hotspotStyle: "ecommerce-line-label-strip" },
  ],
  luxury: [
    { id: "black-glass", label: "Black Glass", hotspotStyle: "luxury-line-glass-veil" },
    { id: "fine-line", label: "Fine Line", hotspotStyle: "luxury-line-serif-whisper" },
    { id: "editorial", label: "Editorial", hotspotStyle: "editorial-line-headline-tag" },
  ],
  seasonal: [
    { id: "valentine", label: "Valentine", hotspotStyle: "seasonal-valentine" },
    { id: "easter", label: "Easter", hotspotStyle: "seasonal-easter" },
    { id: "black-friday", label: "Black Friday", hotspotStyle: "seasonal-black-friday" },
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
  isPreviewMode?: boolean;
  hasProductAssigned?: boolean;
}

const LayoutBehaviorSheet = ({
  open,
  onOpenChange,
  hotspot,
  onUpdateHotspot,
  isPreviewMode = false,
  hasProductAssigned = true,
}: LayoutBehaviorSheetProps) => {
  const { toast } = useToast();

  // Parse current style into family and variant
  const parseStyle = (style: string): { family: TemplateFamily; variant: string } => {
    // First, find which family and variant matches this hotspotStyle
    for (const [familyKey, variants] of Object.entries(FAMILY_STYLES)) {
      const matchedVariant = variants.find(v => v.hotspotStyle === style);
      if (matchedVariant) {
        return { 
          family: familyKey as TemplateFamily, 
          variant: matchedVariant.id 
        };
      }
    }
    
    // Fallback: try prefix matching for migrated/legacy styles
    if (style.startsWith("ecommerce-line") || style.startsWith("badge-bubble")) {
      return { family: "ecommerce", variant: "light-card" };
    }
    if (style.startsWith("luxury-line")) {
      return { family: "luxury", variant: "black-glass" };
    }
    if (style.startsWith("editorial-line") || style.startsWith("minimal-dot")) {
      return { family: "luxury", variant: "fine-line" };
    }
    if (style.startsWith("seasonal-")) {
      if (style.includes("valentine")) return { family: "seasonal", variant: "valentine" };
      if (style.includes("easter")) return { family: "seasonal", variant: "easter" };
      if (style.includes("black-friday")) return { family: "seasonal", variant: "black-friday" };
    }
    
    return { family: "ecommerce", variant: "light-card" };
  };

  const initialParsed = hotspot ? parseStyle(hotspot.style) : { family: "ecommerce" as TemplateFamily, variant: "light-card" };
  
  const [selectedFamily, setSelectedFamily] = useState<TemplateFamily>(initialParsed.family);
  const [selectedStyle, setSelectedStyle] = useState<string>(initialParsed.variant);
  const [ctaLabel, setCtaLabel] = useState(hotspot?.ctaLabel || "Shop Now");
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot?.clickBehavior || "show-card");
  const [duration, setDuration] = useState(hotspot ? hotspot.timeEnd - hotspot.timeStart : 3);
  
  // Countdown state
  const [countdownActive, setCountdownActive] = useState(hotspot?.countdown?.active ?? false);
  const [countdownMode, setCountdownMode] = useState<CountdownMode>(hotspot?.countdown?.mode ?? "fixed-end");
  const [countdownEndTime, setCountdownEndTime] = useState<string>(hotspot?.countdown?.endTime ?? "");
  const [countdownStyle, setCountdownStyle] = useState<CountdownStyle>(hotspot?.countdown?.style ?? "light");
  const [countdownPosition, setCountdownPosition] = useState<CountdownPosition>(hotspot?.countdown?.position ?? "below");

  // Check if product is assigned when opening
  useEffect(() => {
    if (open && !hasProductAssigned) {
      toast({
        title: "Assign a product first",
        description: "You need to assign a product before customizing layout & behavior.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  }, [open, hasProductAssigned, toast, onOpenChange]);

  // Reset form when hotspot changes or when sheet opens with updated hotspot data
  useEffect(() => {
    if (hotspot && open) {
      const parsed = parseStyle(hotspot.style);
      setSelectedFamily(parsed.family);
      setSelectedStyle(parsed.variant);
      setCtaLabel(hotspot.ctaLabel || FAMILY_CTA_DEFAULTS[parsed.family]);
      setClickBehavior(hotspot.clickBehavior || FAMILY_CLICK_DEFAULTS[parsed.family]);
      setDuration(hotspot.timeEnd - hotspot.timeStart);
      // Reset countdown state
      setCountdownActive(hotspot.countdown?.active ?? false);
      setCountdownMode(hotspot.countdown?.mode ?? "fixed-end");
      setCountdownEndTime(hotspot.countdown?.endTime ?? "");
      setCountdownStyle(hotspot.countdown?.style ?? "light");
      setCountdownPosition(hotspot.countdown?.position ?? "below");
    }
  }, [hotspot?.id, hotspot?.style, open]);

  // Update defaults when family changes
  const handleFamilyChange = (family: TemplateFamily) => {
    if (isPreviewMode) return;
    setSelectedFamily(family);
    setSelectedStyle(FAMILY_STYLES[family][0].id);
    setCtaLabel(FAMILY_CTA_DEFAULTS[family]);
    setClickBehavior(FAMILY_CLICK_DEFAULTS[family]);
  };

  const handleSave = () => {
    if (!hotspot || isPreviewMode) return;
    
    // Get the hotspotStyle from the selected style definition
    const selectedStyleDef = FAMILY_STYLES[selectedFamily].find(s => s.id === selectedStyle);
    const hotspotStyle = selectedStyleDef?.hotspotStyle || "ecommerce-line-compact-price-tag";

    onUpdateHotspot({
      ...hotspot,
      style: hotspotStyle as Hotspot["style"],
      ctaLabel,
      clickBehavior,
      timeEnd: hotspot.timeStart + duration,
      countdown: {
        active: countdownActive,
        mode: countdownMode,
        endTime: countdownMode === "fixed-end" ? countdownEndTime : undefined,
        style: countdownStyle,
        position: countdownPosition,
      },
    });
    onOpenChange(false);
  };

  const isValid = selectedFamily && selectedStyle;
  const isDisabled = isPreviewMode;

  const familyLabels = {
    ecommerce: "E-Commerce",
    luxury: "Luxury",
    seasonal: "Seasonal",
  };

  const endTime = (hotspot?.timeStart || 0) + duration;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[88vh] max-h-[88vh] rounded-t-[20px] p-0 flex flex-col bg-white overflow-hidden"
        hideCloseButton
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#D0D0D0]" />
        </div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[#EBEBEB] bg-white">
          <button
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5 text-[#666666]" />
          </button>
          
          <h2 className="text-[17px] font-semibold text-[#111111]">
            Layout & Behavior
          </h2>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid || isDisabled}
            className="h-9 px-5 rounded-full bg-primary text-white text-[14px] font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-40 space-y-6">
          {/* Section 1: Template Family - Compact Segmented Control */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Template Family
            </h3>
            <div className="flex p-1 rounded-full bg-muted border border-border">
              {(["ecommerce", "luxury", "seasonal"] as TemplateFamily[]).map((family) => (
                <button
                  key={family}
                  onClick={() => handleFamilyChange(family)}
                  disabled={isDisabled}
                  className={cn(
                    "flex-1 py-2.5 text-[14px] font-medium rounded-full transition-all duration-150 min-h-[44px]",
                    selectedFamily === family
                      ? "bg-background text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {familyLabels[family]}
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Style Variants with Real Visual Previews */}
          {selectedFamily && (
            <section className="animate-fade-in-up">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {FAMILY_STYLES[selectedFamily].map((style) => {
                  const isActive = selectedStyle === style.id;
                  
                  return (
                    <button
                      key={style.id}
                      onClick={() => !isDisabled && setSelectedStyle(style.id)}
                      disabled={isDisabled}
                      className={cn(
                        "relative flex flex-col overflow-hidden transition-all duration-150 min-h-[120px]",
                        "rounded-xl border-2",
                        isActive
                          ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)] scale-[1.02]"
                          : "border-border shadow-md hover:border-primary/40 hover:shadow-lg",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Real hotspot preview with blurred video background */}
                      <div className="flex-1">
                        <HotspotStylePreview 
                          family={selectedFamily}
                          hotspotStyle={style.hotspotStyle}
                          isActive={isActive}
                          ctaLabel={ctaLabel || "Shop"}
                        />
                      </div>
                      
                      {/* Label below preview */}
                      <div className="px-3 py-2 bg-background border-t border-border/50">
                        <span className={cn(
                          "text-[13px] font-medium transition-colors",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {style.label}
                        </span>
                      </div>

                      {/* Checkmark badge */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 3: CTA Label */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              CTA Label
            </h3>
            
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Enter button text..."
              disabled={isDisabled}
              className="h-12 text-[15px] bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl mb-3 focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            
            {/* Pill presets */}
            <div className="flex flex-wrap gap-2">
              {["Shop Now", "Buy", "Learn More", "Get Deal", "View Details"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => !isDisabled && setCtaLabel(preset)}
                  disabled={isDisabled}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-150 min-h-[44px]",
                    ctaLabel === preset
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Click Behavior */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Click Behavior
            </h3>
            
            <div className="flex p-1 rounded-full bg-muted border border-border">
              {[
                { value: "show-card" as ClickBehavior, label: "Show Card" },
                { value: "direct-link" as ClickBehavior, label: "Direct Link" },
                { value: "no-action" as ClickBehavior, label: "No Click" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => !isDisabled && setClickBehavior(option.value)}
                  disabled={isDisabled}
                  className={cn(
                    "flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all duration-150 min-h-[44px]",
                    clickBehavior === option.value
                      ? "bg-background text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Section 5: Timing */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Timing
            </h3>
            
            {/* Start Time (read-only) */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-[14px] text-muted-foreground">Start Time</span>
              <span className="text-[14px] font-semibold text-foreground">
                {hotspot?.timeStart.toFixed(1)}s
              </span>
            </div>

            {/* Duration with slider */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-medium text-foreground">Duration</span>
                <span className="text-[14px] font-bold text-primary">
                  {duration.toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(values) => !isDisabled && setDuration(values[0])}
                min={1}
                max={6}
                step={0.5}
                disabled={isDisabled}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>1s</span>
                <span>6s</span>
              </div>
            </div>

            {/* Auto-calculated End Time (subtle) */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-muted-foreground">End Time (auto)</span>
              <span className="text-[12px] text-muted-foreground">
                {endTime.toFixed(1)}s
              </span>
            </div>
          </section>

          {/* Section 6: Countdown */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Countdown
            </h3>
            
            {/* Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-[14px] text-foreground">Enable Countdown</span>
              <Switch 
                checked={countdownActive} 
                onCheckedChange={setCountdownActive}
                disabled={isDisabled}
              />
            </div>
            
            {/* Conditional fields - fade in when enabled */}
            {countdownActive && (
              <div className="animate-fade-in space-y-4 pt-4">
                {/* Mode Selection */}
                <div>
                  <span className="text-[13px] font-medium text-foreground mb-2 block">Mode</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                      <input 
                        type="radio" 
                        name="countdown-mode" 
                        value="fixed-end" 
                        checked={countdownMode === "fixed-end"} 
                        onChange={() => setCountdownMode("fixed-end")}
                        disabled={isDisabled}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-[14px] text-foreground">Fixed end time</span>
                    </label>
                    
                    {countdownMode === "fixed-end" && (
                      <div className="ml-7 animate-fade-in">
                        <input 
                          type="datetime-local" 
                          value={countdownEndTime} 
                          onChange={(e) => setCountdownEndTime(e.target.value)}
                          disabled={isDisabled}
                          className="w-full h-12 px-3 text-[14px] bg-background border border-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                        />
                      </div>
                    )}
                    
                    <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                      <input 
                        type="radio" 
                        name="countdown-mode" 
                        value="evergreen" 
                        checked={countdownMode === "evergreen"} 
                        onChange={() => setCountdownMode("evergreen")}
                        disabled={isDisabled}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-[14px] text-foreground">Evergreen</span>
                    </label>
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <span className="text-[13px] font-medium text-foreground mb-2 block">Style</span>
                  <div className="flex p-1 rounded-full bg-muted border border-border">
                    {(["light", "bold"] as CountdownStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => !isDisabled && setCountdownStyle(style)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all duration-150 min-h-[44px] capitalize",
                          countdownStyle === style
                            ? "bg-background text-primary font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Selection */}
                <div>
                  <span className="text-[13px] font-medium text-foreground mb-2 block">Position</span>
                  <div className="flex p-1 rounded-full bg-muted border border-border">
                    {([
                      { value: "below" as CountdownPosition, label: "Below" },
                      { value: "above" as CountdownPosition, label: "Above" },
                      { value: "top-right" as CountdownPosition, label: "Top-right" },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownPosition(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all duration-150 min-h-[44px]",
                          countdownPosition === option.value
                            ? "bg-background text-primary font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sticky Footer with Shadow */}
        <div className="sticky bottom-0 px-5 py-4 bg-background border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe-plus">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isDisabled}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium"
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