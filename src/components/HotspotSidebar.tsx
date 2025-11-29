import { Hotspot, Product } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface HotspotSidebarProps {
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenProductPanel?: (hotspot: Hotspot) => void;
  onOpenLayoutPanel?: (hotspot: Hotspot) => void;
  onDeleteHotspot?: (hotspotId: string) => void;
}

const HotspotSidebar = ({
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onOpenProductPanel,
  onOpenLayoutPanel,
  onDeleteHotspot,
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">
          Hotspots
        </h2>
      </div>

      {/* Hotspot List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sortedHotspots.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-[#6B7280]">
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
                    "w-full px-3 py-3 rounded-lg transition-all duration-150",
                    isUnassigned
                      ? "bg-[rgba(59,130,246,0.06)] border border-dashed border-[rgba(59,130,246,0.3)] hover:bg-[rgba(59,130,246,0.1)] cursor-pointer"
                      : "hover:bg-[rgba(0,0,0,0.02)] cursor-pointer",
                    !isUnassigned && isSelected
                      ? "bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)]"
                      : !isUnassigned && "border border-transparent"
                  )}
                  onClick={() => {
                    if (isUnassigned && onOpenProductPanel) {
                      onOpenProductPanel(hotspot);
                    } else if (!isUnassigned && onOpenLayoutPanel) {
                      onOpenLayoutPanel(hotspot);
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon/Bullet */}
                    {isUnassigned ? (
                      <div className="w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[#3B82F6]"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        {hotspotNumber && (
                          <span className="text-[11px] font-semibold text-[#9CA3AF]">
                            #{hotspotNumber}
                          </span>
                        )}
                        <span className={cn(
                          "text-[13px] font-medium truncate",
                          isUnassigned ? "text-[#3B82F6]" : "text-[#111827]"
                        )}>
                          {isUnassigned ? "New Hotspot – Assign Product" : product?.title || "Unknown Product"}
                        </span>
                      </div>
                      {isUnassigned ? (
                        <p className="text-[11px] text-[#6B7280] italic">
                          Click to choose a product
                        </p>
                      ) : (
                        <p className="text-[12px] text-[#6B7280]">
                          {hotspot.timeStart.toFixed(1)}s – {hotspot.timeEnd.toFixed(1)}s
                        </p>
                      )}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1 ml-auto">
                      {!isUnassigned && onOpenLayoutPanel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLayoutPanel(hotspot);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(59,130,246,0.1)] text-[#6B7280] hover:text-[#3B82F6] transition-colors"
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
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(239,68,68,0.1)] text-[#6B7280] hover:text-[#EF4444] transition-colors"
                          title="Delete Hotspot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
