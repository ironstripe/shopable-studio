import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/video";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, Package } from "lucide-react";
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
      <DrawerContent className="max-h-[85vh] min-h-[50vh] bg-white flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white pt-2 pb-0">
          {/* Drag Handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>

          {/* FTUX Hint Banner */}
          {showFTUXHint && (
            <div className="mx-4 mb-3 px-4 py-2.5 bg-primary/10 rounded-xl">
              <p className="text-[13px] text-primary font-medium text-center">
                Choose a product or create a new one.
              </p>
            </div>
          )}

          {/* Title Area with New Button */}
          <div className="relative px-4 mb-3">
            {/* Centered Title & Subtitle */}
            <div className="text-center pr-16">
              <h2 className="text-[17px] font-medium text-foreground">
                Select a Product
              </h2>
              <p className="text-[14px] text-muted-foreground mt-0.5">
                Choose one or create a new product
              </p>
            </div>

            {/* + New Button - Absolute Right */}
            <button
              onClick={handleOpenNewProduct}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                "flex items-center gap-1 h-8 px-3",
                "bg-primary/10 text-primary rounded-full",
                "text-[13px] font-medium",
                "hover:bg-primary/15 active:scale-[0.97]",
                "transition-all duration-150"
              )}
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E7EB] mx-4" />

          {/* Search Bar - Always visible */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className={cn(
                  "w-full h-12 pl-11 pr-4",
                  "text-[16px] text-foreground placeholder:text-neutral-400",
                  "bg-white border border-[#E5E7EB] rounded-[14px]",
                  "shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                  "transition-all duration-150"
                )}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Empty State: No products exist */}
          {!hasProducts && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">
                No products yet
              </h3>
              <p className="text-[14px] text-muted-foreground mb-6 max-w-[260px]">
                Tap '+ New' to create your first product.
              </p>
              <button
                onClick={handleOpenNewProduct}
                className={cn(
                  "flex items-center gap-1.5 h-11 px-5",
                  "bg-primary text-primary-foreground rounded-full",
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
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-[16px] font-medium text-foreground mb-1">
                No products found
              </h3>
              <p className="text-[14px] text-muted-foreground max-w-[240px]">
                Try a different term or create a new product.
              </p>
            </div>
          )}

          {/* Product List */}
          {hasProducts && (hasSearchResults || !searchQuery) && (
            <ScrollArea className="h-full">
              <div className="px-4 pb-6 flex flex-col gap-3.5">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductId === product.id;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 p-3.5 rounded-2xl",
                        "min-h-[64px] text-left",
                        "bg-white border border-[#E5E7EB]",
                        "hover:bg-neutral-50 active:bg-neutral-100 active:scale-[0.98]",
                        "transition-all duration-100",
                        isSelected && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-neutral-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-medium text-foreground line-clamp-2 leading-snug">
                          {product.title}
                        </p>
                        {product.description && (
                          <p className="text-[14px] text-muted-foreground truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Right side: Price and/or checkmark */}
                      <div className="flex-shrink-0 flex items-center gap-2.5">
                        {product.price && (
                          <span className="text-[15px] font-medium text-foreground">
                            {product.price}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
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
