import { useEffect, useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { Product, CardStyle } from "@/types/video";
import { X } from "lucide-react";
import { useSmartPosition } from "@/hooks/use-smart-position";
import RetailCard from "./product-cards/RetailCard";

interface ProductCardProps {
  product: Product;
  onClose: () => void;
  showShopButton?: boolean;
  cardStyle?: CardStyle;
  hotspotPosition?: { x: number; y: number };
  containerRef?: RefObject<HTMLDivElement>;
}

const ProductCard = ({
  product,
  onClose,
  showShopButton = true,
  cardStyle = "retail-compact",
  hotspotPosition,
  containerRef,
}: ProductCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardDimensions, setCardDimensions] = useState({ width: 320, height: 200 });

  // Determine card family and variant
  const getCardFamily = (style: CardStyle): "retail" | "luxury" | "editorial" | "minimal" => {
    if (style.startsWith("retail-")) return "retail";
    if (style.startsWith("luxury-")) return "luxury";
    if (style.startsWith("editorial-")) return "editorial";
    return "minimal";
  };

  const family = getCardFamily(cardStyle);

  // Smart positioning
  const position = useSmartPosition({
    hotspotX: hotspotPosition?.x || 0.5,
    hotspotY: hotspotPosition?.y || 0.5,
    cardWidth: cardDimensions.width,
    cardHeight: cardDimensions.height,
    containerRef: containerRef || { current: null },
    margin: 12,
    isOpen,
  });

  // Measure card dimensions after render
  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      setCardDimensions({ width, height });
    }
  }, [cardStyle, product]);

  // Trigger open animation after mount
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Render card content based on family
  const renderCardContent = () => {
    switch (family) {
      case "retail":
        return (
          <RetailCard
            product={product}
            variant={cardStyle as any}
            showShopButton={showShopButton}
          />
        );
      case "luxury":
      case "editorial":
      case "minimal":
        // Placeholder for future families - fallback to retail compact
        return (
          <RetailCard
            product={product}
            variant="retail-compact"
            showShopButton={showShopButton}
          />
        );
      default:
        return null;
    }
  };

  const cardElement = (
    <div
      ref={cardRef}
      className="fixed z-[9999] w-[320px] max-w-[320px] bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] animate-card-enter"
      style={{
        top: position.top !== undefined ? `${position.top}px` : undefined,
        left: position.left !== undefined ? `${position.left}px` : undefined,
        bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
        right: position.right !== undefined ? `${position.right}px` : undefined,
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5 text-foreground" />
      </button>

      {/* Card Content */}
      <div className="p-5 pt-4">
        {renderCardContent()}
      </div>
    </div>
  );

  return createPortal(cardElement, document.body);
};

export default ProductCard;
