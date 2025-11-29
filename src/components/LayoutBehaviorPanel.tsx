import { useState } from "react";
import { Hotspot, HotspotStyle, HotspotType, HotspotVariant, ClickBehavior } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, AlertCircle } from "lucide-react";
import { usePanelResize } from "@/hooks/use-panel-resize";
import { ResizeHandle } from "@/components/ResizeHandle";

interface LayoutBehaviorPanelProps {
  hotspot: Hotspot;
  videoDuration?: number;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onClose: () => void;
}

// Migration map for old styles to new unified variants
const migrateOldStyle = (style: string): HotspotStyle => {
  const migrationMap: Record<string, HotspotStyle> = {
    "icon-only-filled": "icon-only-small",
    "icon-only-outline": "icon-only-light",
    "icon-only-glow": "icon-only-strong",
    "icon-cta-pill-standard": "icon-cta-pill-small",
    "icon-cta-pill-compact": "icon-cta-pill-light",
    "badge-bubble-small": "badge-bubble-small",
    "badge-bubble-large": "badge-bubble-large",
    "badge-bubble-light-shadow": "badge-bubble-light",
    "badge-bubble-strong-shadow": "badge-bubble-strong",
    "minimal-dot-default": "minimal-dot-small",
    "minimal-dot-pulse": "minimal-dot-strong",
  };
  return (migrationMap[style] || style) as HotspotStyle;
};

// Helper to extract type from combined style
const getTypeFromStyle = (style: HotspotStyle): HotspotType => {
  if (style.startsWith("icon-only")) return "icon-only";
  if (style.startsWith("icon-cta-pill")) return "icon-cta-pill";
  if (style.startsWith("badge-bubble")) return "badge-bubble";
  return "minimal-dot";
};

// Helper to extract variant from combined style
const getVariantFromStyle = (style: HotspotStyle): HotspotVariant => {
  const parts = style.split("-");
  const variant = parts[parts.length - 1];
  return variant as HotspotVariant;
};

