import { SceneState, formatTime } from "@/hooks/use-scene-state";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SceneStateBannerProps {
  sceneState: SceneState;
  onJumpToNext: () => void;
  isEditMode: boolean;
}

const SceneStateBanner = ({ sceneState, onJumpToNext, isEditMode }: SceneStateBannerProps) => {
  // Don't show in preview mode or if no hotspots exist
  if (!isEditMode || sceneState.state === "no-hotspots") {
    return null;
  }

  const renderContent = () => {
    switch (sceneState.state) {
      case "no-hotspots-here":
        // STATE 1: No hotspots at this moment, but hotspots exist later
        return (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Next at{" "}
              <span className="font-medium text-foreground">
                {sceneState.nextHotspotTime !== null ? formatTime(sceneState.nextHotspotTime) : "—"}
              </span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={onJumpToNext}
              className="h-6 px-2 text-xs font-medium gap-0.5 hover:bg-white/20"
            >
              Jump
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        );

      case "needs-configuration":
        // STATE 2: Some hotspots in this scene need configuration
        return (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-amber-600">
                {sceneState.incompleteHotspots.length}
              </span>{" "}
              need{sceneState.incompleteHotspots.length === 1 ? "s" : ""} product
            </p>
          </div>
        );

      case "all-complete-here":
        // STATE 3: All hotspots here are complete, but more exist later
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Done here
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onJumpToNext}
              className="h-6 px-2 text-xs font-medium gap-0.5 hover:bg-white/20"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        );

      case "all-done":
        // STATE 4: All hotspots in the entire video are complete
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-emerald-600">
              All {sceneState.totalHotspots} done 🎉
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div
      className={cn(
        "px-2.5 py-1.5 rounded-lg border backdrop-blur-sm shadow-md",
        sceneState.state === "all-done"
          ? "bg-emerald-50/95 border-emerald-200"
          : sceneState.state === "needs-configuration"
          ? "bg-amber-50/95 border-amber-200/50"
          : "bg-white/95 border-border/30"
      )}
    >
      {content}
    </div>
  );
};

export default SceneStateBanner;
