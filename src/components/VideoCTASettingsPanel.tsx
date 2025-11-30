import { useState } from "react";
import { VideoCTA, VideoCTAType, VideoCTAStyle, VideoCTATimingMode } from "@/types/video";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoCTASettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoCTA: VideoCTA;
  onUpdateCTA: (cta: VideoCTA) => void;
}

const VideoCTASettingsPanel = ({ open, onOpenChange, videoCTA, onUpdateCTA }: VideoCTASettingsPanelProps) => {
  const [enabled, setEnabled] = useState(videoCTA.enabled);
  const [type, setType] = useState<VideoCTAType>(videoCTA.type);
  const [style, setStyle] = useState<VideoCTAStyle>(videoCTA.style);
  const [label, setLabel] = useState(videoCTA.label);
  const [url, setUrl] = useState(videoCTA.url);
  const [timingMode, setTimingMode] = useState<VideoCTATimingMode>(videoCTA.timing.mode);
  const [fadeInAt, setFadeInAt] = useState(videoCTA.timing.fadeInAt?.toString() || "5");

  const handleSave = () => {
    onUpdateCTA({
      ...videoCTA,
      enabled,
      type,
      style,
      label,
      url,
      timing: {
        mode: timingMode,
        fadeInAt: timingMode === "fade-in-at" ? parseFloat(fadeInAt) : undefined,
      },
      mode: enabled ? (timingMode === "entire-video" ? "always-visible" : timingMode === "end-only" ? "show-at-end" : "always-visible") : "off",
    });
    onOpenChange(false);
  };

  const styleOptions: { family: string; styles: { id: VideoCTAStyle; label: string; preview: string }[] }[] = [
    {
      family: "eCommerce",
      styles: [
        { id: "ecommerce-solid-white", label: "Solid White", preview: "bg-white text-black border-neutral-200" },
        { id: "ecommerce-solid-dark", label: "Solid Dark", preview: "bg-[#1A1A1A] text-white" },
        { id: "ecommerce-pill-accent", label: "Pill Accent", preview: "bg-[#3B82F6] text-white" },
      ],
    },
    {
      family: "Luxury",
      styles: [
        { id: "luxury-ghost", label: "Ghost", preview: "bg-transparent border-white text-white" },
        { id: "luxury-underline", label: "Underline →", preview: "bg-transparent text-white border-b" },
        { id: "luxury-corner-badge", label: "Corner Badge", preview: "bg-white/10 text-white text-xs" },
      ],
    },
    {
      family: "Editorial",
      styles: [
        { id: "editorial-bottom-ribbon", label: "Bottom Ribbon", preview: "bg-black/80 text-white w-full" },
        { id: "editorial-floating-label", label: "Floating Label", preview: "bg-white/90 text-black text-xs" },
        { id: "editorial-top-badge", label: "Top Badge", preview: "bg-black text-white text-xs" },
      ],
    },
    {
      family: "Minimal",
      styles: [
        { id: "minimal-tiny-pill", label: "Tiny Pill", preview: "bg-white text-black text-xs px-2 py-1" },
        { id: "minimal-dot-label", label: "Dot + Label", preview: "bg-transparent text-white" },
        { id: "minimal-underline-text", label: "Underline Text", preview: "bg-transparent text-white underline" },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px] overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="text-[16px] font-semibold text-[#111827]">Video CTA Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* (A) CTA Activation */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[13px] font-medium text-[#111827]">CTA Enabled</Label>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Show a call-to-action on this video</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* (B) CTA Type */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#111827]">CTA Type</Label>
                <RadioGroup value={type} onValueChange={(v) => setType(v as VideoCTAType)}>
                  <div className="flex items-start space-x-2 p-3 rounded-lg border border-[#E0E0E0] hover:border-[#3B82F6] transition-colors">
                    <RadioGroupItem value="visible-button" id="type-button" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="type-button" className="text-[13px] font-medium text-[#111827] cursor-pointer">
                        Visible CTA Button
                      </Label>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">Display a styled button overlay</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 rounded-lg border border-[#E0E0E0] hover:border-[#3B82F6] transition-colors">
                    <RadioGroupItem value="full-video-link" id="type-full" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="type-full" className="text-[13px] font-medium text-[#111827] cursor-pointer">
                        Full-Video Link (invisible)
                      </Label>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">Clicking anywhere opens the link (hotspots take priority)</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* (C) CTA Layout Variants - Only for Visible Button */}
              {type === "visible-button" && (
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#111827]">Button Style</Label>
                  {styleOptions.map((familyGroup) => (
                    <div key={familyGroup.family} className="space-y-2">
                      <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{familyGroup.family}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {familyGroup.styles.map((styleOption) => (
                          <button
                            key={styleOption.id}
                            onClick={() => setStyle(styleOption.id)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all text-left",
                              style === styleOption.id
                                ? "border-[#3B82F6] bg-[#EFF6FF]"
                                : "border-[#E0E0E0] hover:border-[#3B82F6]/50"
                            )}
                          >
                            <div className={cn("h-8 rounded flex items-center justify-center text-[10px] font-medium mb-1", styleOption.preview)}>
                              CTA
                            </div>
                            <p className="text-[10px] text-[#6B7280] text-center">{styleOption.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* (D) CTA Text */}
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#111827]">CTA Label</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Shop Now"
                  className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
                />
              </div>

              {/* (E) CTA Link */}
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#111827]">CTA URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="www.example.com or https://..."
                  className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
                />
                <p className="text-[11px] text-[#6B7280]">Protocol (https://) will be added automatically if not provided</p>
              </div>

              {/* (F) Display Timing */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#111827]">Display Timing</Label>
                <RadioGroup value={timingMode} onValueChange={(v) => setTimingMode(v as VideoCTATimingMode)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entire-video" id="timing-entire" />
                    <Label htmlFor="timing-entire" className="text-[13px] text-[#111827] cursor-pointer">
                      Show entire video
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="end-only" id="timing-end" />
                    <Label htmlFor="timing-end" className="text-[13px] text-[#111827] cursor-pointer">
                      Show only at end (last 3 seconds)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fade-in-at" id="timing-fade" />
                    <Label htmlFor="timing-fade" className="text-[13px] text-[#111827] cursor-pointer">
                      Fade in at
                    </Label>
                    {timingMode === "fade-in-at" && (
                      <Input
                        type="number"
                        value={fadeInAt}
                        onChange={(e) => setFadeInAt(e.target.value)}
                        placeholder="5"
                        min="0"
                        step="0.5"
                        className="h-8 w-20 text-[13px] bg-white border-[#E0E0E0] text-[#111827] ml-2"
                      />
                    )}
                    {timingMode === "fade-in-at" && <span className="text-[13px] text-[#6B7280]">seconds</span>}
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-[#E0E0E0]">
            <Button onClick={handleSave} className="w-full h-10 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              Save CTA Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoCTASettingsPanel;