const LayoutBehaviorPanel = ({
  hotspot,
  videoDuration = 60,
  onUpdateHotspot,
  onClose,
}: LayoutBehaviorPanelProps) => {
  // Migrate old style if needed
  const migratedStyle = migrateOldStyle(hotspot.style);
  
  const [selectedType, setSelectedType] = useState<HotspotType>(getTypeFromStyle(migratedStyle));
  const [selectedVariant, setSelectedVariant] = useState<HotspotVariant>(getVariantFromStyle(migratedStyle));
  const [ctaLabel, setCtaLabel] = useState(hotspot.ctaLabel);
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot.clickBehavior);
  const [startTime, setStartTime] = useState(hotspot.timeStart.toFixed(1));
  const [duration, setDuration] = useState((hotspot.timeEnd - hotspot.timeStart).toFixed(1));

  const { width, height, resizeHandleProps } = usePanelResize({
    minWidth: 300,
    maxWidth: 520,
    minHeight: 300,
    maxHeight: 650,
    defaultWidth: 360,
    defaultHeight: 500,
  });

  // Validation errors
  const [errors, setErrors] = useState<{ start?: string; duration?: string }>({});

  // Build full style string from type + variant
  const getFullStyle = (type: HotspotType, variant: HotspotVariant): HotspotStyle => {
    return `${type}-${variant}` as HotspotStyle;
  };

  const currentStyle = getFullStyle(selectedType, selectedVariant);

  const handleTypeChange = (type: HotspotType) => {
    setSelectedType(type);
    // Auto-select "small" variant when switching families
    setSelectedVariant("small");
  };

  const validateInputs = () => {
    const start = parseFloat(startTime);
    const dur = parseFloat(duration);
    const newErrors: { start?: string; duration?: string } = {};

    if (isNaN(start) || start < 0) {
      newErrors.start = "Start must be ≥ 0";
    }
    if (isNaN(dur) || dur <= 0) {
      newErrors.duration = "Duration must be > 0";
    }
    if (!isNaN(start) && !isNaN(dur) && start + dur > videoDuration) {
      newErrors.duration = "Exceeds video length";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    const start = parseFloat(startTime);
    const dur = parseFloat(duration);

    onUpdateHotspot({
      ...hotspot,
      style: currentStyle,
      ctaLabel,
      clickBehavior,
      timeStart: start,
      timeEnd: start + dur,
    });
    onClose();
  };

  // Reduced to 2 hotspot families
  const styleFamilies = [
    {
      id: "badge-bubble" as HotspotType,
      label: "Badge bubble",
      description: "Broader bubble with number and CTA, good for prominent calls.",
    },
    {
      id: "minimal-dot" as HotspotType,
      label: "Fine Line",
      description: "Ultra-clean, subtle hotspots for premium / luxury brands.",
    }
  ];

  // Render larger preview for family cards
  const renderFamilyPreview = (family: HotspotType) => {
    if (family === "badge-bubble") {
      return (
        <div className="bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <span className="text-white text-sm font-bold">3</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white text-sm font-medium">Shop</span>
        </div>
      );
    }
    // minimal-dot (Fine Line)
    return (
      <div className="flex items-center gap-2 text-[#FF6A00]/80 text-base">
        <span className="font-medium">3</span>
        <span className="opacity-50">•</span>
        <span>Shop</span>
      </div>
    );
  };

  // Get friendly family name for variant label
  const getFamilyDisplayName = (type: HotspotType): string => {
    const family = styleFamilies.find(f => f.id === type);
    return family?.label || type;
  };

  // Unified variants with dynamic previews
  const getVariantPreview = (family: HotspotType, variant: HotspotVariant) => {
    const baseScale = variant === "small" ? 0.9 : variant === "large" ? 1.15 : 1;
    const borderWeight = variant === "light" ? "border" : variant === "strong" ? "border-2" : "border-2";
    const shadowIntensity = variant === "light" ? "shadow-sm" : variant === "strong" ? "shadow-lg" : "shadow-md";

    if (family === "icon-only") {
      return (
        <div className="flex items-center justify-center" style={{ transform: `scale(${baseScale})` }}>
          <div className={`w-8 h-8 rounded-full bg-[#FF6A00] ${borderWeight} border-white ${shadowIntensity} flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">3</span>
          </div>
        </div>
      );
    }

    if (family === "icon-cta-pill") {
      return (
        <div className="flex items-center gap-1.5" style={{ transform: `scale(${baseScale})` }}>
          <div className={`w-6 h-6 rounded-full bg-[#FF6A00] ${borderWeight} border-white ${shadowIntensity} flex items-center justify-center`}>
            <span className="text-white text-[10px] font-bold">3</span>
          </div>
          <div className={`bg-[#FF6A00] ${borderWeight} border-white rounded-full px-2 py-0.5 ${shadowIntensity}`}>
            <span className="text-white text-[9px] font-medium">Shop</span>
          </div>
        </div>
      );
    }

    if (family === "badge-bubble") {
      const borderColor = variant === "light" ? "border-black/40" : "border-black";
      return (
        <div className="flex items-center justify-center" style={{ transform: `scale(${baseScale})` }}>
          <div className={`bg-[#FF6A00] ${borderWeight} ${borderColor} rounded-full px-3 py-1 ${shadowIntensity} flex items-center gap-1.5`}>
            <span className="text-white text-[10px] font-bold">3</span>
            <span className="text-white/60 text-[10px]">•</span>
            <span className="text-white text-[10px] font-medium">Shop</span>
          </div>
        </div>
      );
    }

    // minimal-dot (Fine Line)
    const opacity = variant === "light" ? "opacity-60" : variant === "strong" ? "opacity-100" : "opacity-80";
    return (
      <div className={`flex items-center gap-1.5 text-[#FF6A00] ${opacity}`} style={{ transform: `scale(${baseScale})` }}>
        <span className="text-[11px] font-medium">3</span>
        <span className="text-[11px] opacity-50">•</span>
        <span className="text-[11px]">Shop</span>
      </div>
    );
  };

  const unifiedVariants: Array<{ value: HotspotVariant; label: string; description: string }> = [
    { value: "small", label: "Small", description: "Compact size (default)" },
    { value: "large", label: "Large", description: "Larger footprint for visibility" },
    { value: "light", label: "Light", description: "Thinner border, soft shadow" },
    { value: "strong", label: "Strong", description: "Higher contrast, stronger border" },
  ];

  return (
    <div
      className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E1E4E8] overflow-hidden flex flex-col"
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E1E4E8]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[#111827]">Layout & Behavior</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <p className="text-xs text-[#6B7280]">
          Step 1: Choose a hotspot family. Step 2: Pick a style.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        
        {/* 1) HOTSPOT FAMILY Section - Large horizontal cards */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Hotspot Family
          </Label>
          <div className="space-y-3">
            {styleFamilies.map((family) => {
              const isSelected = selectedType === family.id;
              return (
                <button
                  key={family.id}
                  onClick={() => handleTypeChange(family.id)}
                  className={`
                    relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                    hover:border-[#3B82F6]/50 hover:bg-blue-50/30
                    ${isSelected 
                      ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                      : 'border-[#E1E4E8] bg-white'}
                  `}
                >
                  {/* Checkmark indicator */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Preview on left */}
                  <div className="flex-shrink-0 ml-6">
                    {renderFamilyPreview(family.id)}
                  </div>
                  
                  {/* Title and description on right */}
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827] text-sm mb-1">
                      {family.label}
                    </div>
                    <div className="text-xs text-[#6B7280] leading-snug">
                      {family.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2) STYLE VARIANTS Section - Unified 2x2 Grid with dynamic label */}
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              Style Variants
            </Label>
            <div className="text-xs text-[#6B7280] mt-1">
              {getFamilyDisplayName(selectedType)} styles
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {unifiedVariants.map((variant) => (
              <button
                key={variant.value}
                onClick={() => setSelectedVariant(variant.value)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${selectedVariant === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="flex items-center justify-center h-9">
                  {getVariantPreview(selectedType, variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">
                    {variant.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3) CTA LABEL Section - Only for Badge bubble */}
        {selectedType === "badge-bubble" && (
          <div className="space-y-2">
            <Label htmlFor="cta-input" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              CTA Label
            </Label>
            <Input
              id="cta-input"
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g., Shop, Buy now, More info"
              className="h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
        )}

        {/* 4) CLICK BEHAVIOR Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Click Behavior
          </Label>
          <RadioGroup value={clickBehavior} onValueChange={(val) => setClickBehavior(val as ClickBehavior)}>
            <div className="space-y-3">
              {/* Show Product Card */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="show-card" id="show-card" className="mt-0.5" />
                <label htmlFor="show-card" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Show Product Card</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    User first sees the preview card overlay. Clicking inside the card opens the product URL.
                  </div>
                </label>
              </div>

              {/* Direct Link */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="direct-link" id="direct-link" className="mt-0.5" />
                <label htmlFor="direct-link" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Direct Link</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Clicking the hotspot goes directly to the product URL without showing the card.
                  </div>
                </label>
              </div>

              {/* No Action */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no-action" id="no-action" className="mt-0.5" />
                <label htmlFor="no-action" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">No Action</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Hotspot is visual only. Useful for storytelling.
                  </div>
                </label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* 5) TIMING Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Timing
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs text-[#6B7280]">
                Start Time (s)
              </Label>
              <Input
                id="start-time"
                type="number"
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors({ ...errors, start: undefined });
                }}
                className={`h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] ${
                  errors.start ? 'border-[#EF4444]' : ''
                }`}
              />
              {errors.start && (
                <div className="flex items-center gap-1 text-[#EF4444] text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.start}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs text-[#6B7280]">
                Duration (s)
              </Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setErrors({ ...errors, duration: undefined });
                }}
                className={`h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] ${
                  errors.duration ? 'border-[#EF4444]' : ''
                }`}
              />
              {errors.duration && (
                <div className="flex items-center gap-1 text-[#EF4444] text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.duration}</span>
                </div>
              )}
            </div>
          </div>
          {/* Read-only End Time display */}
          <div className="text-xs text-[#6B7280] pt-1">
            End Time: {(parseFloat(startTime) + parseFloat(duration)).toFixed(1)}s
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E1E4E8]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#374151]"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-[#0E76FD] hover:bg-[#0E76FD]/90 text-white"
        >
          Save
        </Button>
      </div>

      {/* Resize Handle */}
      <ResizeHandle {...resizeHandleProps} />
    </div>
  );
};

export default LayoutBehaviorPanel;