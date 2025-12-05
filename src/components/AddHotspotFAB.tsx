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
    <div className="fixed z-40" style={{ bottom: 160, right: 16 }}>
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
          "flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 active:scale-95 transition-all",
          "font-medium text-sm",
          className
        )}
      >
        <Plus className="w-5 h-5" />
        <span>Hotspot</span>
      </button>
    </div>
  );
};

export default AddHotspotFAB;
