import { useState, useEffect } from "react";
import { X, Check, Info, ExternalLink, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoCTA } from "@/types/video";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type CTAMode = "none" | "button" | "invisible";
type CTAPosition = "bottom-left" | "bottom-center" | "bottom-right";
type CTAButtonStyle = "light" | "filled" | "outline";

interface VideoCTASheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoCTA: VideoCTA | undefined;
  onUpdateCTA: (cta: VideoCTA) => void;
}

// Parse existing CTA to our simplified model
const parseCTA = (cta: VideoCTA | undefined): {
  mode: CTAMode;
  label: string;
  url: string;
  position: CTAPosition;
  buttonStyle: CTAButtonStyle;
} => {
  if (!cta || !cta.enabled) {
    return {
      mode: "none",
      label: "Shop Now",
      url: "",
      position: "bottom-center",
      buttonStyle: "filled",
    };
  }

  // Determine mode
  let mode: CTAMode = "button";
  if (cta.type === "full-video-link") {
    mode = "invisible";
  }

  // Determine position from coordinates
  let position: CTAPosition = "bottom-center";
  if (cta.position) {
    const { x } = cta.position;
    if (x < 0.33) position = "bottom-left";
    else if (x > 0.66) position = "bottom-right";
    else position = "bottom-center";
  }

  // Determine button style
  let buttonStyle: CTAButtonStyle = "filled";
  if (cta.style?.includes("ghost") || cta.style?.includes("outline")) {
    buttonStyle = "outline";
  } else if (cta.style?.includes("light") || cta.style?.includes("minimal")) {
    buttonStyle = "light";
  }

  return {
    mode,
    label: cta.label || "Shop Now",
    url: cta.url || "",
    position,
    buttonStyle,
  };
};

// URL validation
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false;
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

// Extract domain for preview
const extractDomain = (url: string): string | null => {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    return new URL(fullUrl).hostname.replace("www.", "");
  } catch {
    return null;
  }
};

