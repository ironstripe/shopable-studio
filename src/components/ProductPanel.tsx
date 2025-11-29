import { useState } from "react";
import { Product } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPanelProps {
  products: Record<string, Product>;
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onCreateProduct: (product: Omit<Product, "id">) => void;
  onClose: () => void;
}

type ViewMode = "list" | "edit" | "create";

const ProductPanel = ({
  products,
  selectedProductId,
  onSelectProduct,
  onUpdateProduct,
  onCreateProduct,
  onClose,
}: ProductPanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] = useState({
    title: "",
    description: "",
    price: "",
    link: "",
    ctaLabel: "Kaufen",
    thumbnail: "",
  });

  const productList = Object.values(products);
  const filteredProducts = productList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (productId: string) => {
    onSelectProduct(productId);
    onClose();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setViewMode("edit");
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setViewMode("list");
      setEditingProduct(null);
    }
  };

  const handleCreateNew = () => {
    if (!creatingProduct.title || !creatingProduct.link) return;
    
    onCreateProduct(creatingProduct);
    setCreatingProduct({
      title: "",
      description: "",
      price: "",
      link: "",
      ctaLabel: "Kaufen",
      thumbnail: "",
    });
    setViewMode("list");
    onClose();
  };

  // Empty State
  if (productList.length === 0) {
    return (
      <div className="w-[340px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <p className="text-[13px] text-[#6B7280] mb-4">No products yet.</p>
          <Button
            onClick={() => setViewMode("create")}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] h-9 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Neues Produkt erstellen
          </Button>
        </div>
      </div>
    );
  }

  // Create Mode
  if (viewMode === "create" || (viewMode === "list" && productList.length === 0)) {
    return (
      <div className="w-[340px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
          Neues Produkt
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Name *</Label>
            <Input
              value={creatingProduct.title}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, title: e.target.value })}
              placeholder="Product name"
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Description</Label>
            <textarea
              value={creatingProduct.description}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, description: e.target.value })}
              placeholder="Short product description..."
              className="w-full h-16 px-3 py-2 text-[13px] rounded-md border border-input bg-background resize-none"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Product URL *</Label>
            <Input
              value={creatingProduct.link}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, link: e.target.value })}
              placeholder="https://..."
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">CTA Label</Label>
            <Input
              value={creatingProduct.ctaLabel}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, ctaLabel: e.target.value })}
              placeholder="Kaufen"
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Price</Label>
            <Input
              value={creatingProduct.price}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, price: e.target.value })}
              placeholder="€99.–"
              className="h-9 text-[13px]"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-[rgba(0,0,0,0.06)]">
          <Button
            onClick={() => {
              setViewMode("list");
              setCreatingProduct({
                title: "",
                description: "",
                price: "",
                link: "",
                ctaLabel: "Kaufen",
                thumbnail: "",
              });
            }}
            variant="outline"
            className="flex-1 h-9 text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateNew}
            disabled={!creatingProduct.title || !creatingProduct.link}
            className="flex-1 h-9 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Produkt speichern
          </Button>
        </div>
      </div>
    );
  }

  // Edit Mode
  if (viewMode === "edit" && editingProduct) {
    return (
      <div className="w-[340px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
          Edit Product
        </h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Name</Label>
            <Input
              value={editingProduct.title}
              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Description</Label>
            <textarea
              value={editingProduct.description || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              placeholder="Short product description..."
              className="w-full h-16 px-3 py-2 text-[13px] rounded-md border border-input bg-background resize-none"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Product URL</Label>
            <Input
              value={editingProduct.link}
              onChange={(e) => setEditingProduct({ ...editingProduct, link: e.target.value })}
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">CTA Label</Label>
            <Input
              value={editingProduct.ctaLabel || "Kaufen"}
              onChange={(e) => setEditingProduct({ ...editingProduct, ctaLabel: e.target.value })}
              className="h-9 text-[13px]"
            />
          </div>
          
          <div>
            <Label className="text-[12px] text-[#6B7280] mb-1.5">Price</Label>
            <Input
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              className="h-9 text-[13px]"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-[rgba(0,0,0,0.06)]">
          <Button
            onClick={() => {
              setViewMode("list");
              setEditingProduct(null);
            }}
            variant="outline"
            className="flex-1 h-9 text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            className="flex-1 h-9 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save changes
          </Button>
        </div>
      </div>
    );
  }

  // List Mode (Default)
  return (
    <div className="w-[340px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-[#111827]">
          Select Product
        </h3>
        <Button
          onClick={() => setViewMode("create")}
          size="sm"
          className="h-7 px-2.5 text-[12px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="h-8 pl-8 text-[12px]"
        />
      </div>

      {/* Product List */}
      <ScrollArea className="h-[240px] -mx-1 px-1">
        <div className="space-y-1">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              className={cn(
                "group relative flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-all",
                "hover:bg-[rgba(59,130,246,0.08)]",
                selectedProductId === product.id && "bg-[rgba(59,130,246,0.12)] ring-1 ring-[#3B82F6]"
              )}
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-10 h-10 rounded bg-[rgba(0,0,0,0.04)] flex items-center justify-center overflow-hidden">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#9CA3AF]">No img</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-medium text-[#111827] truncate">
                    {product.title}
                  </h4>
                  {selectedProductId === product.id && (
                    <Check className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                  )}
                </div>
                {product.description && (
                  <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                    {product.description}
                  </p>
                )}
                {product.price && (
                  <p className="text-[12px] font-medium text-[#111827] mt-1">
                    {product.price}
                  </p>
                )}
              </div>

              {/* Edit button (appears on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProduct(product);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#6B7280] hover:text-[#3B82F6] px-1.5 py-0.5 rounded hover:bg-white"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductPanel;
