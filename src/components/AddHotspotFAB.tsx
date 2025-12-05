import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import TooltipHint from "./ftux/TooltipHint";

interface AddHotspotFABProps {
  onClick: () => void;
  className?: string;
  showHint?: boolean;
  onHintDismiss?: () => void;
}

const AddHotspotFAB = ({ onClick, className, showHint = false, onHintDismiss }: AddHotspotFABProps) => {
  const handleClick = () => {
    if (showHint && onHintDismiss) {
      onHintDismiss();
    }
    onClick();
  };

  return (
    <div className="fixed z-40" style={{ bottom: 180, right: 16 }}>
      {/* Tooltip hint */}
      {showHint && onHintDismiss && (
        <div className="absolute bottom-full right-0 mb-3">
          <TooltipHint
            title="Add your first hotspot"
            subtitle="Tap here to begin."
            position="bottom"
            show={showHint}
            onDismiss={onHintDismiss}
          />
        </div>
      )}
      
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 px-5 py-3.5 rounded-full",
          "bg-gradient-to-r from-primary to-[hsl(220,98%,58%)]",
          "text-primary-foreground font-medium text-sm",
          "shadow-[0_4px_20px_hsl(var(--primary)/0.4)]",
          "hover:shadow-[0_6px_28px_hsl(var(--primary)/0.5)]",
          "active:scale-95 transition-all duration-150",
          "animate-fab-enter",
          className
        )}
      >
        <Plus className="w-5 h-5" />
        <span>Add Hotspot</span>
      </button>
    </div>
  );
};

export default AddHotspotFAB;
