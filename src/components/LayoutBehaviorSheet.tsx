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

// Template families - simplified to 3
type TemplateFamily = "ecommerce" | "luxury" | "seasonal";

// Family configuration with main style and locked specials
interface FamilyConfig {
  label: string;
  description: string;
  mainStyle: HotspotStyle;
  lockedStyles?: { id: HotspotStyle; label: string }[];
}

const FAMILY_CONFIG: Record<TemplateFamily, FamilyConfig> = {
  ecommerce: {
    label: "E-Commerce",
    description: "Clean card for classic shop setups",
    mainStyle: "ecommerce-light-card",
  },
  luxury: {
    label: "Luxury Line",
    description: "Ultra-clean, subtle, for premium brands",
    mainStyle: "luxury-fine-line",
  },
  seasonal: {
    label: "Seasonal Specials",
    description: "Designed for campaigns",
    mainStyle: "seasonal-standard",
    lockedStyles: [
      { id: "seasonal-valentine", label: "Valentine" },
      { id: "seasonal-easter", label: "Easter" },
      { id: "seasonal-black-friday", label: "Black Friday" },
    ],
  },
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

  // Parse current style into family
  const parseFamily = (style: HotspotStyle): TemplateFamily => {
    if (style.startsWith("ecommerce")) return "ecommerce";
    if (style.startsWith("luxury")) return "luxury";
    if (style.startsWith("seasonal")) return "seasonal";
    return "ecommerce";
  };

  const initialFamily = hotspot ? parseFamily(hotspot.style) : "ecommerce";
  
  const [selectedFamily, setSelectedFamily] = useState<TemplateFamily>(initialFamily);
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

  // Reset form when hotspot changes or when sheet opens
  useEffect(() => {
    if (hotspot && open) {
      const family = parseFamily(hotspot.style);
      setSelectedFamily(family);
      setCtaLabel(hotspot.ctaLabel || FAMILY_CTA_DEFAULTS[family]);
      setClickBehavior(hotspot.clickBehavior || FAMILY_CLICK_DEFAULTS[family]);
      setDuration(hotspot.timeEnd - hotspot.timeStart);
      // Reset countdown state
      setCountdownActive(hotspot.countdown?.active ?? false);
      setCountdownMode(hotspot.countdown?.mode ?? "fixed-end");
      setCountdownEndTime(hotspot.countdown?.endTime ?? "");
      setCountdownStyle(hotspot.countdown?.style ?? "light");
      setCountdownPosition(hotspot.countdown?.position ?? "below");
    }
  }, [hotspot?.id, hotspot?.style, hotspot?.revision, open]);

  // Update defaults when family changes
  const handleFamilyChange = (family: TemplateFamily) => {
    if (isPreviewMode) return;
    setSelectedFamily(family);
    setCtaLabel(FAMILY_CTA_DEFAULTS[family]);
    setClickBehavior(FAMILY_CLICK_DEFAULTS[family]);
  };

  const handleLockedStyleClick = (label: string) => {
    toast({
      title: `${label} template`,
      description: "This seasonal template will be available in a future update.",
    });
  };

  const handleSave = () => {
    if (!hotspot || isPreviewMode) return;
    
    // Get the main style from the selected family
    const hotspotStyle = FAMILY_CONFIG[selectedFamily].mainStyle;

    onUpdateHotspot({
      ...hotspot,
      style: hotspotStyle,
      ctaLabel,
      clickBehavior,
      timeEnd: hotspot.timeStart + duration,
      cardStyle: hotspotStyle as Hotspot["cardStyle"],
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

  const isDisabled = isPreviewMode;
  const endTime = (hotspot?.timeStart || 0) + duration;
  const currentFamilyConfig = FAMILY_CONFIG[selectedFamily];

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
            disabled={isDisabled}
            className="h-9 px-5 rounded-full bg-primary text-white text-[14px] font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-40 space-y-6">
          
          {/* Section 1: Template Family */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Template Family
            </h3>
            
            <div className="space-y-2">
              {(Object.keys(FAMILY_CONFIG) as TemplateFamily[]).map((family) => {
                const config = FAMILY_CONFIG[family];
                const isActive = selectedFamily === family;
                
                return (
                  <button
                    key={family}
                    onClick={() => handleFamilyChange(family)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Preview thumbnail */}
                    <div className="w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                      <HotspotStylePreview
                        family={family}
                        hotspotStyle={config.mainStyle}
                        isActive={isActive}
                        ctaLabel={ctaLabel || "Shop"}
                      />
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "text-[15px] font-medium",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {config.label}
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                    
                    {/* Checkmark */}
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Style - Main style + Locked Specials */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Style
            </h3>
            
            {/* Main Style Preview (large) */}
            <div className="mb-4">
              <div className="relative aspect-[2/1] rounded-xl overflow-hidden border-2 border-primary shadow-md">
                <HotspotStylePreview
                  family={selectedFamily}
                  hotspotStyle={currentFamilyConfig.mainStyle}
                  isActive={true}
                  ctaLabel={ctaLabel || "Shop"}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <span className="text-white text-[13px] font-medium">
                    {currentFamilyConfig.label} Style
                  </span>
                </div>
              </div>
            </div>

            {/* Locked Specials (only for seasonal family) */}
            {currentFamilyConfig.lockedStyles && currentFamilyConfig.lockedStyles.length > 0 && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-3">
                  More styles coming soon:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {currentFamilyConfig.lockedStyles.map((locked) => (
                    <button
                      key={locked.id}
                      onClick={() => handleLockedStyleClick(locked.label)}
                      className="relative flex flex-col overflow-hidden rounded-lg border border-border opacity-70 hover:opacity-90 transition-opacity"
                    >
                      <div className="aspect-[1.2/1]">
                        <HotspotStylePreview
                          family={selectedFamily}
                          hotspotStyle={locked.id}
                          isActive={false}
                          ctaLabel={ctaLabel || "Shop"}
                          isLocked={true}
                        />
                      </div>
                      <div className="px-2 py-1.5 bg-muted/50 border-t border-border">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {locked.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

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
              Countdown Timer
            </h3>
            
            {/* Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <span className="text-[14px] font-medium text-foreground">Enable Countdown</span>
                <p className="text-[12px] text-muted-foreground">Show urgency timer on hotspot</p>
              </div>
              <Switch
                checked={countdownActive}
                onCheckedChange={setCountdownActive}
                disabled={isDisabled}
              />
            </div>

            {countdownActive && (
              <div className="space-y-4 pt-4 animate-fade-in-up">
                {/* Mode */}
                <div>
                  <label className="text-[13px] font-medium text-foreground mb-2 block">Mode</label>
                  <div className="flex p-1 rounded-full bg-muted border border-border">
                    {[
                      { value: "fixed-end" as CountdownMode, label: "Fixed End" },
                      { value: "evergreen" as CountdownMode, label: "Evergreen" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownMode(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2 text-[13px] font-medium rounded-full transition-all",
                          countdownMode === option.value
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fixed End Time input */}
                {countdownMode === "fixed-end" && (
                  <div>
                    <label className="text-[13px] font-medium text-foreground mb-2 block">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={countdownEndTime}
                      onChange={(e) => setCountdownEndTime(e.target.value)}
                      disabled={isDisabled}
                      className="h-12 bg-background border-border rounded-xl"
                    />
                  </div>
                )}

                {/* Style */}
                <div>
                  <label className="text-[13px] font-medium text-foreground mb-2 block">Style</label>
                  <div className="flex p-1 rounded-full bg-muted border border-border">
                    {[
                      { value: "light" as CountdownStyle, label: "Light" },
                      { value: "bold" as CountdownStyle, label: "Bold" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownStyle(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2 text-[13px] font-medium rounded-full transition-all",
                          countdownStyle === option.value
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="text-[13px] font-medium text-foreground mb-2 block">Position</label>
                  <div className="flex p-1 rounded-full bg-muted border border-border">
                    {[
                      { value: "above" as CountdownPosition, label: "Above" },
                      { value: "below" as CountdownPosition, label: "Below" },
                      { value: "top-right" as CountdownPosition, label: "Corner" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownPosition(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2 text-[13px] font-medium rounded-full transition-all",
                          countdownPosition === option.value
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground"
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

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 p-5 bg-white border-t border-[#EBEBEB] safe-area-bottom">
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
              disabled={isDisabled}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium bg-primary hover:bg-primary/90"
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
