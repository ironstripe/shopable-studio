import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

interface MobileBottomControlsProps {
  onOpenHotspotDrawer: () => void;
  onOpenCTASettings: () => void;
  hotspotCount?: number;
}

/**
 * Simplified mobile bottom controls.
 * Only contains: Hotspots (n) button + CTA button.
 * Play/pause moved to in-video overlay. Timeline removed.
 */
const MobileBottomControls = ({
  onOpenHotspotDrawer,
  onOpenCTASettings,
  hotspotCount = 0,
}: MobileBottomControlsProps) => {
  const { t } = useLocale();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe-plus">
      <div className="flex items-center justify-center gap-4 px-4 py-3">
        {/* Hotspots Button */}
        <button
          onClick={onOpenHotspotDrawer}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
            "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
          )}
        >
          <span>{t("editor.tabs.hotspots")}</span>
          {hotspotCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {hotspotCount}
            </span>
          )}
        </button>

        {/* CTA Button */}
        <button
          onClick={onOpenCTASettings}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
            "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
          )}
        >
          <Link2 className="w-4 h-4" />
          <span>CTA</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomControls;
