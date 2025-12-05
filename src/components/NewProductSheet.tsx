import { useState } from "react";
import { Product, ClickBehavior } from "@/types/video";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, ExternalLink } from "lucide-react";

interface NewProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProduct: (product: Omit<Product, "id">) => string;
  onProductCreated?: (productId: string, clickBehavior?: ClickBehavior) => void;
}

const CTA_PRESETS = ["Shop Now", "Buy", "More Info", "See Details"];

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
    ctaLabel: "Shop Now",
    price: "",
    thumbnail: "",
    clickBehavior: "show-card" as ClickBehavior,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [urlTouched, setUrlTouched] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
      ctaLabel: "Shop Now",
      price: "",
      thumbnail: "",
      clickBehavior: "show-card",
    });
    setThumbnailPreview("");
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
      new URL(url);
      return true;
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

    const newId = onCreateProduct({
      title: formData.title,
      description: formData.description || undefined,
      link: formData.link,
      ctaLabel: formData.ctaLabel || "Shop Now",
      price: formData.price || undefined,
      thumbnail: formData.thumbnail || undefined,
      defaultClickBehavior: formData.clickBehavior,
    });
    onProductCreated?.(newId, formData.clickBehavior);
    handleClose();
  };

  // Validation: name required, URL required unless click behavior is "no-action"
  const needsUrl = formData.clickBehavior !== "no-action";
  const urlValid = !needsUrl || isValidUrl(formData.link);
  const showUrlError = urlTouched && needsUrl && formData.link.trim() && !isValidUrl(formData.link);
  const isFormValid = formData.title.trim() && urlValid;

  const domain = extractDomain(formData.link);

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(true);
    }}>
      <DrawerContent className="h-[95vh] max-h-[95vh] bg-background flex flex-col">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <button
            onClick={handleClose}
            className="text-[15px] text-muted-foreground hover:text-foreground transition-colors min-w-[60px] text-left"
          >
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-foreground">
            New product
          </h2>
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            size="sm"
            className="h-8 px-4 text-[14px] font-medium min-w-[60px]"
          >
            Save
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-5 space-y-6">
            
            {/* A) HERO IMAGE UPLOAD */}
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
                <div className="aspect-square w-full max-w-[280px] mx-auto rounded-2xl bg-muted/50 border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/70 transition-all flex flex-col items-center justify-center overflow-hidden">
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
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[14px] font-medium">Change image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-muted-foreground/50 mb-3" />
                      <span className="text-[14px] text-muted-foreground">Add product image</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* B) BASIC INFO */}
            <div className="space-y-4">
              {/* Product Name (required) */}
              <div>
                <label className="text-[13px] font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                  Product name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter product name"
                  className="h-12 text-[16px] bg-background border-border/60 text-foreground rounded-xl"
                />
              </div>

              {/* Short Description (optional) */}
              <div>
                <label className="text-[13px] font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a short description…"
                  rows={2}
                  className="w-full px-3 py-3 text-[15px] text-foreground rounded-xl border border-border/60 bg-background resize-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* C) PRICE */}
            <div>
              <label className="text-[13px] font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                Price
              </label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. €49.99"
                className="h-12 text-[15px] bg-background border-border/60 text-foreground rounded-xl"
              />
            </div>

            {/* D) LINK & ACTION */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
                Link & Action
              </h3>

              {/* CTA Label with Presets */}
              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">
                  CTA Label
                </label>
                <Input
                  value={formData.ctaLabel}
                  onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                  placeholder="Shop Now"
                  className="h-12 text-[15px] bg-background border-border/60 text-foreground rounded-xl mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {CTA_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, ctaLabel: preset })}
                      className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
                        formData.ctaLabel === preset
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-muted/50 border-border/40 text-muted-foreground hover:border-border"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product URL */}
              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">
                  Product URL {needsUrl && <span className="text-destructive">*</span>}
                </label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  onBlur={() => setUrlTouched(true)}
                  placeholder="https://…"
                  className={`h-12 text-[15px] bg-background border-border/60 text-foreground rounded-xl ${
                    showUrlError ? "border-destructive focus:border-destructive" : ""
                  }`}
                />
                {showUrlError && (
                  <p className="text-[12px] text-destructive mt-1.5">
                    Please enter a valid URL
                  </p>
                )}
                {domain && !showUrlError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-muted-foreground">
                    <ExternalLink className="w-3 h-3" />
                    <span>{domain}</span>
                  </div>
                )}
              </div>

              {/* Click Behavior Segmented Control */}
              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">
                  Click behavior
                </label>
                <div className="flex rounded-xl border border-border/60 bg-muted/30 p-1 gap-1">
                  {[
                    { value: "show-card", label: "Show card" },
                    { value: "direct-link", label: "Direct link" },
                    { value: "no-action", label: "No click" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, clickBehavior: option.value as ClickBehavior })}
                      className={`flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                        formData.clickBehavior === option.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="border-t border-border/40 p-4 pb-8 bg-background">
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full h-12 text-[15px] font-medium rounded-xl"
          >
            Save product
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewProductSheet;