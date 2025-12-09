import { useEffect, useState } from "react";
import { Check, ArrowRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/hooks/use-scene-state";
import { useLocale } from "@/lib/i18n";

interface HotspotSavedSnackbarProps {
  visible: boolean;
  incompleteCount: number;
  nextHotspotTime: number | null;
  allComplete: boolean;
  onJump: () => void;
  onDismiss: () => void;
}

const HotspotSavedSnackbar = ({
  visible,
  incompleteCount,
  nextHotspotTime,
  allComplete,
  onJump,
  onDismiss,
}: HotspotSavedSnackbarProps) => {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [visible, onDismiss]);

  if (!isVisible) return null;

  // Case C: All complete
  if (allComplete) {
    return (
      <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-[30] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 px-4 py-2.5 rounded-full shadow-lg">
          <PartyPopper className="w-4 h-4" />
          <span className="text-sm font-medium">{t("scene.allDone")} 🎉</span>
        </div>
      </div>
    );
  }

  // Case A: Incomplete hotspots remain
  if (incompleteCount > 0) {
    return (
      <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-[30] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 bg-white/95 border border-border/50 px-4 py-2.5 rounded-full shadow-lg">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-foreground">
            Hotspot saved
            <span className="text-muted-foreground mx-1">•</span>
            <span className="text-amber-700">
              {incompleteCount} {incompleteCount === 1 ? t("scene.needsProduct") : t("scene.needsProductPlural")}
            </span>
          </span>
          {nextHotspotTime !== null && (
            <button
              onClick={onJump}
              className="ml-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("scene.nextHotspot")}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Case B: Current scene complete, more hotspots later
  if (nextHotspotTime !== null) {
    return (
      <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-[30] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 bg-white/95 border border-border/50 px-4 py-2.5 rounded-full shadow-lg">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-foreground">
            Hotspot saved
            <span className="text-muted-foreground mx-1">•</span>
            Next at {formatTime(nextHotspotTime)}
          </span>
          <button
            onClick={onJump}
            className="ml-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Jump
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Fallback: Just show saved
  return (
    <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-[30] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 bg-white/95 border border-border/50 px-4 py-2.5 rounded-full shadow-lg">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm text-foreground">Hotspot saved</span>
      </div>
    </div>
  );
};

export default HotspotSavedSnackbar;
