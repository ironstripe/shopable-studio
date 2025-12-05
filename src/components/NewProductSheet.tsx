import { useState } from "react";
import { Product } from "@/types/video";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Check, X } from "lucide-react";

interface NewProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProduct: (product: Omit<Product, "id">) => string;
  onProductCreated?: (productId: string) => void;
}

const NewProductSheet = ({
  open,
  onOpenChange,
  onCreateProduct,
  onProductCreated,
}: NewProductSheetProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    ctaLabel: "Kaufen",
    price: "",
    thumbnail: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
      ctaLabel: "Kaufen",
      price: "",
      thumbnail: "",
    });
    setThumbnailPreview("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setThumbnailPreview(result);
        setFormData({ ...formData, thumbnail: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.link) return;
    
    const newId = onCreateProduct(formData);
    onProductCreated?.(newId);
    handleClose();
  };

  const isValid = formData.title.trim() && formData.link.trim();

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(true);
    }}>
      <DrawerContent className="max-h-[95vh] bg-white">
        {/* Header */}
        <DrawerHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-foreground">
              New product
            </DrawerTitle>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DrawerHeader>

        {/* Form Content */}
        <ScrollArea className="flex-1 max-h-[calc(95vh-180px)]">
          <div className="px-4 py-4 space-y-4">
            {/* Product Name */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                Product name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter product name"
                className="h-11 text-[14px] bg-background border-border/60 text-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                Description
              </Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description (optional)"
                className="w-full h-20 px-3 py-2.5 text-[14px] text-foreground rounded-lg border border-border/60 bg-background resize-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>

            {/* Product URL */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                Product URL <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://…"
                className="h-11 text-[14px] bg-background border-border/60 text-foreground"
              />
            </div>

            {/* CTA Label */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                CTA label
              </Label>
              <Input
                value={formData.ctaLabel}
                onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                placeholder="e.g. 'Kaufen', 'Shop now'"
                className="h-11 text-[14px] bg-background border-border/60 text-foreground"
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                Price
              </Label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. €49.99"
                className="h-11 text-[14px] bg-background border-border/60 text-foreground"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <Label className="text-[13px] text-muted-foreground mb-1.5 block">
                Thumbnail
              </Label>
              
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="new-product-thumbnail-upload"
                />
                <label
                  htmlFor="new-product-thumbnail-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2.5 text-[13px] font-medium rounded-lg border border-border/60 bg-background hover:bg-muted/50 text-foreground transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload image
                </label>
                {(thumbnailPreview || formData.thumbnail) && (
                  <img 
                    src={thumbnailPreview || formData.thumbnail} 
                    className="w-12 h-12 rounded-lg object-cover border border-border/60" 
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
                <span>or paste URL</span>
              </div>
              
              <Input
                value={formData.thumbnail}
                onChange={(e) => {
                  setFormData({ ...formData, thumbnail: e.target.value });
                  setThumbnailPreview("");
                }}
                placeholder="https://example.com/image.jpg"
                className="h-11 text-[14px] bg-background border-border/60 text-foreground"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DrawerFooter className="border-t border-border/40 pt-4">
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-11 text-[14px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 h-11 text-[14px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save product
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default NewProductSheet;
