import { useEffect, useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { Product, CardStyle } from "@/types/video";
import { X } from "lucide-react";
import { useSmartPosition } from "@/hooks/use-smart-position";
import RetailCard from "./product-cards/RetailCard";
import LuxuryCard from "./product-cards/LuxuryCard";
import FineLineCard from "./product-cards/FineLineCard";
import ECommerceCard from "./product-cards/ECommerceCard";
import EditorialCard from "./product-cards/EditorialCard";

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
  const getCardFamily = (style: CardStyle): "retail" | "luxury" | "editorial" | "fineline" | "ecommerce" => {
    if (style.startsWith("retail-")) return "retail";
    if (style.startsWith("luxury-")) return "luxury";
    if (style.startsWith("editorial-")) return "editorial";
    if (style.startsWith("fineline-")) return "fineline";
    if (style.startsWith("ecommerce-")) return "ecommerce";
    return "retail"; // fallback
  };

  const family = getCardFamily(cardStyle);
  const isLuxuryFamily = family === "luxury";
  const isFineLineFamily = family === "fineline";
  const isEditorialFamily = family === "editorial";

  // Smart positioning - luxury cards get more margin
  const position = useSmartPosition({
    hotspotX: hotspotPosition?.x || 0.5,
    hotspotY: hotspotPosition?.y || 0.5,
    cardWidth: cardDimensions.width,
    cardHeight: cardDimensions.height,
    containerRef: containerRef || { current: null },
    margin: isLuxuryFamily ? 18 : 12,
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
        return (
          <LuxuryCard
            product={product}
            variant={cardStyle as any}
            showShopButton={showShopButton}
          />
        );
      case "fineline":
        return (
          <FineLineCard
            product={product}
            variant={cardStyle as any}
            showShopButton={showShopButton}
          />
        );
      case "ecommerce":
        return (
          <ECommerceCard
            product={product}
            variant={cardStyle as any}
            showShopButton={showShopButton}
          />
        );
      case "editorial":
        return (
          <EditorialCard
            product={product}
            variant={cardStyle as any}
            showShopButton={showShopButton}
          />
        );
      default:
        return (
          <RetailCard
            product={product}
            variant="retail-compact"
            showShopButton={showShopButton}
          />
        );
    }
  };

  const cardElement = (
    <div
      ref={cardRef}
      className={
        isLuxuryFamily
          ? "fixed z-[9999] w-[340px] max-w-[340px] bg-white/[0.94] backdrop-blur-md rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] animate-luxury-card-enter"
          : isFineLineFamily || isEditorialFamily
          ? "fixed z-[9999] w-[320px] max-w-[320px] bg-[rgba(26,26,26,0.95)] backdrop-blur-sm border border-white/10 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.24)] animate-card-enter"
          : "fixed z-[9999] w-[320px] max-w-[320px] bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] animate-card-enter"
      }
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
        className={
          isLuxuryFamily
            ? "absolute top-3 right-3 w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
            : isFineLineFamily || isEditorialFamily
            ? "absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            : "absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors"
        }
        aria-label="Close"
      >
        <X className={
          isLuxuryFamily 
            ? "w-3 h-3 text-[#1a1a1a]" 
            : isFineLineFamily || isEditorialFamily
            ? "w-3 h-3 text-white"
            : "w-3.5 h-3.5 text-foreground"
        } />
      </button>

      {/* Card Content */}
      <div className={isLuxuryFamily || isFineLineFamily || isEditorialFamily ? "" : "p-5 pt-4"}>
        {renderCardContent()}
      </div>
    </div>
  );

  return createPortal(cardElement, document.body);
};

export default ProductCard;
