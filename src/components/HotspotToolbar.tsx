import { Hotspot } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";

interface HotspotToolbarProps {
  hotspot: Hotspot;
  onEdit: () => void;
  onDelete: () => void;
}

const HotspotToolbar = ({ hotspot, onEdit, onDelete }: HotspotToolbarProps) => {
  return (
    <div
      className="absolute z-20 flex gap-1 bg-card border border-border rounded-md shadow-lg p-1"
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
      >
        <Pencil className="w-3 h-3 mr-1" />
        Edit
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="w-3 h-3 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default HotspotToolbar;
