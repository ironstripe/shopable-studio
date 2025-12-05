import { Play, Pause, List, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
}: MobileBottomControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/30 pb-safe">
      {/* Row 1: Play/Pause + Timeline */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium min-w-[36px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={(value) => onSeek(value[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground font-medium min-w-[36px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Row 2: Mode Toggle + Actions */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Mode Toggle */}
        <div className="inline-flex items-center rounded-lg bg-secondary/50 p-0.5">
          <button
            onClick={() => editorMode === "preview" && onToggleMode()}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              editorMode === "edit"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Edit
          </button>
          <button
            onClick={() => editorMode === "edit" && onToggleMode()}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              editorMode === "preview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Preview
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHotspotDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary/70 text-foreground text-xs font-medium transition-colors"
          >
            <List className="w-4 h-4" />
            Hotspots
          </button>
          <button
            onClick={onOpenCTASettings}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/50 hover:bg-secondary/70 text-foreground transition-colors"
            title="Video CTA"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomControls;
