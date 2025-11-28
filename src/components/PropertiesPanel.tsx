import { Hotspot, Product } from "@/types/video";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  selectedHotspot: Hotspot | null;
  products: Record<string, Product>;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
}

const PropertiesPanel = ({
  selectedHotspot,
  products,
  onUpdateHotspot,
  onDeleteHotspot,
}: PropertiesPanelProps) => {
  if (!selectedHotspot) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground text-center">
          Click on the video to add a hotspot or select an existing one to edit
        </p>
      </Card>
    );
  }

  const duration = selectedHotspot.timeEnd - selectedHotspot.timeStart;

  return (
    <Card className="p-6 bg-card border-border space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Hotspot Properties</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteHotspot(selectedHotspot.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="timeStart">Start Time (seconds)</Label>
          <Input
            id="timeStart"
            type="number"
            step="0.1"
            value={selectedHotspot.timeStart}
            onChange={(e) =>
              onUpdateHotspot({
                ...selectedHotspot,
                timeStart: parseFloat(e.target.value),
              })
            }
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="timeEnd">End Time (seconds)</Label>
          <Input
            id="timeEnd"
            type="number"
            step="0.1"
            value={selectedHotspot.timeEnd}
            onChange={(e) =>
              onUpdateHotspot({
                ...selectedHotspot,
                timeEnd: parseFloat(e.target.value),
              })
            }
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label>Duration</Label>
          <Input
            value={`${duration.toFixed(1)}s`}
            disabled
            className="bg-muted border-border"
          />
        </div>

        <div>
          <Label htmlFor="productId">Product</Label>
          <Select
            value={selectedHotspot.productId}
            onValueChange={(value) =>
              onUpdateHotspot({ ...selectedHotspot, productId: value })
            }
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(products).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default PropertiesPanel;
