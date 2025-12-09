import { Hotspot, Product } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Target, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { isHotspotComplete } from "@/hooks/use-scene-state";
interface HotspotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenProductSelection: (hotspotId: string) => void;
  onOpenLayoutSheet: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  isPreviewMode: boolean;
}

const HotspotDrawer = ({
  open,
  onOpenChange,
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onOpenProductSelection,
  onOpenLayoutSheet,
  onDeleteHotspot,
  isPreviewMode,
}: HotspotDrawerProps) => {
  const { t } = useLocale();
  const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);
  const hotspotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const prevSelectedId = useRef<string | null>(null);

  // Calculate hotspot numbers only for assigned hotspots
  const assignedHotspots = sortedHotspots.filter(h => h.productId);
  const getHotspotNumber = (hotspot: Hotspot) => {
    if (!hotspot.productId) return null;
    return assignedHotspots.findIndex(h => h.id === hotspot.id) + 1;
  };

  // Auto-scroll to selected hotspot and highlight
  useEffect(() => {
    if (open && selectedHotspotId && hotspotRefs.current[selectedHotspotId]) {
      setTimeout(() => {
        hotspotRefs.current[selectedHotspotId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        // Flash highlight if selection came from outside (video tap)
        if (prevSelectedId.current !== selectedHotspotId) {
          setHighlightedRowId(selectedHotspotId);
          setTimeout(() => setHighlightedRowId(null), 150);
        }
      }, 100);
    }
    prevSelectedId.current = selectedHotspotId;
  }, [open, selectedHotspotId]);

  const handleRowClick = (hotspot: Hotspot) => {
    const isUnassigned = !hotspot.productId;
    
    // Select and seek video first
    onSelectHotspot(hotspot);
    
    // Close drawer
    onOpenChange(false);
    
    // In edit mode, open the appropriate panel after a brief delay
    if (!isPreviewMode) {
      setTimeout(() => {
        if (isUnassigned) {
          onOpenProductSelection(hotspot.id);
        } else {
          onOpenLayoutSheet(hotspot);
        }
      }, 200);
    }
  };

  const handleEditClick = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.stopPropagation();
    onOpenLayoutSheet(hotspot);
    onOpenChange(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, hotspotId: string) => {
    e.stopPropagation();
    if (window.confirm(t("hotspots.deleteConfirm"))) {
      onDeleteHotspot?.(hotspotId);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] min-h-[40vh] bg-background rounded-t-2xl border-t border-border/30">
        {/* Header with close button */}
        <DrawerHeader className="flex items-center justify-between border-b border-border/10 pb-3 px-4">
          <DrawerTitle className="text-base font-semibold text-foreground">
            {t("hotspots.title")}
          </DrawerTitle>
          <DrawerClose asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {sortedHotspots.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">
                {t("hotspots.empty")}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {t("hotspots.emptyHint")}
              </p>
            </div>
          ) : (
            /* Hotspot List */
            <ScrollArea className="h-full max-h-[60vh]">
              <div className="p-3 pb-safe-plus space-y-2">
                {sortedHotspots.map((hotspot) => {
                  const product = hotspot.productId ? products[hotspot.productId] : null;
                  const isSelected = selectedHotspotId === hotspot.id;
                  const isUnassigned = !hotspot.productId;
                  const hotspotNumber = getHotspotNumber(hotspot);
                  const isComplete = isHotspotComplete(hotspot);
                  return (
                    <div
                      key={hotspot.id}
                      ref={(el) => (hotspotRefs.current[hotspot.id] = el)}
                      className={cn(
                        "w-full min-h-[56px] px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer",
                        "active:scale-[0.98]",
                        isUnassigned
                          ? "bg-primary/5 border border-dashed border-primary/30 hover:bg-primary/10"
                          : "hover:bg-muted/50",
                        !isUnassigned && isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : !isUnassigned && "border border-transparent",
                        highlightedRowId === hotspot.id && "animate-row-highlight"
                      )}
                      onClick={() => handleRowClick(hotspot)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Circular Badge with completion indicator */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              isUnassigned
                                ? "bg-primary/10 border-2 border-dashed border-primary/40"
                                : "bg-primary text-primary-foreground"
                            )}
                          >
                            {isUnassigned ? (
                              <Plus className="w-4 h-4 text-primary" />
                            ) : (
                              <span className="text-xs font-bold">
                                {hotspotNumber}
                              </span>
                            )}
                          </div>
                          {/* Incomplete warning badge */}
                          {!isComplete && !isPreviewMode && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                              <AlertCircle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isUnassigned ? "text-primary" : "text-foreground"
                          )}>
                            {isUnassigned 
                              ? t("hotspots.new")
                              : product?.title || t("hotspots.unknownProduct")
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isUnassigned 
                              ? t("hotspots.newHint")
                              : `${hotspot.timeStart.toFixed(1)}s – ${hotspot.timeEnd.toFixed(1)}s`
                            }
                          </p>
                        </div>

                        {/* Action Icons - Hidden in preview mode */}
                        {!isPreviewMode && (
                          <div className="flex items-center gap-1 ml-auto">
                            {!isUnassigned && (
                              <button
                                onClick={(e) => handleEditClick(e, hotspot)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                title="Edit Layout & Behavior"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteClick(e, hotspot.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete Hotspot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HotspotDrawer;
