import { useState, useEffect } from "react";
import { X, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoCTA } from "@/types/video";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type CTAMode = "none" | "button" | "invisible";
type CTAPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type CTAButtonStyle = "minimal-outline" | "solid-black" | "solid-blue" | "ghost";

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
      position: "bottom-right",
      buttonStyle: "solid-blue",
    };
  }

  // Determine mode
  let mode: CTAMode = "button";
  if (cta.type === "full-video-link") {
    mode = "invisible";
  }

  // Determine position from coordinates
  let position: CTAPosition = "bottom-right";
  if (cta.position) {
    const { x, y } = cta.position;
    if (x < 0.5 && y < 0.5) position = "top-left";
    else if (x >= 0.5 && y < 0.5) position = "top-right";
    else if (x < 0.5 && y >= 0.5) position = "bottom-left";
    else position = "bottom-right";
  }

  // Determine button style
  let buttonStyle: CTAButtonStyle = "solid-blue";
  if (cta.style?.includes("ghost") || cta.style?.includes("luxury-ghost")) {
    buttonStyle = "minimal-outline";
  } else if (cta.style?.includes("dark") || cta.style?.includes("solid-dark")) {
    buttonStyle = "solid-black";
  } else if (cta.style?.includes("underline") || cta.style?.includes("minimal")) {
    buttonStyle = "ghost";
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

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      const p = parseCTA(videoCTA);
      setMode(p.mode);
      setLabel(p.label);
      setUrl(p.url);
      setPosition(p.position);
      setButtonStyle(p.buttonStyle);
    }
  }, [open, videoCTA]);

  const isFormValid = (): boolean => {
    if (mode === "none") return true;
    return isValidUrl(url);
  };

  const handleSave = () => {
    const positionMap: Record<CTAPosition, { x: number; y: number }> = {
      "top-left": { x: 0.12, y: 0.12 },
      "top-right": { x: 0.88, y: 0.12 },
      "bottom-left": { x: 0.12, y: 0.88 },
      "bottom-right": { x: 0.88, y: 0.88 },
    };

    const styleMap: Record<CTAButtonStyle, string> = {
      "minimal-outline": "luxury-ghost",
      "solid-black": "ecommerce-solid-dark",
      "solid-blue": "ecommerce-pill-accent",
      "ghost": "minimal-underline-text",
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

  const positions: { value: CTAPosition; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const buttonStyles: { value: CTAButtonStyle; label: string }[] = [
    { value: "minimal-outline", label: "Outline" },
    { value: "solid-black", label: "Solid Black" },
    { value: "solid-blue", label: "Solid Blue" },
    { value: "ghost", label: "Ghost" },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        {/* Header */}
        <DrawerHeader className="border-b border-border/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <DrawerTitle className="text-base font-semibold">
              Video CTA
            </DrawerTitle>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                isFormValid()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              Save
            </button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 h-[calc(90vh-140px)]">
          <div className="px-4 py-5 space-y-6">
            {/* Section A: CTA Mode */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                CTA Mode
              </Label>
              <div className="flex rounded-lg bg-secondary/50 p-1">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "flex-1 py-2.5 px-2 rounded-md text-xs font-medium transition-all",
                      mode === m.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section B: Link & Action (Conditional) */}
            {mode === "none" && (
              <div className="rounded-xl bg-secondary/30 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-foreground">
                    No global CTA will be shown.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Viewers can only interact with individual hotspots.
                  </p>
                </div>
              </div>
            )}

            {mode === "button" && (
              <div className="space-y-5">
                {/* CTA Label */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    CTA Label
                  </Label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Shop Now"
                    className="h-12 bg-background border-border/50 text-foreground"
                  />
                </div>

                {/* Link URL */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Link URL
                  </Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-12 bg-background border-border/50 text-foreground"
                  />
                  {domain && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {domain}
                    </p>
                  )}
                </div>

                {/* Button Position */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Button Position
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={cn(
                          "relative h-16 rounded-lg border-2 transition-all",
                          position === pos.value
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-secondary/20 hover:border-border"
                        )}
                      >
                        {/* Mini preview showing button position */}
                        <div
                          className={cn(
                            "absolute w-6 h-3 rounded-sm bg-primary/60",
                            pos.value === "top-left" && "top-2 left-2",
                            pos.value === "top-right" && "top-2 right-2",
                            pos.value === "bottom-left" && "bottom-2 left-2",
                            pos.value === "bottom-right" && "bottom-2 right-2"
                          )}
                        />
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                          {pos.label}
                        </span>
                        {position === pos.value && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Button Style
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setButtonStyle(style.value)}
                        className={cn(
                          "relative h-20 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2",
                          buttonStyle === style.value
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-secondary/20 hover:border-border"
                        )}
                      >
                        {/* Mini button preview */}
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-medium",
                            style.value === "minimal-outline" &&
                              "border border-foreground/50 text-foreground/70 bg-transparent",
                            style.value === "solid-black" &&
                              "bg-foreground text-background",
                            style.value === "solid-blue" &&
                              "bg-primary text-primary-foreground",
                            style.value === "ghost" &&
                              "text-foreground/70 underline bg-transparent"
                          )}
                        >
                          CTA
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {style.label}
                        </span>
                        {buttonStyle === style.value && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === "invisible" && (
              <div className="space-y-5">
                {/* Link URL */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Link URL
                  </Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-12 bg-background border-border/50 text-foreground"
                  />
                  {domain && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {domain}
                    </p>
                  )}
                </div>

                {/* Info box */}
                <div className="rounded-xl bg-secondary/30 p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-foreground">
                      The entire video becomes clickable.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No button will be shown. Hotspots will take priority over
                      this link.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="border-t border-border/30 px-4 py-4 flex gap-3 bg-card">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={cn(
              "flex-1 h-12 rounded-xl text-sm font-medium transition-all",
              isFormValid()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            Save CTA
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default VideoCTASheet;
