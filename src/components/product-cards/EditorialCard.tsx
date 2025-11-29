import { Product, EditorialCardVariant } from "@/types/video";
import { ArrowRight } from "lucide-react";

interface EditorialCardProps {
  product: Product;
  variant: EditorialCardVariant;
  showShopButton?: boolean;
}

const EditorialCard = ({ product, variant, showShopButton = true }: EditorialCardProps) => {
  const renderArticle = () => (
    <div className="p-6 space-y-4">
      {/* Top hairline rule */}
      <div className="w-full h-[0.5px] bg-white/70" />

      {/* Serif headline */}
      <h3 className="font-playfair text-[17px] font-normal tracking-wide text-white leading-tight">
        {product.title}
      </h3>

      {/* Description */}
      {product.description && (
        <p className="font-spectral text-[13px] font-light text-white/80 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Price */}
      {product.price && (
        <div className="font-spectral text-[14px] font-light text-white/90">
          {product.price}
        </div>
      )}

      {/* Bottom hairline rule */}
      <div className="w-full h-[0.5px] bg-white/70" />

      {/* Text link CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-spectral text-[12px] font-light text-white/90 hover:text-white transition-all duration-220"
        >
          View Article <ArrowRight className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );

  const renderCaption = () => (
    <div className="space-y-3">
      {/* Image on top */}
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-[140px] object-cover rounded-t-lg"
        />
      )}

      {/* Caption beneath */}
      <div className="px-4 pb-4 space-y-2">
        <h3 className="font-spectral text-[15px] font-normal text-white leading-tight">
          {product.title}
        </h3>

        {/* Price and CTA on same line */}
        <div className="flex items-center gap-2 text-[12px] font-spectral font-light text-white/80">
          {product.price && (
            <>
              <span>{product.price}</span>
              <span className="text-white/50">·</span>
            </>
          )}
          {showShopButton && product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-all duration-220"
            >
              View <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuote = () => (
    <div className="p-6 space-y-4">
      {/* Opening quote mark */}
      <div className="font-playfair text-[40px] font-light text-white/40 leading-none">
        "
      </div>

      {/* Title styled as quote */}
      <h3 className="font-playfair text-[16px] font-light text-white leading-relaxed -mt-6 pl-6">
        {product.title}
      </h3>

      {/* Description */}
      {product.description && (
        <p className="font-spectral text-[13px] font-light text-white/70 leading-relaxed pl-6">
          {product.description}
        </p>
      )}

      {/* Closing quote mark aligned right */}
      <div className="font-playfair text-[40px] font-light text-white/40 leading-none text-right -mb-4">
        "
      </div>

      {/* Price bottom right */}
      {product.price && (
        <div className="font-spectral text-[14px] font-light text-white/90 text-right">
          {product.price}
        </div>
      )}

      {/* CTA */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-spectral text-[12px] font-light text-white/90 hover:text-white transition-all duration-220 float-right"
        >
          View Product
        </a>
      )}
    </div>
  );

  const renderMinimalInfo = () => (
    <div className="p-6 space-y-4">
      {/* Title left, price right on same line */}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-playfair text-[16px] font-light text-white tracking-wide flex-1">
          {product.title}
        </h3>
        {product.price && (
          <span className="font-spectral text-[16px] font-light text-white/80 whitespace-nowrap">
            {product.price}
          </span>
        )}
      </div>

      {/* Description if available */}
      {product.description && (
        <p className="font-spectral text-[12px] font-light text-white/70 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Micro CTA, far right */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-spectral text-[11px] font-light text-white/90 hover:text-white transition-all duration-220 float-right"
        >
          View <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "editorial-article":
      return renderArticle();
    case "editorial-caption":
      return renderCaption();
    case "editorial-quote":
      return renderQuote();
    case "editorial-minimal-info":
      return renderMinimalInfo();
    default:
      return renderArticle();
  }
};

export default EditorialCard;
