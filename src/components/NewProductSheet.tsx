import { useState, useEffect } from "react";
import { Product, ClickBehavior } from "@/types/video";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProduct: (product: Omit<Product, "id">) => string;
  onProductCreated?: (productId: string, clickBehavior?: ClickBehavior) => void;
  editingProduct?: Product | null;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const CTA_PRESETS = ["Shop Now", "Buy", "More Info", "See Details"];

const NewProductSheet = ({
  open,
  onOpenChange,
  onCreateProduct,
  onProductCreated,
  editingProduct,
  onUpdateProduct,
  onDeleteProduct,
}: NewProductSheetProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    ctaLabel: "Shop Now",
    price: "",
    thumbnail: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [nameTouched, setNameTouched] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);

  const isEditMode = !!editingProduct;

  // Populate form when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title || "",
        description: editingProduct.description || "",
        link: editingProduct.link || "",
        ctaLabel: editingProduct.ctaLabel || "Shop Now",
        price: editingProduct.price || "",
        thumbnail: editingProduct.thumbnail || "",
      });
      setThumbnailPreview(editingProduct.thumbnail || "");
    }
  }, [editingProduct]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
      ctaLabel: "Shop Now",
      price: "",
      thumbnail: "",
    });
    setThumbnailPreview("");
    setNameTouched(false);
    setUrlTouched(false);
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

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const extractDomain = (url: string): string | null => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return null;
    }
  };

  const handleSave = () => {
    if (!isFormValid) return;

    if (isEditMode && editingProduct && onUpdateProduct) {
      onUpdateProduct({
        ...editingProduct,
        title: formData.title,
        description: formData.description || undefined,
        link: formData.link,
        ctaLabel: formData.ctaLabel || "Shop Now",
        price: formData.price || undefined,
        thumbnail: formData.thumbnail || undefined,
      });
    } else {
      const newId = onCreateProduct({
        title: formData.title,
        description: formData.description || undefined,
        link: formData.link,
        ctaLabel: formData.ctaLabel || "Shop Now",
        price: formData.price || undefined,
        thumbnail: formData.thumbnail || undefined,
      });
      onProductCreated?.(newId);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (editingProduct && onDeleteProduct) {
      onDeleteProduct(editingProduct.id);
      handleClose();
    }
  };

  // Validation
  const showNameError = nameTouched && !formData.title.trim();
  const showUrlError = urlTouched && formData.link.trim() && !isValidUrl(formData.link);
  const isFormValid = formData.title.trim() && isValidUrl(formData.link);

  const domain = extractDomain(formData.link);

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(true);
    }}>
      <DrawerContent className="h-[90vh] max-h-[90vh] bg-white flex flex-col rounded-t-[20px]">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D0D0D0]" />
        </div>

        {/* Header - Light theme */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
          <button
            onClick={handleClose}
            className="text-[15px] text-[#666666] hover:text-[#333333] transition-colors min-w-[60px] text-left font-medium"
          >
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-[#111111]">
            {isEditMode ? "Edit product" : "New product"}
          </h2>
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            size="sm"
            className="h-8 px-4 text-[14px] font-medium min-w-[60px] bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save
          </Button>
        </div>

        {/* Scrollable Content - Light theme */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-5 space-y-5">
            
            {/* A) HERO IMAGE UPLOAD - Premium light design */}
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="hero-image-upload"
              />
              <label
                htmlFor="hero-image-upload"
                className="block cursor-pointer"
              >
                <div className={cn(
                  "aspect-square w-full max-w-[240px] mx-auto rounded-2xl",
                  "bg-[#F5F5F5] border-2 border-dashed border-[#D0D0D0]",
                  "hover:border-primary/60 hover:bg-[#F0F0F0]",
                  "focus-within:border-primary focus-within:border-solid",
                  "transition-all flex flex-col items-center justify-center overflow-hidden"
                )}>
                  {thumbnailPreview || formData.thumbnail ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={thumbnailPreview || formData.thumbnail}
                        className="w-full h-full object-cover"
                        alt="Product"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          setThumbnailPreview("");
                        }}
                      />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[13px] font-medium text-[#333333] shadow-sm">
                          Change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-[#999999] mb-3" strokeWidth={1.5} />
                      <span className="text-[15px] font-medium text-[#333333]">Add product image</span>
                      <span className="text-[13px] text-[#888888] mt-1">Upload from library or take a photo</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* B) PRODUCT NAME (required) */}
            <div>
              <label className="text-[13px] font-medium text-[#666666] mb-1.5 block">
                Product name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => setNameTouched(true)}
                placeholder="e.g. Bose QuietComfort Ultra"
                className={cn(
                  "h-12 text-[16px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  showNameError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
              {showNameError && (
                <p className="text-[12px] text-red-500 mt-1.5">Product name is required</p>
              )}
            </div>

            {/* C) DESCRIPTION (optional) */}
            <div>
              <label className="text-[13px] font-medium text-[#666666] mb-1.5 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional. Short description that appears in the product card."
                rows={3}
                className="w-full px-3 py-3 text-[15px] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl border border-[#E0E0E0] bg-white resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>

            {/* D) PRICE (optional) */}
            <div>
              <label className="text-[13px] font-medium text-[#666666] mb-1.5 block">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-[#888888] font-medium">€</span>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 349.–"
                  className="h-12 text-[15px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl pl-8 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* E) PRODUCT URL (required) */}
            <div>
              <label className="text-[13px] font-medium text-[#666666] mb-1.5 block">
                Product URL <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                onBlur={() => setUrlTouched(true)}
                placeholder="https://…"
                className={cn(
                  "h-12 text-[15px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  showUrlError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
              <p className="text-[12px] text-[#888888] mt-1.5">
                The link users see when they tap the product card.
              </p>
              {showUrlError && (
                <p className="text-[12px] text-red-500 mt-1">Please enter a valid URL (https://...)</p>
              )}
              {domain && !showUrlError && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[#666666]">
                  <ExternalLink className="w-3 h-3" />
                  <span>{domain}</span>
                </div>
              )}
            </div>

            {/* F) BUTTON LABEL (optional) */}
            <div>
              <label className="text-[13px] font-medium text-[#666666] mb-1.5 block">
                Button label
              </label>
              <Input
                value={formData.ctaLabel}
                onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                placeholder="e.g. Shop now"
                className="h-12 text-[15px] bg-white border-[#E0E0E0] text-[#111111] placeholder:text-[#AAAAAA] rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {CTA_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, ctaLabel: preset })}
                    className={cn(
                      "px-3 py-1.5 text-[12px] rounded-full border transition-colors",
                      formData.ctaLabel === preset
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-[#F5F5F5] border-[#E0E0E0] text-[#666666] hover:border-[#CCCCCC]"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer - Light theme with shadow */}
        <div className="border-t border-[#EBEBEB] p-4 pb-safe-plus bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            {/* Delete button (only in edit mode) */}
            {isEditMode && onDeleteProduct && (
              <button
                onClick={handleDelete}
                className="text-[15px] font-medium text-red-500 hover:text-red-600 transition-colors px-2"
              >
                Delete
              </button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isFormValid}
              className={cn(
                "h-12 text-[15px] font-medium rounded-xl",
                isEditMode ? "flex-1" : "w-full"
              )}
            >
              {isEditMode ? "Save changes" : "Save product"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewProductSheet;
