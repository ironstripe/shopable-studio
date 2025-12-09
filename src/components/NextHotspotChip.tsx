import { ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/hooks/use-scene-state";

interface NextHotspotChipProps {
  nextHotspotTime: number | null;
  isComplete: boolean;
  onJump: () => void;
  visible: boolean;
}

const NextHotspotChip = ({
  nextHotspotTime,
  isComplete,
  onJump,
  visible,
}: NextHotspotChipProps) => {
  if (!visible || nextHotspotTime === null) return null;

  return (
    <div className="absolute bottom-[60px] right-3 z-[25]">
      <button
        onClick={onJump}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium",
          "shadow-lg transition-all hover:scale-105 active:scale-95",
          isComplete
            ? "bg-white/95 text-foreground border border-border/50"
            : "bg-amber-50 text-amber-800 border border-amber-200"
        )}
      >
        {isComplete ? (
          <>
            <span>Next hotspot at {formatTime(nextHotspotTime)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Next hotspot needs a product</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
};

export default NextHotspotChip;
