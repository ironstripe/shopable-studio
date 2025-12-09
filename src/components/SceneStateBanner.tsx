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
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              No hotspots here — next at{" "}
              <span className="font-medium text-foreground">
                {sceneState.nextHotspotTime !== null ? formatTime(sceneState.nextHotspotTime) : "—"}
              </span>
            </p>
            <Button
              size="sm"
              variant="default"
              onClick={onJumpToNext}
              className="h-7 px-3 text-xs font-medium rounded-full gap-1"
            >
              Jump to next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      case "needs-configuration":
        // STATE 2: Some hotspots in this scene need configuration
        return (
          <div className="flex items-center gap-2 w-full">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-amber-600">
                {sceneState.incompleteHotspots.length}
              </span>{" "}
              hotspot{sceneState.incompleteHotspots.length !== 1 ? "s" : ""} need
              {sceneState.incompleteHotspots.length === 1 ? "s" : ""} a product
            </p>
          </div>
        );

      case "all-complete-here":
        // STATE 3: All hotspots here are complete, but more exist later
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                All hotspots here complete — next at{" "}
                <span className="font-medium text-foreground">
                  {sceneState.nextHotspotTime !== null ? formatTime(sceneState.nextHotspotTime) : "—"}
                </span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onJumpToNext}
              className="h-7 px-3 text-xs font-medium rounded-full gap-1 border-border/50"
            >
              Continue
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      case "all-done":
        // STATE 4: All hotspots in the entire video are complete
        return (
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-600">
              All {sceneState.totalHotspots} hotspot{sceneState.totalHotspots !== 1 ? "s" : ""} complete 🎉
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
        "w-full px-3 py-2 rounded-lg border transition-all duration-200",
        sceneState.state === "all-done"
          ? "bg-emerald-50 border-emerald-200"
          : sceneState.state === "needs-configuration"
          ? "bg-amber-50/50 border-amber-200/50"
          : "bg-muted/30 border-border/30"
      )}
    >
      {content}
    </div>
  );
};

export default SceneStateBanner;
