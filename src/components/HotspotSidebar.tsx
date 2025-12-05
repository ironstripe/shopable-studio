import { Hotspot, Product } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { useEffect, useRef } from "react";

interface HotspotSidebarProps {
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenProductPanel?: (hotspot: Hotspot) => void;
  onOpenLayoutPanel?: (hotspot: Hotspot) => void;
  onDeleteHotspot?: (hotspotId: string) => void;
  isPreviewMode?: boolean;
}

const HotspotSidebar = ({
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onOpenProductPanel,
  onOpenLayoutPanel,
  onDeleteHotspot,
  isPreviewMode = false,
}: HotspotSidebarProps) => {
  const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);
  const hotspotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Calculate hotspot numbers only for assigned hotspots
  const assignedHotspots = sortedHotspots.filter(h => h.productId);
  const getHotspotNumber = (hotspot: Hotspot) => {
    if (!hotspot.productId) return null;
    return assignedHotspots.findIndex(h => h.id === hotspot.id) + 1;
  };

  // Auto-scroll to selected hotspot
  useEffect(() => {
    if (selectedHotspotId && hotspotRefs.current[selectedHotspotId]) {
      hotspotRefs.current[selectedHotspotId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedHotspotId]);

  const handleRowClick = (hotspot: Hotspot) => {
    const isUnassigned = !hotspot.productId;
    
    if (isPreviewMode) {
      // In preview mode, just select (view-only)
      onSelectHotspot(hotspot);
      return;
    }

    // Edit mode behavior
    if (isUnassigned && onOpenProductPanel) {
      onOpenProductPanel(hotspot);
    } else if (!isUnassigned && onOpenLayoutPanel) {
      onOpenLayoutPanel(hotspot);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/10">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Hotspots
        </h2>
      </div>

      {/* Hotspot List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sortedHotspots.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No hotspots yet.
                <br />
                Click on the video to add one.
              </p>
            </div>
          ) : (
            sortedHotspots.map((hotspot) => {
              const product = hotspot.productId ? products[hotspot.productId] : null;
              const isSelected = selectedHotspotId === hotspot.id;
              const isUnassigned = !hotspot.productId;
              const hotspotNumber = getHotspotNumber(hotspot);

              return (
                <div
                  key={hotspot.id}
                  ref={(el) => (hotspotRefs.current[hotspot.id] = el)}
                  className={cn(
                    "w-full min-h-[52px] px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer",
                    isUnassigned
                      ? "bg-primary/5 border border-dashed border-primary/30 hover:bg-primary/10"
                      : "hover:bg-muted/50",
                    !isUnassigned && isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : !isUnassigned && "border border-transparent"
                  )}
                  onClick={() => handleRowClick(hotspot)}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Circular Badge */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                        isUnassigned
                          ? "bg-primary/10 border-2 border-dashed border-primary/40"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {isUnassigned ? (
                        <Plus className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <span className="text-[11px] font-bold">
                          {hotspotNumber}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[13px] font-medium truncate",
                        isUnassigned ? "text-primary" : "text-foreground"
                      )}>
                        {isUnassigned 
                          ? "New Hotspot – Assign Product" 
                          : product?.title || "Unknown Product"
                        }
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isUnassigned 
                          ? "Click to choose a product" 
                          : `${hotspot.timeStart.toFixed(1)}s – ${hotspot.timeEnd.toFixed(1)}s`
                        }
                      </p>
                    </div>

                    {/* Action Icons - Hidden in preview mode */}
                    {!isPreviewMode && (
                      <div className="flex items-center gap-1 ml-auto">
                        {!isUnassigned && onOpenLayoutPanel && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLayoutPanel(hotspot);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Edit Layout & Behavior"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteHotspot && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete this hotspot?`)) {
                                onDeleteHotspot(hotspot.id);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Hotspot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HotspotSidebar;
