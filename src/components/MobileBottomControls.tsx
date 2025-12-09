import { useState, useEffect } from "react";
import { Play, Pause, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/i18n";

type EditorTab = "edit" | "preview" | "hotspots";

interface MobileBottomControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  editorMode: "edit" | "preview";
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onToggleMode: () => void;
  onOpenHotspotDrawer: () => void;
  onOpenCTASettings: () => void;
  hotspotCount?: number;
  isAddingHotspot?: boolean;
  onToggleAddMode?: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MobileBottomControls = ({
  isPlaying,
  currentTime,
  duration,
  editorMode,
  onPlayPause,
  onSeek,
  onToggleMode,
  onOpenHotspotDrawer,
  onOpenCTASettings,
  hotspotCount = 0,
  isAddingHotspot = false,
  onToggleAddMode,
}: MobileBottomControlsProps) => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<EditorTab>(editorMode === "preview" ? "preview" : "edit");

  // Sync tab with editorMode
  useEffect(() => {
    if (editorMode === "preview" && activeTab === "edit") {
      setActiveTab("preview");
    } else if (editorMode === "edit" && activeTab === "preview") {
      setActiveTab("edit");
    }
  }, [editorMode]);

  const handleTabChange = (tab: EditorTab) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    if (tab === "hotspots") {
      onOpenHotspotDrawer();
      // Keep the visual on hotspots but don't change actual mode
      return;
    }
    
    // Switch between edit and preview
    if ((tab === "edit" && editorMode === "preview") || (tab === "preview" && editorMode === "edit")) {
      onToggleMode();
      toast({
        title: tab === "edit" ? t("editor.mode.edit") : t("editor.mode.preview"),
        description: tab === "edit" ? t("editor.mode.editHint") : t("editor.mode.previewHint"),
        duration: 1500,
      });
    }
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "edit", label: t("editor.tabs.edit") },
    { id: "preview", label: t("editor.tabs.preview") },
    { id: "hotspots", label: `${t("editor.tabs.hotspots")}${hotspotCount > 0 ? ` (${hotspotCount})` : ""}` },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe-plus">
      {/* Row 1: Play/Pause + Timeline */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2.5">
          <span className="text-[13px] text-neutral-500 font-mono min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => onSeek(value[0])}
              className="flex-1 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[data-orientation=horizontal]]:h-1.5"
            />
          </div>
          <span className="text-[13px] text-neutral-500 font-mono min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Row 2: Three-Tab Segmented Control + Add Hotspot + CTA Button */}
      <div className="flex items-center justify-between px-4 pb-2 gap-2">
        {/* Segmented Control */}
        <div className="flex-1 relative">
          <div className="inline-flex items-center w-full rounded-full bg-neutral-100 p-1 relative">
            {/* Sliding indicator */}
            <div 
              className="absolute h-[calc(100%-8px)] rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out"
              style={{
                width: `calc(${100 / tabs.length}% - 4px)`,
                transform: `translateX(calc(${tabs.findIndex(t => t.id === activeTab) * 100}% + ${tabs.findIndex(t => t.id === activeTab) * 4}px))`,
                left: 4,
                top: 4,
              }}
            />
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 relative z-10",
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Hotspot Button - only show in Edit mode */}
        {editorMode === "edit" && (
          <button
            onClick={onToggleAddMode}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
              isAddingHotspot
                ? "bg-primary text-primary-foreground"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            )}
            title={isAddingHotspot ? "Cancel adding hotspot" : "Add hotspot"}
          >
            <Plus className={cn("w-5 h-5 transition-transform", isAddingHotspot && "rotate-45")} />
          </button>
        )}

        {/* CTA Button */}
        <button
          onClick={onOpenCTASettings}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
          title="Video CTA"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileBottomControls;
