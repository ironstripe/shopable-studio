import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddHotspotFABProps {
  onClick: () => void;
  className?: string;
}

const AddHotspotFAB = ({ onClick, className }: AddHotspotFABProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40 flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "hover:bg-primary/90 active:scale-95 transition-all",
        "font-medium text-sm",
        className
      )}
    >
      <Plus className="w-5 h-5" />
      <span>Hotspot</span>
    </button>
  );
};

export default AddHotspotFAB;
