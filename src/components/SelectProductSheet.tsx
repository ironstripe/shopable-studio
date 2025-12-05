import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/video";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, Package, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Record<string, Product>;
  selectedProductId?: string | null;
  onSelectProduct: (productId: string) => void;
  onOpenNewProduct: () => void;
  showFTUXHint?: boolean;
  onFTUXHintDismiss?: () => void;
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
}: SelectProductSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search when opened
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      // Focus search input after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, [open]);

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

  const hasProducts = productList.length > 0;
  const hasSearchResults = filteredProducts.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] min-h-[50vh] bg-white flex flex-col rounded-t-[20px]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white pt-3 pb-0">
          {/* Drag Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-9 h-1 rounded-full bg-[#D0D0D0]" />
          </div>

          {/* FTUX Hint Banner */}
          {showFTUXHint && (
            <div className="mx-4 mb-3 px-4 py-2.5 bg-primary/10 rounded-xl">
              <p className="text-[13px] text-primary font-medium text-center">
                Choose a product or create a new one.
              </p>
            </div>
          )}

          {/* Header Row: Title left, + New button right */}
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-[17px] font-semibold text-[#111111]">
              Choose a product
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
              New
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#999999]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-white">
          {/* Empty State: No products exist */}
          {!hasProducts && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-[#AAAAAA]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#111111] mb-2">
                No products yet
              </h3>
              <p className="text-[14px] text-[#666666] mb-6 max-w-[260px]">
                Add your first product to link it to this hotspot.
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
                Create product
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
                No products found
              </h3>
              <p className="text-[14px] text-[#666666] max-w-[240px]">
                Try a different term or create a new product.
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectProductSheet;
