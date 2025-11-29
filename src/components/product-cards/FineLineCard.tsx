import { Product, FineLineCardVariant } from "@/types/video";
import { ArrowRight } from "lucide-react";

interface FineLineCardProps {
  product: Product;
  variant: FineLineCardVariant;
  showShopButton?: boolean;
}

const FineLineCard = ({ product, variant, showShopButton = true }: FineLineCardProps) => {
  const renderUnderline = () => (
    <div className="flex flex-col items-center text-center space-y-4 p-6">
      {/* Product Name */}
      <h3 className="font-light text-[16px] tracking-wide text-white">
        {product.title}
      </h3>
      
      {/* Thin underline matching text width */}
      <div className="w-20 h-[0.5px] bg-white/70" />

      {/* Price */}
      {product.price && (
        <div className="text-[13px] font-light text-white/80">
          {product.price}
        </div>
      )}

      {/* Text-only CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-light text-white/90 hover:text-white underline-offset-4 hover:underline transition-all duration-180"
        >
          {product.ctaLabel || "View Product"}
        </a>
      )}
    </div>
  );

  const renderBaseline = () => (
    <div className="flex flex-col space-y-4 p-6">
      {/* Title and price on same baseline */}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-light text-[15px] tracking-wide text-white flex-1">
          {product.title}
        </h3>
        {product.price && (
          <span className="text-[15px] font-light text-white/80 whitespace-nowrap">
            {product.price}
          </span>
        )}
      </div>

      {/* Description if available */}
      {product.description && (
        <p className="text-[12px] font-light text-white/70 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Minimal text-link CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-light text-white/90 hover:text-white transition-all duration-180 self-end"
        >
          View <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  const renderSubtleCaption = () => (
    <div className="flex flex-col items-center text-center space-y-4 p-6">
      {/* Product name in small caps */}
      <h3 className="text-[11px] font-light tracking-[0.15em] uppercase text-white">
        {product.title}
      </h3>

      {/* Dotted underline to price */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-b border-dotted border-white/40 h-[1px]" />
        {product.price && (
          <span className="text-[13px] font-light text-white/80 whitespace-nowrap">
            {product.price}
          </span>
        )}
        <div className="flex-1 border-b border-dotted border-white/40 h-[1px]" />
      </div>

      {/* Text-only CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-light text-white/90 hover:text-white transition-all duration-180"
        >
          {product.ctaLabel || "View Product"}
        </a>
      )}
    </div>
  );

  const renderMicroLine = () => (
    <div className="flex items-start gap-3 p-5">
      {/* Small thumbnail */}
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0 space-y-2">
        <h3 className="text-[14px] font-light tracking-wide text-white">
          {product.title}
        </h3>

        {product.price && (
          <div className="text-[12px] font-light text-white/80">
            {product.price}
          </div>
        )}

        {showShopButton && product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-light text-white/90 hover:text-white transition-all duration-180"
          >
            View <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "fineline-text-underline":
      return renderUnderline();
    case "fineline-text-baseline":
      return renderBaseline();
    case "fineline-subtle-caption":
      return renderSubtleCaption();
    case "fineline-micro-line":
      return renderMicroLine();
    default:
      return renderUnderline();
  }
};

export default FineLineCard;
