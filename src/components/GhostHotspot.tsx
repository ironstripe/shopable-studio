import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostHotspotProps {
  x: number;
  y: number;
  scale?: number;
  isDragging: boolean;
  onCommit: () => void;
  onCancel: () => void;
}

const GhostHotspot = ({ 
  x, 
  y, 
  scale = 1, 
  isDragging, 
  onCommit, 
  onCancel 
}: GhostHotspotProps) => {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 150,
      }}
    >
      {/* Ghost circle with dashed border */}
      <div 
        className={cn(
          "w-8 h-8 rounded-full border-2 border-dashed border-primary bg-primary/20",
          "flex items-center justify-center",
          isDragging ? "animate-pulse" : "animate-ghost-hotspot-idle"
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-2 h-2 rounded-full bg-primary/60" />
      </div>
      
      {/* Commit/Cancel buttons - appear after finger lift */}
      {!isDragging && (
        <div className="absolute -right-2 -bottom-2 flex gap-1 animate-scale-in">
          {/* Cancel button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className={cn(
              "w-6 h-6 bg-white/90 rounded-full",
              "flex items-center justify-center shadow-md",
              "border border-[rgba(0,0,0,0.08)]",
              "active:scale-90 transition-transform"
            )}
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
          
          {/* Commit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCommit();
            }}
            className={cn(
              "w-7 h-7 bg-primary rounded-full",
              "flex items-center justify-center shadow-lg",
              "active:scale-90 transition-transform"
            )}
          >
            <Check className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      )}
      
      {/* Drag hint */}
      {isDragging && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
          <span className="text-[10px] font-medium text-white bg-black/70 px-2 py-1 rounded-full">
            Drag to adjust
          </span>
        </div>
      )}
    </div>
  );
};

export default GhostHotspot;
