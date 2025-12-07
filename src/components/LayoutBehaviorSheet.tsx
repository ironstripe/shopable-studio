import { useState, useEffect } from "react";
import { Hotspot, ClickBehavior, HotspotStyle, CountdownStyle, CountdownPosition } from "@/types/video";
import {
  TemplateFamilyId,
  getFamilyById,
  getFamilyFromStyle,
} from "@/types/templates";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import HotspotStylePreview from "./HotspotStylePreview";
import TemplateFamilySelector from "./TemplateFamilySelector";

// CTA presets
const CTA_PRESETS = ["Shop Now", "Buy", "Learn More", "Get Deal"];

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

  const initialFamily = hotspot ? getFamilyFromStyle(hotspot.style) : "ecommerce";
  const initialStyle = hotspot?.style || "ecommerce-light-card";
  
  const [selectedFamily, setSelectedFamily] = useState<TemplateFamilyId>(initialFamily);
  const [selectedStyle, setSelectedStyle] = useState<HotspotStyle>(initialStyle);
  const [ctaLabel, setCtaLabel] = useState(hotspot?.ctaLabel || "Shop Now");
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot?.clickBehavior || "show-card");
  const [duration, setDuration] = useState(hotspot ? hotspot.timeEnd - hotspot.timeStart : 3);
  
  // Simplified countdown state (auto-counts down hotspot duration)
  const [countdownActive, setCountdownActive] = useState(hotspot?.countdown?.active ?? false);
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
      const family = getFamilyFromStyle(hotspot.style);
      const familyConfig = getFamilyById(family);
      setSelectedFamily(family);
      setSelectedStyle(hotspot.style);
      setCtaLabel(hotspot.ctaLabel || familyConfig?.defaultCtaLabel || "Shop Now");
      setClickBehavior(hotspot.clickBehavior || "show-card");
      setDuration(hotspot.timeEnd - hotspot.timeStart);
      setCountdownActive(hotspot.countdown?.active ?? false);
      setCountdownStyle(hotspot.countdown?.style ?? "light");
      // Migrate old "top-right" to "corner" (cast for legacy data compatibility)
      const pos = hotspot.countdown?.position as string | undefined;
      setCountdownPosition(pos === "top-right" ? "corner" : (pos as CountdownPosition) ?? "corner");
    }
  }, [hotspot?.id, hotspot?.style, hotspot?.revision, open]);

  // Update defaults when family changes
  const handleFamilyChange = (family: TemplateFamilyId) => {
    if (isPreviewMode) return;
    setSelectedFamily(family);
    const familyConfig = getFamilyById(family);
    if (familyConfig) {
      setSelectedStyle(familyConfig.mainStyle);
      setCtaLabel(familyConfig.defaultCtaLabel);
    }
  };

  const handleStyleChange = (style: HotspotStyle) => {
    if (isPreviewMode) return;
    setSelectedStyle(style);
  };

  const handleSave = () => {
    if (!hotspot || isPreviewMode) return;

    onUpdateHotspot({
      ...hotspot,
      style: selectedStyle,
      ctaLabel,
      clickBehavior,
      timeEnd: hotspot.timeStart + duration,
      cardStyle: selectedStyle as Hotspot["cardStyle"],
      countdown: {
        active: countdownActive,
        mode: "evergreen", // Simplified: always auto-countdown
        style: countdownStyle,
        position: countdownPosition,
      },
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isDisabled = isPreviewMode;
  const endTime = (hotspot?.timeStart || 0) + duration;
  const currentFamilyConfig = getFamilyById(selectedFamily);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] max-h-[90vh] rounded-t-[20px] p-0 flex flex-col bg-white overflow-hidden"
        hideCloseButton
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#D0D0D0]" />
        </div>

        {/* Header - Matching Product Sheet */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
          <button
            onClick={handleCancel}
            className="text-[15px] text-[#666666] hover:text-[#333333] transition-colors min-w-[60px] text-left font-medium"
          >
            Cancel
          </button>
          
          <h2 className="text-[17px] font-semibold text-[#111111]">
            Layout & Behavior
          </h2>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isDisabled}
            className="h-8 px-4 text-[14px] font-medium min-w-[60px] bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-40 space-y-6">
          
          {/* Section 1: Template Family - Compact list */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Template Family
            </h3>
            <TemplateFamilySelector
              value={selectedFamily}
              onChange={handleFamilyChange}
              disabled={isDisabled}
            />
          </section>

          {/* Section 2: Style Selection - Real HotspotIcon previews */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Style
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {currentFamilyConfig?.styles.map((styleOption) => {
                const isSelected = selectedStyle === styleOption.id;
                
                return (
                  <button
                    key={styleOption.id}
                    onClick={() => handleStyleChange(styleOption.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-150",
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-[#E5E5E5] hover:border-[#D0D0D0]",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Preview with real HotspotIcon */}
                    <div className="aspect-square">
                      <HotspotStylePreview
                        family={selectedFamily}
                        hotspotStyle={styleOption.id}
                        isActive={isSelected}
                        ctaLabel={ctaLabel || "Shop"}
                      />
                    </div>
                    
                    {/* Label */}
                    <div className={cn(
                      "px-2 py-2 bg-white border-t",
                      isSelected ? "border-primary/20" : "border-[#EBEBEB]"
                    )}>
                      <span className={cn(
                        "text-[12px] font-medium block truncate",
                        isSelected ? "text-primary" : "text-[#333333]"
                      )}>
                        {styleOption.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: CTA Label */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              CTA Label
            </h3>
            
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g. Shop Now"
              disabled={isDisabled}
              className="h-12 text-[15px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl mb-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            
            {/* Light grey pill presets */}
            <div className="flex flex-wrap gap-2">
              {CTA_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => !isDisabled && setCtaLabel(preset)}
                  disabled={isDisabled}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all",
                    ctaLabel === preset
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-[#F5F5F5] border-[#E0E0E0] text-[#666666] hover:border-[#CCCCCC]",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Click Behavior - Pill buttons */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Click Behavior
            </h3>
            
            <div className="flex gap-2">
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
                    "flex-1 py-2.5 text-[13px] font-medium rounded-full border transition-all min-h-[44px]",
                    clickBehavior === option.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-[#666666] border-[#E0E0E0] hover:border-[#CCCCCC]",
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
            
            {/* Start Time - editable */}
            <div className="flex items-center justify-between py-3 border-b border-[#EBEBEB]">
              <span className="text-[14px] text-[#666666]">Start Time</span>
              <span className="text-[14px] font-semibold text-[#111111]">
                {hotspot?.timeStart.toFixed(1)}s
              </span>
            </div>

            {/* Duration slider */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-medium text-[#111111]">Duration</span>
                <span className="text-[14px] font-semibold text-primary">
                  {duration.toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(values) => !isDisabled && setDuration(values[0])}
                min={1}
                max={10}
                step={0.5}
                disabled={isDisabled}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-[#999999] mt-2">
                <span>1s</span>
                <span>10s</span>
              </div>
            </div>

            {/* End Time - auto-calculated readonly */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-[#999999]">End Time (auto)</span>
              <span className="text-[12px] text-[#999999]">
                {endTime.toFixed(1)}s
              </span>
            </div>
          </section>

          {/* Section 6: Countdown Timer - Simplified */}
          <section>
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Countdown Timer
            </h3>
            
            {/* Toggle using pill buttons for visual consistency */}
            <div className="flex items-center justify-between py-3 border-b border-[#EBEBEB]">
              <div>
                <span className="text-[14px] font-medium text-[#111111] block">Show countdown timer</span>
                <span className="text-[12px] text-[#888888]">Counts down hotspot duration</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => !isDisabled && setCountdownActive(false)}
                  disabled={isDisabled}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all",
                    !countdownActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-[#666666] border-[#E0E0E0] hover:border-[#CCCCCC]",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Off
                </button>
                <button
                  onClick={() => !isDisabled && setCountdownActive(true)}
                  disabled={isDisabled}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all",
                    countdownActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-[#666666] border-[#E0E0E0] hover:border-[#CCCCCC]",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  On
                </button>
              </div>
            </div>

            {/* Settings (only show when active) */}
            {countdownActive && (
              <div className="pt-4 space-y-4">
                {/* Style - pill buttons */}
                <div>
                  <span className="text-[12px] text-[#888888] mb-2 block">Style</span>
                  <div className="flex gap-2">
                    {[
                      { value: "light" as CountdownStyle, label: "Light" },
                      { value: "bold" as CountdownStyle, label: "Bold" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownStyle(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2.5 text-[13px] font-medium rounded-full border transition-all min-h-[44px]",
                          countdownStyle === option.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-[#666666] border-[#E0E0E0] hover:border-[#CCCCCC]",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position - pill buttons */}
                <div>
                  <span className="text-[12px] text-[#888888] mb-2 block">Position</span>
                  <div className="flex gap-2">
                    {[
                      { value: "above" as CountdownPosition, label: "Above" },
                      { value: "below" as CountdownPosition, label: "Below" },
                      { value: "corner" as CountdownPosition, label: "Corner" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setCountdownPosition(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          "flex-1 py-2.5 text-[13px] font-medium rounded-full border transition-all min-h-[44px]",
                          countdownPosition === option.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-[#666666] border-[#E0E0E0] hover:border-[#CCCCCC]",
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

        {/* Sticky Footer - Matching Product Sheet */}
        <div className="border-t border-[#EBEBEB] p-4 pb-safe-plus bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="text-[15px] font-medium text-[#666666] hover:text-[#333333] transition-colors px-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={isDisabled}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium bg-primary text-white hover:bg-primary/90"
            >
              Save changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LayoutBehaviorSheet;