import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/video";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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
}

const SelectProductSheet = ({
  open,
  onOpenChange,
  products,
  selectedProductId,
  onSelectProduct,
  onOpenNewProduct,
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
      }, 100);
    }
  }, [open]);

  const productList = Object.values(products);
  const filteredProducts = productList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectProduct = (productId: string) => {
    onSelectProduct(productId);
    onOpenChange(false);
  };

  const hasProducts = productList.length > 0;
  const hasSearchResults = filteredProducts.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] min-h-[50vh] bg-white">
        {/* Header */}
        <DrawerHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-foreground">
              Select product
            </DrawerTitle>
            <Button
              onClick={onOpenNewProduct}
              size="sm"
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-medium rounded-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          {/* Search Bar */}
          {hasProducts && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full h-10 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground bg-muted/50 border border-border/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          )}
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Empty State: No products exist */}
          {!hasProducts && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">
                No products yet
              </h3>
              <p className="text-[14px] text-muted-foreground mb-6 max-w-[260px]">
                Tap '+ New' to create your first product.
              </p>
              <Button
                onClick={onOpenNewProduct}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create product
              </Button>
            </div>
          )}

          {/* Empty State: No search results */}
          {hasProducts && !hasSearchResults && searchQuery && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-[15px] font-medium text-foreground mb-1">
                No products found
              </h3>
              <p className="text-[13px] text-muted-foreground max-w-[240px]">
                Try a different term or create a new product.
              </p>
            </div>
          )}

          {/* Product List */}
          {hasProducts && hasSearchResults && (
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="px-4 py-2">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductId === product.id;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        "hover:bg-muted/60 active:scale-[0.98]",
                        isSelected && "bg-primary/8 ring-1 ring-primary/20"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted overflow-hidden">
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
                            <Package className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-foreground truncate">
                          {product.title}
                        </p>
                        {product.description && (
                          <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Right side: Price or checkmark */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {product.price && (
                          <span className="text-[13px] font-medium text-foreground">
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
