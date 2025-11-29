import { Product, ECommerceCardVariant } from "@/types/video";
import { ArrowRight } from "lucide-react";

interface ECommerceCardProps {
  product: Product;
  variant: ECommerceCardVariant;
  showShopButton?: boolean;
}

const ECommerceCard = ({ product, variant, showShopButton = true }: ECommerceCardProps) => {
  const renderGrid = () => (
    <>
      {/* Square thumbnail */}
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-[140px] object-cover rounded-t-lg"
        />
      )}

      {/* Content below */}
      <div className="p-4 space-y-3">
        <h3 className="text-[15px] font-medium text-foreground leading-tight">
          {product.title}
        </h3>

        {/* Bold orange price */}
        {product.price && (
          <div className="text-[18px] font-bold text-[#F97316]">
            {product.price}
          </div>
        )}

        {/* Full-width block CTA */}
        {showShopButton && product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-150 font-medium text-[14px] text-center"
          >
            {product.ctaLabel || "Buy Now"}
          </a>
        )}
      </div>
    </>
  );

  const renderBadge = () => (
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Price badge */}
        {product.price && (
          <div className="flex-shrink-0 bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg font-bold text-[14px] shadow-sm">
            {product.price}
          </div>
        )}

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-foreground mb-1">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Buy button */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-150 font-medium text-[13px]"
        >
          {product.ctaLabel || "Buy"}
        </a>
      )}
    </div>
  );

  const renderRetailPromo = () => (
    <>
      {/* Promo stripe */}
      <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 py-2 text-white font-bold text-[11px] tracking-wide text-center rounded-t-lg">
        SALE -20%
      </div>

      {/* Thumbnail */}
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-[120px] object-cover"
        />
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-[15px] font-medium text-foreground">
          {product.title}
        </h3>

        {/* Strikethrough + new price */}
        {product.price && (
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] text-muted-foreground line-through">
              ${(parseFloat(product.price.replace(/[^0-9.]/g, '')) * 1.25).toFixed(0)}
            </span>
            <span className="text-[18px] font-bold text-[#F97316]">
              {product.price}
            </span>
          </div>
        )}

        {/* CTA */}
        {showShopButton && product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-2.5 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-all duration-150 font-medium text-[14px] text-center"
          >
            Shop Now
          </a>
        )}
      </div>
    </>
  );

  const renderPriceTag = () => (
    <div className="p-6 space-y-4">
      {/* Tag-shaped price element */}
      <div className="relative">
        <div className="bg-[#3B82F6] text-white px-6 py-3 rounded-lg shadow-lg inline-block">
          {product.price && (
            <div className="text-[24px] font-bold">
              {product.price}
            </div>
          )}
        </div>
        {/* Tag notch effect */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[8px] border-t-transparent border-b-transparent border-l-[#3B82F6]" />
      </div>

      {/* Product name */}
      <h3 className="text-[14px] font-medium text-foreground">
        {product.title}
      </h3>

      {/* Arrow CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3B82F6] hover:text-[#2563EB] transition-all duration-150"
        >
          View Product <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "ecommerce-grid":
      return renderGrid();
    case "ecommerce-badge":
      return renderBadge();
    case "ecommerce-retail-promo":
      return renderRetailPromo();
    case "ecommerce-price-tag":
      return renderPriceTag();
    default:
      return renderGrid();
  }
};

export default ECommerceCard;
