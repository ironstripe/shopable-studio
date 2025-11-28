import { Product } from "@/types/video";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClose: () => void;
}

const ProductCard = ({ product, onClose }: ProductCardProps) => {
  return (
    <Card className="fixed bottom-8 right-8 w-80 bg-shopable-black/80 backdrop-blur-sm border-border p-6 shadow-2xl z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-foreground hover:text-primary transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">{product.title}</h3>
      <p className="text-2xl font-bold text-primary mb-4">{product.price}</p>
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        View Product
      </a>
    </Card>
  );
};

export default ProductCard;
