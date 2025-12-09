import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotspotNavigationPillProps {
  currentIndex: number; // 1-based index
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const HotspotNavigationPill = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: HotspotNavigationPillProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[25]">
      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1 py-1 shadow-lg">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
            canGoPrevious 
              ? "text-white hover:bg-white/20 active:bg-white/30" 
              : "text-white/30 cursor-not-allowed"
          )}
          aria-label="Previous hotspot"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="text-white text-sm font-medium px-2 min-w-[80px] text-center">
          Hotspot {currentIndex} / {totalCount}
        </span>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
            canGoNext 
              ? "text-white hover:bg-white/20 active:bg-white/30" 
              : "text-white/30 cursor-not-allowed"
          )}
          aria-label="Next hotspot"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HotspotNavigationPill;
