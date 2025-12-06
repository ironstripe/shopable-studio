import { useEffect, useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import { Product, CardStyle, HotspotStyle } from "@/types/video";
import { X, ArrowRight, ExternalLink } from "lucide-react";
import { useSmartPosition } from "@/hooks/use-smart-position";

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
  cardStyle = "ecommerce-light-card",
  hotspotPosition,
  containerRef,
}: ProductCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardDimensions, setCardDimensions] = useState({ width: 320, height: 200 });

  // Determine card family from style
  const getCardFamily = (style: CardStyle): "ecommerce" | "luxury" | "seasonal" => {
    if (style.startsWith("luxury")) return "luxury";
    if (style.startsWith("seasonal")) return "seasonal";
    return "ecommerce";
  };

  const family = getCardFamily(cardStyle);
  const isLuxuryFamily = family === "luxury";

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

  // E-Commerce Light Card
  const renderEcommerceCard = () => (
    <div className="p-5 pt-4">
      <div className="flex gap-3 mb-3">
        {product.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground leading-tight mb-1">
            {product.title}
          </h3>
          <span className="text-[16px] font-bold text-primary">
            {product.price}
          </span>
          {product.description && (
            <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>
      {showShopButton && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-[10px] hover:brightness-110 transition-all duration-150 font-medium text-[14px] text-center"
        >
          {product.ctaLabel || "View Product"}
        </a>
      )}
    </div>
  );

  // Luxury Fine Line Card
  const renderLuxuryCard = () => (
    <div className="p-6 space-y-4">
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-[120px] object-cover rounded-lg"
        />
      )}
      <div className="space-y-2">
        <h3 className="font-light text-[16px] tracking-wide text-white">
          {product.title}
        </h3>
        {product.price && (
          <div className="text-[14px] font-light text-white/80">
            {product.price}
          </div>
        )}
        {product.description && (
          <p className="text-[12px] font-light text-white/60 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
      <div className="w-full h-[0.5px] bg-white/30" />
      {showShopButton && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-light text-white/90 hover:text-white underline-offset-4 hover:underline transition-all duration-180"
        >
          View details <ArrowRight className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );

  // Seasonal Standard Card
  const renderSeasonalCard = () => (
    <div className="p-5 pt-4">
      {/* Accent strip */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-lg text-white font-medium text-[11px] tracking-wide text-center mb-3">
        Special Offer
      </div>
      <div className="flex gap-3 mb-3">
        {product.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground leading-tight mb-1">
            {product.title}
          </h3>
          <span className="text-[16px] font-bold text-primary">
            {product.price}
          </span>
        </div>
      </div>
      {showShopButton && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-[10px] hover:brightness-110 transition-all duration-150 font-medium text-[14px] text-center"
        >
          {product.ctaLabel || "Get the Deal"}
        </a>
      )}
    </div>
  );

  // Render card content based on family
  const renderCardContent = () => {
    switch (family) {
      case "luxury":
        return renderLuxuryCard();
      case "seasonal":
        return renderSeasonalCard();
      default:
        return renderEcommerceCard();
    }
  };

  const cardElement = (
    <div
      ref={cardRef}
      className={
        isLuxuryFamily
          ? "fixed z-[9999] w-[320px] max-w-[320px] bg-[rgba(26,26,26,0.95)] backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.24)] animate-card-enter"
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
            ? "absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            : "absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors"
        }
        aria-label="Close"
      >
        <X className={
          isLuxuryFamily 
            ? "w-3 h-3 text-white" 
            : "w-3.5 h-3.5 text-foreground"
        } />
      </button>

      {/* Card Content */}
      {renderCardContent()}
    </div>
  );

  return createPortal(cardElement, document.body);
};

export default ProductCard;
