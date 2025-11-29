import { useState } from "react";
import { Hotspot, HotspotStyle, ClickBehavior } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

interface LayoutBehaviorPanelProps {
  hotspot: Hotspot;
  videoDuration?: number;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onClose: () => void;
}

const LayoutBehaviorPanel = ({
  hotspot,
  videoDuration = 60,
  onUpdateHotspot,
  onClose,
}: LayoutBehaviorPanelProps) => {
  const [layout, setLayout] = useState<HotspotStyle>(hotspot.style);
  const [ctaLabel, setCtaLabel] = useState(hotspot.ctaLabel);
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot.clickBehavior);
  const [startTime, setStartTime] = useState(hotspot.timeStart.toFixed(1));
  const [duration, setDuration] = useState((hotspot.timeEnd - hotspot.timeStart).toFixed(1));

  const needsCTA = layout !== "icon-only" && layout !== "minimal-dot";
  const endTime = parseFloat(startTime) + parseFloat(duration);

  const handleSave = () => {
    const start = parseFloat(startTime);
    const dur = parseFloat(duration);
    const end = start + dur;

    // Validation
    if (start < 0 || end > videoDuration || start >= end || dur <= 0) {
      return; // Could add toast error here
    }

    onUpdateHotspot({
      ...hotspot,
      style: layout,
      ctaLabel,
      clickBehavior,
      timeStart: start,
      timeEnd: end,
    });
    onClose();
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
        
        {/* A) LAYOUT Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Layout
          </Label>
          <RadioGroup value={layout} onValueChange={(val) => setLayout(val as HotspotStyle)}>
            <div className="space-y-2">
              {/* Icon only */}
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="icon-only" id="icon-only" />
                <label htmlFor="icon-only" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#FF6A00] border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="text-sm text-[#374151]">Icon only</span>
                </label>
              </div>

              {/* Icon + CTA pill */}
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="icon-cta-pill" id="icon-cta-pill" />
                <label htmlFor="icon-cta-pill" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-[#FF6A00] border border-white shadow-sm flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">3</span>
                    </div>
                    <div className="bg-[#FF6A00] border border-white rounded-full px-2.5 py-0.5 shadow-sm">
                      <span className="text-white text-[10px] font-medium">Shop</span>
                    </div>
                  </div>
                  <span className="text-sm text-[#374151]">Icon + CTA pill</span>
                </label>
              </div>

              {/* Badge bubble small */}
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="badge-small" id="badge-small" />
                <label htmlFor="badge-small" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="bg-[#FF6A00] border border-black rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5">
                    <span className="text-white text-[10px] font-bold">3</span>
                    <span className="text-white/60 text-[10px]">•</span>
                    <span className="text-white text-[10px] font-medium">Shop</span>
                  </div>
                  <span className="text-sm text-[#374151]">Badge bubble small</span>
                </label>
              </div>

              {/* Badge bubble large */}
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="badge-large" id="badge-large" />
                <label htmlFor="badge-large" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="bg-[#FF6A00] border-2 border-black rounded-full px-4 py-1.5 shadow-md flex items-center gap-2">
                    <span className="text-white text-xs font-bold">3</span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-white text-xs font-semibold">Shop</span>
                  </div>
                  <span className="text-sm text-[#374151]">Badge bubble large</span>
                </label>
              </div>

              {/* Minimal dot */}
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors">
                <RadioGroupItem value="minimal-dot" id="minimal-dot" />
                <label htmlFor="minimal-dot" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-[#FF6A00] border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">3</span>
                  </div>
                  <span className="text-sm text-[#374151]">Minimal dot</span>
                </label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* B) CTA LABEL Section - Conditional */}
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
              className="h-9 text-sm bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
        )}

        {/* C) CLICK BEHAVIOR Section */}
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

        {/* D) TIMING Section */}
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
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-sm bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
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
                onChange={(e) => setDuration(e.target.value)}
                className="h-9 text-sm bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
          <div className="pt-1.5 border-t border-[#E1E4E8]">
            <p className="text-xs text-[#6B7280]">
              End Time: <span className="font-medium text-[#374151]">{endTime.toFixed(1)}s</span>
            </p>
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
