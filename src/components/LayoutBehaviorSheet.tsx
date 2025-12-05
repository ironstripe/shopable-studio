import { useState, useEffect } from "react";
import { Hotspot, ClickBehavior } from "@/types/video";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { X, Check, ShoppingBag, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    if (isPreviewMode) return;
    setSelectedFamily(family);
    setSelectedStyle(FAMILY_STYLES[family][0].id);
    setCtaLabel(FAMILY_CTA_DEFAULTS[family]);
    setClickBehavior(FAMILY_CLICK_DEFAULTS[family]);
  };

  const handleSave = () => {
    if (!hotspot || isPreviewMode) return;
    
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
  const isDisabled = isPreviewMode;

  const familyIcons = {
    ecommerce: ShoppingBag,
    luxury: Sparkles,
    seasonal: Gift,
  };

  const familyLabels = {
    ecommerce: "E-Commerce",
    luxury: "Luxury",
    seasonal: "Seasonal",
  };

  const familyCaptions = {
    ecommerce: "Shop-ready",
    luxury: "Premium feel",
    seasonal: "Time-limited",
  };

  const endTime = (hotspot?.timeStart || 0) + duration;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[92vh] rounded-t-[20px] p-0 flex flex-col bg-white"
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
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32 space-y-8">
          {/* Section 1: Template Family */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Template Family
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(["ecommerce", "luxury", "seasonal"] as TemplateFamily[]).map((family) => {
                const isActive = selectedFamily === family;
                const Icon = familyIcons[family];

                return (
                  <button
                    key={family}
                    onClick={() => handleFamilyChange(family)}
                    disabled={isDisabled}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl border-2 transition-all duration-150",
                      isActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-[#E5E5E5] bg-white hover:border-primary/40 hover:bg-[#FAFAFA]",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* 56×56 Icon Container */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      isActive ? "bg-primary/10" : "bg-[#F5F5F7]"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7 transition-colors",
                        isActive ? "text-primary" : "text-[#666666]"
                      )} />
                    </div>
                    <div className="text-center">
                      <span className={cn(
                        "text-[13px] font-semibold block transition-colors",
                        isActive ? "text-primary" : "text-[#333333]"
                      )}>
                        {familyLabels[family]}
                      </span>
                      <span className="text-[11px] text-[#999999]">
                        {familyCaptions[family]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Style Variants (fade-in after family selected) */}
          {selectedFamily && (
            <section className="animate-fade-in-up">
              <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Style
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {FAMILY_STYLES[selectedFamily].map((style) => {
                  const isActive = selectedStyle === style.id;
                  
                  return (
                    <button
                      key={style.id}
                      onClick={() => !isDisabled && setSelectedStyle(style.id)}
                      disabled={isDisabled}
                      className={cn(
                        "relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-120",
                        isActive
                          ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(14,118,253,0.15)]"
                          : "border-[#E5E5E5] bg-white hover:border-primary/40",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* 64×64 Preview Thumbnail */}
                      <div className={cn(
                        "w-16 h-16 rounded-xl mb-2.5 overflow-hidden flex items-center justify-center",
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
                            : "bg-white shadow-sm text-[#333333]"
                        )}>
                          1
                        </div>
                      </div>
                      
                      <span className={cn(
                        "text-[12px] font-medium text-center transition-colors",
                        isActive ? "text-primary" : "text-[#444444]"
                      )}>
                        {style.label}
                      </span>

                      {/* Checkmark badge */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
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
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              CTA Label
            </h3>
            
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Enter button text..."
              disabled={isDisabled}
              className="h-14 text-[16px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl mb-3 focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            
            {/* Pill presets */}
            <div className="flex flex-wrap gap-2">
              {["Shop Now", "Buy", "Learn More", "Get Deal", "View Details"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => !isDisabled && setCtaLabel(preset)}
                  disabled={isDisabled}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-120",
                    ctaLabel === preset
                      ? "bg-primary text-white"
                      : "bg-[#F5F5F7] text-[#555555] hover:bg-[#EBEBEB]",
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
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Click Behavior
            </h3>
            
            <div className="flex p-1 rounded-2xl bg-[#F5F5F7] border border-[#E5E5E5]">
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
                    "flex-1 py-3 text-[13px] font-medium rounded-xl transition-all duration-150",
                    clickBehavior === option.value
                      ? "bg-white text-primary font-semibold shadow-sm"
                      : "text-[#666666] hover:text-[#333333]",
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
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Timing
            </h3>
            
            {/* Start Time (read-only) */}
            <div className="flex items-center justify-between py-3 border-b border-[#EBEBEB]">
              <span className="text-[14px] text-[#666666]">Start Time</span>
              <span className="text-[14px] font-semibold text-[#111111]">
                {hotspot?.timeStart.toFixed(1)}s
              </span>
            </div>

            {/* Duration with slider */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-medium text-[#333333]">Duration</span>
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
              <div className="flex justify-between text-[11px] text-[#999999] mt-2">
                <span>1s</span>
                <span>6s</span>
              </div>
            </div>

            {/* Auto-calculated End Time (subtle) */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-[#999999]">End Time (auto)</span>
              <span className="text-[12px] text-[#999999]">
                {endTime.toFixed(1)}s
              </span>
            </div>
          </section>
        </div>

        {/* Sticky Footer with Shadow */}
        <div className="sticky bottom-0 px-5 py-4 bg-white border-t border-[#EBEBEB] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe-plus">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium border-[#E0E0E0] text-[#555555] hover:bg-[#F5F5F5] bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isDisabled}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
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