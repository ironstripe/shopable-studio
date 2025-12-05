import { Hotspot, Product } from "@/types/video";
import HotspotSidebar from "./HotspotSidebar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface HotspotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenProductPanel?: (hotspot: Hotspot) => void;
  onOpenLayoutPanel?: (hotspot: Hotspot) => void;
  onDeleteHotspot?: (hotspotId: string) => void;
}

const HotspotDrawer = ({
  open,
  onOpenChange,
  hotspots,
  products,
  selectedHotspotId,
  onSelectHotspot,
  onOpenProductPanel,
  onOpenLayoutPanel,
  onDeleteHotspot,
}: HotspotDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh] bg-card border-border">
        <DrawerHeader className="border-b border-border/30 pb-3">
          <DrawerTitle className="text-foreground">Hotspots</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-auto">
          <HotspotSidebar
            hotspots={hotspots}
            products={products}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={(hotspot) => {
              onSelectHotspot(hotspot);
              onOpenChange(false);
            }}
            onOpenProductPanel={(hotspot) => {
              onOpenProductPanel?.(hotspot);
              onOpenChange(false);
            }}
            onOpenLayoutPanel={(hotspot) => {
              onOpenLayoutPanel?.(hotspot);
              onOpenChange(false);
            }}
            onDeleteHotspot={onDeleteHotspot}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HotspotDrawer;