const VideoCTASheet = ({
  open,
  onOpenChange,
  videoCTA,
  onUpdateCTA,
}: VideoCTASheetProps) => {
  const parsed = parseCTA(videoCTA);

  const [mode, setMode] = useState<CTAMode>(parsed.mode);
  const [label, setLabel] = useState(parsed.label);
  const [url, setUrl] = useState(parsed.url);
  const [position, setPosition] = useState<CTAPosition>(parsed.position);
  const [buttonStyle, setButtonStyle] = useState<CTAButtonStyle>(parsed.buttonStyle);
  const [urlTouched, setUrlTouched] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      const p = parseCTA(videoCTA);
      setMode(p.mode);
      setLabel(p.label);
      setUrl(p.url);
      setPosition(p.position);
      setButtonStyle(p.buttonStyle);
      setUrlTouched(false);
    }
  }, [open, videoCTA]);

  const isFormValid = (): boolean => {
    if (mode === "none") return true;
    return isValidUrl(url);
  };

  const showUrlError = urlTouched && mode !== "none" && !isValidUrl(url) && url.length > 0;

  const handleSave = () => {
    const positionMap: Record<CTAPosition, { x: number; y: number }> = {
      "bottom-left": { x: 0.15, y: 0.88 },
      "bottom-center": { x: 0.5, y: 0.88 },
      "bottom-right": { x: 0.85, y: 0.88 },
    };

    const styleMap: Record<CTAButtonStyle, string> = {
      "light": "minimal-tiny-pill",
      "filled": "ecommerce-pill-accent",
      "outline": "luxury-ghost",
    };

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    onUpdateCTA({
      label: label || "Shop Now",
      url: mode === "none" ? "" : normalizedUrl,
      enabled: mode !== "none",
      type: mode === "invisible" ? "full-video-link" : "visible-button",
      style: styleMap[buttonStyle] as VideoCTA["style"],
      timing: { mode: "entire-video" },
      mode: mode === "none" ? "off" : "always-visible",
      position: positionMap[position],
    });

    onOpenChange(false);
  };

  const domain = extractDomain(url);

  const modes: { value: CTAMode; label: string }[] = [
    { value: "none", label: "No CTA" },
    { value: "button", label: "Visible Button" },
    { value: "invisible", label: "Invisible Layer" },
  ];

  const labelPresets = ["Shop Now", "Buy", "Learn More", "Get Deal", "View Details"];

  const positions: { value: CTAPosition; icon: React.ReactNode }[] = [
    { 
      value: "bottom-left", 
      icon: (
        <div className="w-full h-full relative">
          <div className="absolute bottom-1.5 left-1.5 w-5 h-2 rounded-sm bg-primary" />
        </div>
      )
    },
    { 
      value: "bottom-center", 
      icon: (
        <div className="w-full h-full relative">
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2 rounded-sm bg-primary" />
        </div>
      )
    },
    { 
      value: "bottom-right", 
      icon: (
        <div className="w-full h-full relative">
          <div className="absolute bottom-1.5 right-1.5 w-5 h-2 rounded-sm bg-primary" />
        </div>
      )
    },
  ];

  const buttonStyles: { value: CTAButtonStyle; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "filled", label: "Filled" },
    { value: "outline", label: "Outline" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-[20px] p-0 flex flex-col bg-white"
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
            Video CTA
          </h2>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isFormValid()}
            className={cn(
              "h-9 px-5 rounded-full text-[14px] font-medium transition-all",
              isFormValid()
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
            )}
          >
            Save
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-5 py-6 space-y-6">
            {/* Section: CTA Mode */}
            <section>
              <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                CTA Mode
              </h3>
              <div className="flex p-1 rounded-2xl bg-[#F5F5F7] border border-[#E5E5E5]">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "flex-1 py-3 text-[13px] font-medium rounded-xl transition-all duration-150",
                      mode === m.value
                        ? "bg-white text-primary font-semibold shadow-sm"
                        : "text-[#666666] hover:text-[#333333]"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Mode: No CTA - Explain Panel */}
            {mode === "none" && (
              <section className="animate-fade-in-up">
                <div className="rounded-2xl bg-[#F8F8FA] border border-[#EBEBEB] p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E8EC] flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-[#666666]" />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[14px] font-medium text-[#222222]">
                      No global CTA will be shown.
                    </p>
                    <p className="text-[13px] text-[#888888]">
                      Viewers can only interact with individual hotspots.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Mode: Visible Button - Configuration */}
            {mode === "button" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Button Label */}
                <section>
                  <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                    Button Label
                  </h3>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Shop Now, Learn More"
                    className="h-14 text-[16px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl mb-3"
                  />
                  {/* Pill presets */}
                  <div className="flex flex-wrap gap-2">
                    {labelPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setLabel(preset)}
                        className={cn(
                          "px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-120",
                          label === preset
                            ? "bg-primary text-white"
                            : "bg-[#F5F5F7] text-[#555555] hover:bg-[#EBEBEB]"
                        )}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Position on Video */}
                <section>
                  <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                    Position on Video
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={cn(
                          "relative h-16 rounded-xl border-2 transition-all duration-150 bg-[#FAFAFA]",
                          position === pos.value
                            ? "border-primary bg-primary/5"
                            : "border-[#E5E5E5] hover:border-primary/40"
                        )}
                      >
                        {pos.icon}
                        {position === pos.value && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[11px] text-[#999999]">Left</span>
                    <span className="text-[11px] text-[#999999]">Center</span>
                    <span className="text-[11px] text-[#999999]">Right</span>
                  </div>
                </section>

                {/* Button Style */}
                <section>
                  <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                    Button Style
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setButtonStyle(style.value)}
                        className={cn(
                          "relative h-20 rounded-xl border-2 transition-all duration-150 flex flex-col items-center justify-center gap-2",
                          buttonStyle === style.value
                            ? "border-primary bg-primary/5"
                            : "border-[#E5E5E5] bg-[#FAFAFA] hover:border-primary/40"
                        )}
                      >
                        {/* Mini button preview */}
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-medium transition-all",
                            style.value === "light" &&
                              "bg-white/90 text-[#333333] border border-[#E0E0E0]",
                            style.value === "filled" &&
                              "bg-primary text-white",
                            style.value === "outline" &&
                              "bg-transparent border-2 border-[#333333] text-[#333333]"
                          )}
                        >
                          CTA
                        </div>
                        <span className="text-[11px] text-[#666666]">
                          {style.label}
                        </span>
                        {buttonStyle === style.value && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* CTA Target URL */}
                <section>
                  <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                    CTA Target URL
                  </h3>
                  <div className="relative">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={() => setUrlTouched(true)}
                      placeholder="https://your-link.com"
                      className={cn(
                        "h-14 text-[16px] bg-white text-[#111111] placeholder:text-[#AAAAAA] rounded-xl pr-12",
                        showUrlError 
                          ? "border-red-400 focus:border-red-500" 
                          : "border-[#E0E0E0]"
                      )}
                    />
                    <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  </div>
                  {showUrlError && (
                    <p className="text-[12px] text-red-500 mt-2">
                      Please enter a valid URL
                    </p>
                  )}
                  {domain && !showUrlError && (
                    <p className="text-[12px] text-primary flex items-center gap-1.5 mt-2">
                      <Check className="w-3.5 h-3.5" />
                      {domain}
                    </p>
                  )}
                </section>
              </div>
            )}

            {/* Mode: Invisible Layer */}
            {mode === "invisible" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Explain Panel */}
                <section>
                  <div className="rounded-2xl bg-[#F0F7FF] border border-[#D0E4FF] p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MousePointerClick className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[14px] font-medium text-[#222222]">
                        The entire video becomes tappable.
                      </p>
                      <p className="text-[13px] text-[#666666]">
                        Ideal for TikTok / Reels where the CTA should not be visible. Hotspots will take priority.
                      </p>
                    </div>
                  </div>
                </section>

                {/* CTA Target URL */}
                <section>
                  <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
                    Target URL
                  </h3>
                  <div className="relative">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={() => setUrlTouched(true)}
                      placeholder="https://your-link.com"
                      className={cn(
                        "h-14 text-[16px] bg-white text-[#111111] placeholder:text-[#AAAAAA] rounded-xl pr-12",
                        showUrlError 
                          ? "border-red-400 focus:border-red-500" 
                          : "border-[#E0E0E0]"
                      )}
                    />
                    <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  </div>
                  {showUrlError && (
                    <p className="text-[12px] text-red-500 mt-2">
                      Please enter a valid URL
                    </p>
                  )}
                  {domain && !showUrlError && (
                    <p className="text-[12px] text-primary flex items-center gap-1.5 mt-2">
                      <Check className="w-3.5 h-3.5" />
                      {domain}
                    </p>
                  )}
                </section>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 px-5 py-4 bg-white border-t border-[#EBEBEB] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe-plus">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-[15px] font-medium border-[#E0E0E0] text-[#555555] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid()}
              className={cn(
                "flex-1 h-12 rounded-xl text-[15px] font-medium transition-all",
                isFormValid()
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
              )}
            >
              Save CTA
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoCTASheet;
