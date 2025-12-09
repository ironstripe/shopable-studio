import { Hotspot } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { isHotspotComplete } from "@/hooks/use-scene-state";

interface DoneEditingBarProps {
  hotspots: Hotspot[];
  currentTime: number;
  onDone: () => void;
  onJumpToNext: () => void;
}

const DoneEditingBar = ({ hotspots, currentTime, onDone, onJumpToNext }: DoneEditingBarProps) => {
  // Calculate next incomplete hotspot
  const incompleteHotspots = hotspots.filter(h => !isHotspotComplete(h));
  const futureIncomplete = incompleteHotspots
    .filter(h => h.timeStart > currentTime)
    .sort((a, b) => a.timeStart - b.timeStart);
  
  const nextIncomplete = futureIncomplete[0];
  
  // Check if all hotspots are complete
  const allComplete = incompleteHotspots.length === 0;
  
  // Get next hotspot (complete or not) for "continue" flow
  const nextHotspot = hotspots
    .filter(h => h.timeStart > currentTime)
    .sort((a, b) => a.timeStart - b.timeStart)[0];

  // Determine what to show
  const showNextButton = !allComplete || !!nextHotspot;
  const nextButtonLabel = nextIncomplete 
    ? "Next Hotspot" 
    : nextHotspot 
    ? "Continue" 
    : null;

  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1.5 border-t border-border/20 bg-white/80">
      <Button
        size="sm"
        variant="ghost"
        onClick={onDone}
        className="h-8 px-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5"
      >
        <Check className="w-3.5 h-3.5" />
        Done Editing
      </Button>
      
      {showNextButton && nextButtonLabel && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onJumpToNext}
          className="h-8 px-3 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
        >
          {nextButtonLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

export default DoneEditingBar;
