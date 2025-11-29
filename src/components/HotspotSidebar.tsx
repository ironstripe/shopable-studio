import { Hotspot, Product } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Tag } from "lucide-react";
import { useEffect, useRef } from "react";

interface HotspotSidebarProps {
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenProductPanel?: (hotspot: Hotspot) => void;
}

const HotspotSidebar = ({
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onOpenProductPanel,
}: HotspotSidebarProps) => {
  const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);
  const hotspotRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-[rgba(0,0,0,0.06)] h-full flex flex-col">
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
            sortedHotspots.map((hotspot, index) => {
              const product = hotspot.productId ? products[hotspot.productId] : null;
              const isSelected = selectedHotspotId === hotspot.id;
              const isUnassigned = !hotspot.productId;

              return (
                <button
                  key={hotspot.id}
                  ref={(el) => (hotspotRefs.current[hotspot.id] = el)}
                  onClick={() => {
                    if (isUnassigned && onOpenProductPanel) {
                      onOpenProductPanel(hotspot);
                    } else {
                      onSelectHotspot(hotspot);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg transition-all duration-150",
                    isUnassigned
                      ? "bg-[rgba(59,130,246,0.06)] border border-dashed border-[rgba(59,130,246,0.3)] hover:bg-[rgba(59,130,246,0.1)]"
                      : "hover:bg-[rgba(0,0,0,0.02)]",
                    !isUnassigned && isSelected
                      ? "bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)]"
                      : !isUnassigned && "border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon/Bullet */}
                    {isUnassigned ? (
                      <div className="w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                          isSelected ? "bg-[#3B82F6]" : "bg-[#D1D5DB]"
                        )}
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-[#9CA3AF]">
                          #{index + 1}
                        </span>
                        <span className={cn(
                          "text-[13px] font-medium truncate",
                          isUnassigned ? "text-[#3B82F6]" : "text-[#111827]"
                        )}>
                          {isUnassigned ? "New hotspot (no product assigned)" : product?.title || "Unknown Product"}
                        </span>
                      </div>
                      {isUnassigned ? (
                        <p className="text-[11px] text-[#6B7280] italic">
                          Click to assign a product
                        </p>
                      ) : (
                        <p className="text-[12px] text-[#6B7280]">
                          {hotspot.timeStart.toFixed(1)}s – {hotspot.timeEnd.toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HotspotSidebar;
