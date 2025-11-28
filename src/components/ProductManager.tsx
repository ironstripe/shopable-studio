import { useState } from "react";
import { Product } from "@/types/video";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Package, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ProductManagerProps {
  products: Record<string, Product>;
  onUpdateProducts: (products: Record<string, Product>) => void;
}

const ProductManager = ({ products, onUpdateProducts }: ProductManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    link: "",
  });

  const handleAddProduct = () => {
    if (!formData.title.trim()) {
      toast.error("Product title is required");
      return;
    }

    const newId = `product-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      title: formData.title.trim(),
      price: formData.price.trim() || "0.–",
      link: formData.link.trim() || "#",
    };

    onUpdateProducts({
      ...products,
      [newId]: newProduct,
    });

    setFormData({ title: "", price: "", link: "" });
    toast.success("Product added successfully");
  };

  const handleUpdateProduct = () => {
    if (!editingId || !formData.title.trim()) {
      toast.error("Product title is required");
      return;
    }

    const updatedProduct: Product = {
      id: editingId,
      title: formData.title.trim(),
      price: formData.price.trim() || "0.–",
      link: formData.link.trim() || "#",
    };

    onUpdateProducts({
      ...products,
      [editingId]: updatedProduct,
    });

    setEditingId(null);
    setFormData({ title: "", price: "", link: "" });
    toast.success("Product updated successfully");
  };

  const handleDeleteProduct = (productId: string) => {
    const { [productId]: _, ...remainingProducts } = products;
    onUpdateProducts(remainingProducts);
    toast.success("Product deleted");
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price,
      link: product.link,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", price: "", link: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="link" 
          className="h-auto p-0 text-primary hover:text-primary/80 text-sm font-normal justify-start"
        >
          Manage Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="p-4 bg-secondary/50">
            <h3 className="text-sm font-semibold mb-3">
              {editingId ? "Edit Product" : "Add New Product"}
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Product Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Bose QuietComfort Ultra"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="e.g., 349.–"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="link">Product Link</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://example.com/product"
                  type="url"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-2">
                {editingId ? (
                  <>
                    <Button onClick={handleUpdateProduct} className="flex-1">
                      Update Product
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddProduct} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Products List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Existing Products</h3>
            {Object.values(products).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No products yet. Add your first product above.
              </p>
            ) : (
              Object.values(products).map((product) => (
                <Card
                  key={product.id}
                  className="p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.price}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.link}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(product)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductManager;
