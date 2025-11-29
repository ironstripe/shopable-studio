import { Hotspot, Product } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HotspotSidebarProps {
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
}

const HotspotSidebar = ({
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
}: HotspotSidebarProps) => {
  const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);

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
              const product = products[hotspot.productId];
              const isSelected = selectedHotspotId === hotspot.id;

              return (
                <button
                  key={hotspot.id}
                  onClick={() => onSelectHotspot(hotspot)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg transition-all duration-150",
                    "hover:bg-[rgba(0,0,0,0.02)]",
                    isSelected
                      ? "bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.3)]"
                      : "border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Bullet */}
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                        isSelected ? "bg-[#3B82F6]" : "bg-[#D1D5DB]"
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-[#9CA3AF]">
                          #{index + 1}
                        </span>
                        <span className="text-[13px] font-medium text-[#111827] truncate">
                          {product?.title || "Unknown Product"}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B7280]">
                        {hotspot.timeStart.toFixed(1)}s – {hotspot.timeEnd.toFixed(1)}s
                      </p>
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
