import { Hotspot, Product } from "@/types/video";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface HotspotListProps {
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
}

const HotspotList = ({
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onDeleteHotspot,
}: HotspotListProps) => {
  const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);

  return (
    <div className="border-b border-border/50">
      <div className="p-6 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
          Hotspots
        </h3>
      </div>
      
      <ScrollArea className="max-h-[240px]">
        <div className="px-6 pb-4 space-y-1">
          {sortedHotspots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No hotspots yet</p>
          ) : (
            sortedHotspots.map((hotspot, index) => {
              const product = products[hotspot.productId];
              const isActive = selectedHotspotId === hotspot.id;
              
              return (
                <div
                  key={hotspot.id}
                  onClick={() => onSelectHotspot(hotspot)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-[#FF6A00]/20 border-l-2 border-[#FF6A00]" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-[#888888] w-6">#{index + 1}</span>
                    <span className="text-xs text-[#AAAAAA] font-mono">
                      [{hotspot.timeStart.toFixed(1)}s – {hotspot.timeEnd.toFixed(1)}s]
                    </span>
                    <span className="text-sm text-white truncate">
                      {product?.title || "Unknown Product"}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this hotspot?")) {
                        onDeleteHotspot(hotspot.id);
                      }
                    }}
                    className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HotspotList;
