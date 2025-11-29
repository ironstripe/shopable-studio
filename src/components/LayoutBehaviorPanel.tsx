import { useState } from "react";
import { Hotspot, HotspotStyle, HotspotType, ClickBehavior } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, AlertCircle } from "lucide-react";

interface LayoutBehaviorPanelProps {
  hotspot: Hotspot;
  videoDuration?: number;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onClose: () => void;
}

// Helper to extract type from combined style
const getTypeFromStyle = (style: HotspotStyle): HotspotType => {
  if (style.startsWith("icon-only")) return "icon-only";
  if (style.startsWith("icon-cta-pill")) return "icon-cta-pill";
  if (style.startsWith("badge-bubble")) return "badge-bubble";
  return "minimal-dot";
};

// Helper to extract variant from combined style
const getVariantFromStyle = (style: HotspotStyle): string => {
  const parts = style.split("-");
  if (style.startsWith("icon-only")) return parts[2] || "filled";
  if (style.startsWith("icon-cta-pill")) return parts[3] || "standard";
  if (style.startsWith("badge-bubble")) return parts.slice(2).join("-") || "small";
  if (style.startsWith("minimal-dot")) return parts[2] || "default";
  return "filled";
};

const LayoutBehaviorPanel = ({
  hotspot,
  videoDuration = 60,
  onUpdateHotspot,
  onClose,
}: LayoutBehaviorPanelProps) => {
  const [selectedType, setSelectedType] = useState<HotspotType>(getTypeFromStyle(hotspot.style));
  const [selectedVariant, setSelectedVariant] = useState<string>(getVariantFromStyle(hotspot.style));
  const [ctaLabel, setCtaLabel] = useState(hotspot.ctaLabel);
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot.clickBehavior);
  const [startTime, setStartTime] = useState(hotspot.timeStart.toFixed(1));
  const [duration, setDuration] = useState((hotspot.timeEnd - hotspot.timeStart).toFixed(1));

  // Validation errors
  const [errors, setErrors] = useState<{ start?: string; duration?: string }>({});

  // Build full style string from type + variant
  const getFullStyle = (type: HotspotType, variant: string): HotspotStyle => {
    return `${type}-${variant}` as HotspotStyle;
  };

  const currentStyle = getFullStyle(selectedType, selectedVariant);
  const needsCTA = selectedType === "icon-cta-pill" || selectedType === "badge-bubble";

  const handleTypeChange = (type: HotspotType) => {
    setSelectedType(type);
    // Set default variant for new type
    if (type === "icon-only") setSelectedVariant("filled");
    if (type === "icon-cta-pill") setSelectedVariant("standard");
    if (type === "badge-bubble") setSelectedVariant("small");
    if (type === "minimal-dot") setSelectedVariant("default");
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

  // Variants for each type
  const variants = {
    "icon-only": [
      { value: "filled", label: "Filled", preview: (
        <div className="w-9 h-9 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">3</span>
        </div>
      )},
      { value: "outline", label: "Outline", preview: (
        <div className="w-9 h-9 rounded-full bg-white border-2 border-[#FF6A00] shadow-md flex items-center justify-center">
          <span className="text-[#FF6A00] text-xs font-bold">3</span>
        </div>
      )},
      { value: "glow", label: "Glow", preview: (
        <div className="w-9 h-9 rounded-full bg-[#FF6A00] border-2 border-white shadow-[0_0_16px_rgba(255,106,0,0.6)] flex items-center justify-center">
          <span className="text-white text-xs font-bold">3</span>
        </div>
      )},
    ],
    "icon-cta-pill": [
      { value: "standard", label: "Standard", preview: (
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">3</span>
          </div>
          <div className="bg-[#FF6A00] border-2 border-white rounded-full px-2.5 py-0.5 shadow-md">
            <span className="text-white text-[10px] font-medium">Shop</span>
          </div>
        </div>
      )},
      { value: "compact", label: "Compact", preview: (
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-[#FF6A00] border border-white shadow-sm flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">3</span>
          </div>
          <div className="bg-[#FF6A00] border border-white rounded-full px-2 py-0.5 shadow-sm">
            <span className="text-white text-[9px] font-medium">Shop</span>
          </div>
        </div>
      )},
    ],
    "badge-bubble": [
      { value: "small", label: "Small", preview: (
        <div className="bg-[#FF6A00] border border-black rounded-full px-3 py-1 shadow-md flex items-center gap-1.5">
          <span className="text-white text-[10px] font-bold">3</span>
          <span className="text-white/60 text-[10px]">•</span>
          <span className="text-white text-[10px] font-medium">Shop</span>
        </div>
      )},
      { value: "large", label: "Large", preview: (
        <div className="bg-[#FF6A00] border-2 border-black rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2">
          <span className="text-white text-xs font-bold">3</span>
          <span className="text-white/60 text-xs">•</span>
          <span className="text-white text-xs font-semibold">Shop</span>
        </div>
      )},
      { value: "light-shadow", label: "Light", preview: (
        <div className="bg-[#FF6A00] border border-black rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5">
          <span className="text-white text-[10px] font-bold">3</span>
          <span className="text-white/60 text-[10px]">•</span>
          <span className="text-white text-[10px] font-medium">Shop</span>
        </div>
      )},
      { value: "strong-shadow", label: "Strong", preview: (
        <div className="bg-[#FF6A00] border-2 border-black rounded-full px-3 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center gap-1.5">
          <span className="text-white text-[10px] font-bold">3</span>
          <span className="text-white/60 text-[10px]">•</span>
          <span className="text-white text-[10px] font-medium">Shop</span>
        </div>
      )},
    ],
    "minimal-dot": [
      { value: "default", label: "Default", preview: (
        <div className="w-7 h-7 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-white text-[9px] font-bold">3</span>
        </div>
      )},
      { value: "pulse", label: "Pulse", preview: (
        <div className="w-7 h-7 rounded-full bg-[#FF6A00] border-2 border-white shadow-md flex items-center justify-center animate-pulse">
          <span className="text-white text-[9px] font-bold">3</span>
        </div>
      )},
    ],
  };

  return (
    <div
      className="w-[360px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E1E4E8] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1E4E8]">
        <h3 className="text-sm font-semibold text-[#111827]">Layout & Behavior</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F8FA] transition-colors"
        >
          <X className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
        
        {/* A) HOTSPOT TYPE Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Hotspot Type
          </Label>
          <RadioGroup value={selectedType} onValueChange={(val) => handleTypeChange(val as HotspotType)}>
            <div className="space-y-1">
              {/* Icon only */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="icon-only" id="type-icon-only" className="mt-0.5" />
                <label htmlFor="type-icon-only" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Icon only</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Kleiner Punkt mit Zahl, minimal, unauffällig.
                  </div>
                </label>
              </div>

              {/* Icon + CTA pill */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="icon-cta-pill" id="type-icon-cta" className="mt-0.5" />
                <label htmlFor="type-icon-cta" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Icon + CTA pill</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Circle mit Zahl + Text-Button, ideal für direkte Aktionen.
                  </div>
                </label>
              </div>

              {/* Badge bubble */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="badge-bubble" id="type-badge" className="mt-0.5" />
                <label htmlFor="type-badge" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Badge bubble</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Breitere Bubble mit Zahl + CTA, gut für prominente Calls.
                  </div>
                </label>
              </div>

              {/* Minimal dot */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="minimal-dot" id="type-minimal" className="mt-0.5" />
                <label htmlFor="type-minimal" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Minimal dot</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Sehr dezenter Punkt, nur visuelle Markierung.
                  </div>
                </label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* B) VARIANTS Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Variants
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {variants[selectedType].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setSelectedVariant(variant.value)}
                className={`
                  relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                  ${selectedVariant === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="flex items-center justify-center h-10">
                  {variant.preview}
                </div>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  {variant.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* C) CTA LABEL Section - Conditional */}
        {needsCTA && (
          <div className="space-y-2">
            <Label htmlFor="cta-input" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              CTA Label
            </Label>
            <Input
              id="cta-input"
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Kaufen / Zum Shop / Mehr Infos"
              className="h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
        )}

        {/* D) CLICK BEHAVIOR Section */}
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

        {/* E) TIMING Section */}
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
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E1E4E8] bg-[#F7F8FA]">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-9 px-4 text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="h-9 px-4 text-sm font-medium bg-[#0E76FD] text-white hover:bg-[#0E76FD]/90"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default LayoutBehaviorPanel;
