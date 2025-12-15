import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/video";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, Package, ImageIcon, ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/i18n";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, CURRENCY_SYMBOLS, normalizePrice, type CurrencyCode } from "@/utils/price-utils";

interface SelectProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Record<string, Product>;
  selectedProductId?: string | null;
  onSelectProduct: (productId: string) => void;
  onOpenNewProduct: () => void;
  showFTUXHint?: boolean;
  onFTUXHintDismiss?: () => void;
  // New props for editing
  assignedProductId?: string | null;
  onUpdateProduct?: (product: Product) => void;
  onRemoveProduct?: () => void;
}

const SelectProductSheet = ({
  open,
  onOpenChange,
  products,
  selectedProductId,
  onSelectProduct,
  onOpenNewProduct,
  showFTUXHint = false,
  onFTUXHintDismiss,
  assignedProductId,
  onUpdateProduct,
  onRemoveProduct,
}: SelectProductSheetProps) => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"select" | "edit">("select");
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    link: "",
    ctaLabel: "",
    price: "",
    currency: DEFAULT_CURRENCY as CurrencyCode,
    thumbnail: "",
    promoCode: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine initial mode when sheet opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      
      if (assignedProductId && products[assignedProductId]) {
        // Has assigned product - start in edit mode
        const product = products[assignedProductId];
        setViewMode("edit");
        setEditFormData({
          title: product.title || "",
          description: product.description || "",
          link: product.link || "",
          ctaLabel: product.ctaLabel || "Shop Now",
          price: product.price || "",
          currency: ((product as any).currency as CurrencyCode) || DEFAULT_CURRENCY,
          thumbnail: product.thumbnail || "",
          promoCode: product.promoCode || "",
        });
      } else {
        // No assigned product - start in select mode
        setViewMode("select");
        // Focus search input after animation
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 150);
      }
    }
  }, [open, assignedProductId, products]);

  const productList = Object.values(products);
  const filteredProducts = productList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectProduct = (productId: string) => {
    if (showFTUXHint && onFTUXHintDismiss) {
      onFTUXHintDismiss();
    }
    onSelectProduct(productId);
    onOpenChange(false);
  };

  const handleOpenNewProduct = () => {
    if (showFTUXHint && onFTUXHintDismiss) {
      onFTUXHintDismiss();
    }
    onOpenNewProduct();
  };

  const handleSaveEdit = () => {
    if (!assignedProductId || !onUpdateProduct) return;
    
    const normalizedPrice = normalizePrice(editFormData.price);
    
    const updatedProduct: Product & { currency?: string } = {
      id: assignedProductId,
      title: editFormData.title,
      description: editFormData.description || undefined,
      link: editFormData.link,
      ctaLabel: editFormData.ctaLabel || "Shop Now",
      price: normalizedPrice || undefined,
      thumbnail: editFormData.thumbnail || undefined,
      promoCode: editFormData.promoCode || undefined,
      currency: editFormData.currency,
    };
    
    onUpdateProduct(updatedProduct as Product);
    onOpenChange(false);
  };

  const handleRemoveProduct = () => {
    if (onRemoveProduct) {
      onRemoveProduct();
      setViewMode("select");
    }
  };

  const handleChangeProduct = () => {
    // User wants to pick a different product
    setViewMode("select");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  const hasProducts = productList.length > 0;
  const hasSearchResults = filteredProducts.length > 0;
  const canSave = editFormData.title.trim() && editFormData.link.trim();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] min-h-[50vh] bg-white flex flex-col rounded-t-[20px]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white pt-3 pb-0">
          {/* Drag Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-9 h-1 rounded-full bg-[#D0D0D0]" />
          </div>

          {/* FTUX Hint Banner - only in select mode */}
          {viewMode === "select" && showFTUXHint && (
            <div className="mx-4 mb-3 px-4 py-2.5 bg-primary/10 rounded-xl">
              <p className="text-[13px] text-primary font-medium text-center">
                {t("ftux.productHint")}
              </p>
            </div>
          )}

          {/* Header Row - conditional based on mode */}
          <div className="flex items-center justify-between px-4 pb-3">
            {viewMode === "edit" ? (
              <>
                <button
                  onClick={handleChangeProduct}
                  className="flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#111111] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("product.change")}
                </button>
                <h2 className="text-[17px] font-semibold text-[#111111]">
                  {t("product.edit")}
                </h2>
                <div className="w-16" /> {/* Spacer for centering */}
              </>
            ) : (
              <>
                <h2 className="text-[17px] font-semibold text-[#111111]">
                  {t("product.choose")}
                </h2>
                <button
                  onClick={handleOpenNewProduct}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-4",
                    "bg-primary text-white rounded-full",
                    "text-[13px] font-medium",
                    "hover:bg-primary/90 active:scale-[0.97]",
                    "transition-all duration-150"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {t("actions.new")}
                </button>
              </>
            )}
          </div>

          {/* Search Bar - only in select mode */}
          {viewMode === "select" && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#999999]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("product.search")}
                  className={cn(
                    "w-full h-11 pl-11 pr-4",
                    "text-[15px] text-[#111111] placeholder:text-[#999999]",
                    "bg-[#F5F5F7] rounded-xl",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "transition-all duration-150"
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-white">
          {/* EDIT MODE: Show editable form */}
          {viewMode === "edit" && assignedProductId && (
            <div className="h-full overflow-y-auto overscroll-contain">
              <div className="px-4 py-4 space-y-4 pb-32">
                {/* Thumbnail + Image URL */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#F5F5F5] overflow-hidden border border-[#E5E5E5]">
                    {editFormData.thumbnail ? (
                      <img 
                        src={editFormData.thumbnail} 
                        alt="Product" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[#CCCCCC]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                      {t("product.field.image")}
                    </label>
                    <Input
                      value={editFormData.thumbnail}
                      onChange={(e) => setEditFormData({...editFormData, thumbnail: e.target.value})}
                      placeholder="https://…"
                      className="h-10 text-[14px] bg-white border-[#E0E0E0] text-[#111111]"
                    />
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.name")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    placeholder={t("product.field.namePlaceholder")}
                    className="h-11 text-[15px] bg-white border-[#E0E0E0] text-[#111111]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.description")}
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    placeholder={t("product.field.descriptionHint")}
                    rows={2}
                    className="w-full px-3 py-2.5 text-[14px] text-[#111111] rounded-lg border border-[#E0E0E0] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Price + Currency */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.price")}
                  </label>
                  <div className="flex gap-2">
                    {/* Currency selector */}
                    <div className="relative">
                      <select
                        value={editFormData.currency}
                        onChange={(e) => setEditFormData({...editFormData, currency: e.target.value as CurrencyCode})}
                        className="h-11 pl-2.5 pr-7 text-[14px] bg-white border border-[#E0E0E0] text-[#111111] rounded-lg appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
                      >
                        {SUPPORTED_CURRENCIES.map((code) => (
                          <option key={code} value={code}>
                            {CURRENCY_SYMBOLS[code]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888888] pointer-events-none" />
                    </div>
                    <Input
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      placeholder={t("product.field.pricePlaceholder")}
                      className="flex-1 h-11 text-[15px] bg-white border-[#E0E0E0] text-[#111111]"
                    />
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.promo")}
                  </label>
                  <Input
                    value={editFormData.promoCode}
                    onChange={(e) => setEditFormData({...editFormData, promoCode: e.target.value})}
                    placeholder={t("product.field.promoPlaceholder")}
                    className="h-11 text-[15px] bg-white border-[#E0E0E0] text-[#111111]"
                  />
                </div>

                {/* Product URL */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.url")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editFormData.link}
                    onChange={(e) => setEditFormData({...editFormData, link: e.target.value})}
                    placeholder="https://…"
                    className="h-11 text-[15px] bg-white border-[#E0E0E0] text-[#111111]"
                  />
                </div>

                {/* CTA Label */}
                <div>
                  <label className="text-[12px] font-medium text-[#666666] mb-1.5 block">
                    {t("product.field.cta")}
                  </label>
                  <Input
                    value={editFormData.ctaLabel}
                    onChange={(e) => setEditFormData({...editFormData, ctaLabel: e.target.value})}
                    placeholder={t("product.field.ctaPlaceholder")}
                    className="h-11 text-[15px] bg-white border-[#E0E0E0] text-[#111111]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SELECT MODE: Product list or empty states */}
          {viewMode === "select" && (
            <>
              {/* Empty State: No products exist */}
              {!hasProducts && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                    <Package className="w-7 h-7 text-[#AAAAAA]" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#111111] mb-2">
                    {t("product.empty")}
                  </h3>
                  <p className="text-[14px] text-[#666666] mb-6 max-w-[260px]">
                    {t("product.emptyHint")}
                  </p>
                  <button
                    onClick={handleOpenNewProduct}
                    className={cn(
                      "flex items-center gap-1.5 h-11 px-5",
                      "bg-primary text-white rounded-full",
                      "text-[15px] font-medium",
                      "hover:bg-primary/90 active:scale-[0.97]",
                      "transition-all duration-150"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    {t("product.create")}
                  </button>
                </div>
              )}

              {/* Empty State: No search results */}
              {hasProducts && !hasSearchResults && searchQuery && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-[#AAAAAA]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#111111] mb-1">
                    {t("product.noResults")}
                  </h3>
                  <p className="text-[14px] text-[#666666] max-w-[240px]">
                    {t("product.noResultsHint")}
                  </p>
                </div>
              )}

              {/* Product List */}
              {hasProducts && (hasSearchResults || !searchQuery) && (
                <ScrollArea className="h-full bg-white">
                  <div className="px-4 pb-safe-plus flex flex-col gap-3">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductId === product.id;
                      
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product.id)}
                          className={cn(
                            "w-full flex items-start gap-3.5 p-3 rounded-xl",
                            "text-left bg-white",
                            "border border-[#E5E5E5]",
                            "hover:bg-[#FAFAFA] active:bg-[#F5F5F5] active:scale-[0.99]",
                            "transition-all duration-100",
                            isSelected && "bg-[#F4F7FF] border-primary ring-1 ring-primary/30"
                          )}
                        >
                          {/* Thumbnail - 56x56px */}
                          <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#F5F5F5] overflow-hidden">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={cn(
                              "w-full h-full flex items-center justify-center",
                              product.thumbnail && "hidden"
                            )}>
                              <ImageIcon className="w-5 h-5 text-[#CCCCCC]" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 py-0.5">
                            <p className="text-[15px] font-medium text-[#111111] line-clamp-2 leading-snug">
                              {product.title}
                            </p>
                            {product.description && (
                              <p className="text-[13px] text-[#666666] line-clamp-2 mt-1 leading-snug">
                                {product.description}
                              </p>
                            )}
                            {product.price && (
                              <p className="text-[14px] font-semibold text-[#111111] mt-1.5">
                                {product.price}
                              </p>
                            )}
                          </div>

                          {/* Selection checkmark */}
                          {isSelected && (
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer - only in edit mode */}
        {viewMode === "edit" && (
          <div className="sticky bottom-0 border-t border-[#EBEBEB] p-4 pb-safe-plus bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRemoveProduct}
                className="text-[14px] font-medium text-red-500 hover:text-red-600 px-3 py-2 transition-colors"
              >
                {t("product.removed").split(" ")[0]}
              </button>
              <Button
                onClick={handleSaveEdit}
                disabled={!canSave}
                className="flex-1 h-11 text-[15px] font-medium"
              >
                {t("actions.saveChanges")}
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default SelectProductSheet;
