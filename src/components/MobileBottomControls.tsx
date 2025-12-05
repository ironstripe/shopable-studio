import { useState, useEffect } from "react";
import { Play, Pause, List, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

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
}: MobileBottomControlsProps) => {
  const { toast } = useToast();
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
        title: tab === "edit" ? "Edit mode enabled" : "Preview mode",
        description: tab === "edit" ? "Tap on the video to add hotspots" : "See how viewers will experience your video",
        duration: 1500,
      });
    }
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" },
    { id: "hotspots", label: `Hotspots${hotspotCount > 0 ? ` (${hotspotCount})` : ""}` },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/30 pb-safe">
      {/* Row 1: Play/Pause + Timeline */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onPlayPause}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2.5">
          <span className="text-[13px] text-muted-foreground font-mono min-w-[40px]">
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
          <span className="text-[13px] text-muted-foreground font-mono min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Row 2: Three-Tab Segmented Control + CTA Button */}
      <div className="flex items-center justify-between px-4 pb-3 gap-3">
        {/* Segmented Control */}
        <div className="flex-1 relative">
          <div className="inline-flex items-center w-full rounded-full bg-secondary/60 p-1 relative">
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
                  "flex-1 px-3 py-2 rounded-full text-xs font-medium transition-colors duration-200 relative z-10",
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onOpenCTASettings}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary/80 text-foreground transition-colors"
          title="Video CTA"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileBottomControls;
