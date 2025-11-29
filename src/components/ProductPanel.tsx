import { useState, useEffect } from "react";
import { Product } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanelResize } from "@/hooks/use-panel-resize";
import { usePanelDrag } from "@/hooks/use-panel-drag";
import { ResizeEdges } from "@/components/ResizeEdges";

interface ProductPanelProps {
  products: Record<string, Product>;
  selectedProductId?: string;
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
    link: "",
    ctaLabel: "Kaufen",
    price: "",
    thumbnail: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const { width, height, rightEdgeProps, bottomEdgeProps, cornerProps } = usePanelResize({
    minWidth: 280,
    maxWidth: 500,
    minHeight: 250,
    maxHeight: 600,
    defaultWidth: 340,
    defaultHeight: 400,
  });

  const { offset, dragHandleProps } = usePanelDrag();

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewMode === "create" || viewMode === "edit") {
          setViewMode("list");
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, onClose]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setThumbnailPreview(result);
        setCreatingProduct({ ...creatingProduct, thumbnail: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNew = () => {
    if (!creatingProduct.title || !creatingProduct.link) return;
    
    onCreateProduct(creatingProduct);
    setCreatingProduct({
      title: "",
      description: "",
      link: "",
      ctaLabel: "Kaufen",
      price: "",
      thumbnail: "",
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setViewMode("list");
    onClose();
  };

  // Empty State
  if (productList.length === 0) {
    return (
      <div 
        className="relative bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col" 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Drag Handle */}
        <div 
          className="px-5 py-3"
          {...dragHandleProps}
        />
        
        {/* Content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-2 text-center">
          <div className="w-12 h-12 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <h4 className="text-[14px] font-medium text-[#111827] mb-1">No products yet</h4>
          <p className="text-[12px] text-[#6B7280]">
            Create your first product to connect it to this hotspot.
          </p>
        </div>
        
        {/* Footer - Also Drag Handle */}
        <div 
          className="px-5 py-4 border-t border-[rgba(0,0,0,0.06)]"
          {...dragHandleProps}
        >
          <Button
            onClick={() => setViewMode("create")}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] h-9 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create product
          </Button>
        </div>
        <ResizeEdges 
          rightEdgeProps={rightEdgeProps}
          bottomEdgeProps={bottomEdgeProps}
          cornerProps={cornerProps}
        />
      </div>
    );
  }

  // Create Mode
  if (viewMode === "create" || (viewMode === "list" && productList.length === 0)) {
    return (
      <div 
        className="relative bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col" 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center py-3 px-5 mb-2"
          {...dragHandleProps}
        >
          <h3 className="text-[14px] font-semibold text-[#111827]">
            Create product
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <div className="space-y-3">
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Product name *</Label>
              <Input
                value={creatingProduct.title}
                onChange={(e) => setCreatingProduct({ ...creatingProduct, title: e.target.value })}
                placeholder="Product name"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
            </div>
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Description</Label>
              <textarea
                value={creatingProduct.description}
                onChange={(e) => setCreatingProduct({ ...creatingProduct, description: e.target.value })}
                placeholder="Short description (optional)"
                className="w-full h-16 px-3 py-2 text-[13px] text-[#111827] rounded-md border border-[#E0E0E0] bg-white resize-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Product URL *</Label>
              <Input
                value={creatingProduct.link}
                onChange={(e) => setCreatingProduct({ ...creatingProduct, link: e.target.value })}
                placeholder="https://…"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
            </div>
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">CTA label</Label>
              <Input
                value={creatingProduct.ctaLabel}
                onChange={(e) => setCreatingProduct({ ...creatingProduct, ctaLabel: e.target.value })}
                placeholder="CTA label (e.g. 'Kaufen', 'Shop now', 'More info')"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
            </div>
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Price</Label>
              <Input
                value={creatingProduct.price}
                onChange={(e) => setCreatingProduct({ ...creatingProduct, price: e.target.value })}
                placeholder="e.g. 349.–"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
            </div>
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Thumbnail</Label>
              
              {/* Upload button */}
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-2 text-[12px] font-medium rounded-md border border-[#E0E0E0] bg-white hover:bg-gray-50 text-[#111827]"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload image
                </label>
                {(thumbnailPreview || creatingProduct.thumbnail) && (
                  <img 
                    src={thumbnailPreview || creatingProduct.thumbnail} 
                    className="w-10 h-10 rounded object-cover border border-[#E0E0E0]" 
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              {/* Or divider */}
              <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] mb-2">
                <span>or</span>
              </div>
              
              {/* URL input */}
              <Input
                value={creatingProduct.thumbnail}
                onChange={(e) => {
                  setCreatingProduct({ ...creatingProduct, thumbnail: e.target.value });
                  setThumbnailPreview("");
                  setThumbnailFile(null);
                }}
                placeholder="https://example.com/image.jpg"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
            </div>
          </div>
        </div>

        <div 
          className="flex gap-2 p-5 pt-4 border-t border-[rgba(0,0,0,0.06)]"
          {...dragHandleProps}
        >
          <Button
            onClick={() => {
              setViewMode("list");
              setCreatingProduct({
                title: "",
                description: "",
                link: "",
                ctaLabel: "Kaufen",
                price: "",
                thumbnail: "",
              });
              setThumbnailFile(null);
              setThumbnailPreview("");
            }}
            onMouseDown={(e) => e.stopPropagation()}
            variant="outline"
            className="flex-1 h-9 text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateNew}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!creatingProduct.title || !creatingProduct.link}
            className="flex-1 h-9 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save product
          </Button>
        </div>
        <ResizeEdges 
          rightEdgeProps={rightEdgeProps}
          bottomEdgeProps={bottomEdgeProps}
          cornerProps={cornerProps}
        />
      </div>
    );
  }

  // Edit Mode
  if (viewMode === "edit" && editingProduct) {
    return (
      <div 
        className="relative bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col" 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center py-3 px-5 mb-2"
          {...dragHandleProps}
        >
          <h3 className="text-[14px] font-semibold text-[#111827]">
            Edit Product
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 pb-2">
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
            
            <div>
              <Label className="text-[12px] text-[#6B7280] mb-1.5">Thumbnail URL</Label>
              <Input
                value={editingProduct.thumbnail || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
              />
              {editingProduct.thumbnail && (
                <div className="mt-2">
                  <img 
                    src={editingProduct.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-16 h-16 rounded-md object-cover border border-[#E0E0E0]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className="flex gap-2 p-5 pt-4 border-t border-[rgba(0,0,0,0.06)]"
          {...dragHandleProps}
        >
          <Button
            onClick={() => {
              setViewMode("list");
              setEditingProduct(null);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            variant="outline"
            className="flex-1 h-9 text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 h-9 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save changes
          </Button>
        </div>
        <ResizeEdges 
          rightEdgeProps={rightEdgeProps}
          bottomEdgeProps={bottomEdgeProps}
          cornerProps={cornerProps}
        />
      </div>
    );
  }

  // List Mode (Default)
  return (
    <div 
      className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5 flex flex-col" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header - Drag Handle */}
      <div 
        className="flex items-center justify-between py-3 -mx-5 px-5 mb-3"
        {...dragHandleProps}
      >
        <h3 className="text-[15px] font-medium text-neutral-800">
          Select Product
        </h3>
        <button
          onClick={() => setViewMode("create")}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#3B82F6] bg-[rgba(59,130,246,0.06)] hover:bg-[rgba(59,130,246,0.12)] rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="h-10 pl-9 text-[14px] bg-[#F7F7F8] border border-neutral-200 rounded-xl shadow-sm placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-1 focus:ring-neutral-200"
        />
      </div>

      {/* Product List */}
      <ScrollArea className="h-[240px] -mx-1 px-1">
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              className={cn(
                "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-neutral-50",
                selectedProductId === product.id && "bg-blue-50 ring-1 ring-blue-200"
              )}
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
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
      
      {/* Footer - Drag Handle */}
      <div 
        className="h-3 -mx-5 px-5"
        {...dragHandleProps}
      />
      
      <ResizeEdges 
        rightEdgeProps={rightEdgeProps}
        bottomEdgeProps={bottomEdgeProps}
        cornerProps={cornerProps}
      />
    </div>
  );
};

export default ProductPanel;
