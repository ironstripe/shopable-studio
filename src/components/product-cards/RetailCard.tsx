import { Product, RetailCardVariant } from "@/types/video";
import { cn } from "@/lib/utils";

interface RetailCardProps {
  product: Product;
  variant: RetailCardVariant;
  showShopButton: boolean;
}

const RetailCard = ({ product, variant, showShopButton }: RetailCardProps) => {
  const renderCompact = () => (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[15px] font-semibold text-foreground leading-tight">
          {product.title}
        </h3>
        <span className="text-[16px] font-bold text-primary whitespace-nowrap">
          {product.price}
        </span>
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
    </>
  );

  const renderSplit = () => (
    <>
      <div className="mb-3">
        <h3 className="text-[16px] font-semibold text-foreground mb-1">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
      <div className="h-px bg-border mb-3" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[18px] font-bold text-primary">
          {product.price}
        </span>
        {showShopButton && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-[10px] hover:brightness-110 transition-all duration-150 font-medium text-[14px]"
          >
            {product.ctaLabel || "View Product"}
          </a>
        )}
      </div>
    </>
  );

  const renderMedia = () => (
    <div className={cn("flex gap-3", product.thumbnail ? "items-start" : "flex-col")}>
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-foreground mb-1 leading-tight">
          {product.title}
        </h3>
        <p className="text-[16px] font-bold text-primary mb-2">
          {product.price}
        </p>
        {showShopButton && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-[10px] hover:brightness-110 transition-all duration-150 font-medium text-[13px]"
          >
            {product.ctaLabel || "View Product"}
          </a>
        )}
      </div>
    </div>
  );

  const renderPriceFocus = () => (
    <div className="text-center">
      <p className="text-[13px] text-muted-foreground mb-2">
        {product.title}
      </p>
      <h3 className="text-[26px] font-bold text-primary mb-4">
        {product.price}
      </h3>
      {showShopButton && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-[10px] hover:brightness-110 transition-all duration-150 font-medium text-[14px]"
        >
          {product.ctaLabel || "View Product"}
        </a>
      )}
    </div>
  );

  switch (variant) {
    case "retail-compact":
      return renderCompact();
    case "retail-split":
      return renderSplit();
    case "retail-media":
      return renderMedia();
    case "retail-price-focus":
      return renderPriceFocus();
    default:
      return renderCompact();
  }
};

export default RetailCard;
