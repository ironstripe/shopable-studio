import { cn } from "@/lib/utils";
import { EditorMode } from "@/types/video";
import { useLocale } from "@/lib/i18n";

interface MobileModeSwitcherProps {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  hotspotCount: number;
}

/**
 * Bottom mode switcher for mobile editor.
 * Three modes: Edit (with Hotspots count), Preview, Post
 * Active mode = filled button, inactive = outline buttons
 */
const MobileModeSwitcher = ({
  activeMode,
  onModeChange,
  hotspotCount,
}: MobileModeSwitcherProps) => {
  const { t } = useLocale();

  const modes: { id: EditorMode; label: string; badge?: number }[] = [
    { id: "edit", label: t("editor.tabs.hotspots"), badge: hotspotCount > 0 ? hotspotCount : undefined },
    { id: "preview", label: "Preview" },
    { id: "post", label: "Post" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe-plus">
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent border border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-400"
              )}
            >
              <span>{mode.label}</span>
              {mode.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full",
                    isActive
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {mode.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileModeSwitcher;
