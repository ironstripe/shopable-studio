import { Product, LuxuryCardVariant } from "@/types/video";
import { ExternalLink } from "lucide-react";

interface LuxuryCardProps {
  product: Product;
  variant: LuxuryCardVariant;
  showShopButton?: boolean;
}

const LuxuryCard = ({ product, variant, showShopButton = true }: LuxuryCardProps) => {
  const renderMinimal = () => (
    <div className="flex flex-col items-center text-center space-y-6 p-8">
      {/* Product Name */}
      <h3 className="font-playfair text-[18px] font-light tracking-wide text-[#1a1a1a]">
        {product.title}
      </h3>

      {/* Price */}
      {product.price && (
        <div className="font-spectral text-[14px] text-[#666] font-light">
          {product.price}
        </div>
      )}

      {/* CTA - Ghost pill */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(0,0,0,0.15)] bg-transparent text-[13px] font-light tracking-wide text-[#1a1a1a] transition-all duration-200 hover:bg-[rgba(0,0,0,0.03)] hover:border-[rgba(0,0,0,0.25)]"
        >
          View Product
        </a>
      )}
    </div>
  );

  const renderImageFocus = () => (
    <div className="flex flex-col space-y-4">
      {/* Hero Thumbnail - Always visible */}
      <div className="w-full px-4 pt-4">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-[160px] object-cover rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          />
        ) : (
          <div className="w-full h-[160px] rounded-[14px] bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] flex items-center justify-center">
            <div className="text-[#ccc] text-[11px] font-spectral tracking-wide">
              No image
            </div>
          </div>
        )}
      </div>

      {/* Content Below Image */}
      <div className="flex flex-col space-y-3 px-4 pb-4">
        {/* Product Name */}
        <h3 className="font-playfair text-[17px] font-light tracking-wide text-[#1a1a1a]">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="font-spectral text-[13px] text-[#666] font-light leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price */}
        {product.price && (
          <div className="font-spectral text-[14px] text-[#1a1a1a] font-light">
            {product.price}
          </div>
        )}

        {/* CTA - Thin outline button */}
        {showShopButton && product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(0,0,0,0.15)] bg-transparent text-[13px] font-light tracking-wide text-[#1a1a1a] transition-all duration-200 hover:bg-[rgba(0,0,0,0.03)] hover:border-[rgba(0,0,0,0.25)]"
          >
            View Product
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="flex gap-6 p-7">
      {/* Left Column */}
      <div className="flex-1 flex flex-col space-y-3">
        {/* Product Name */}
        <h3 className="font-playfair text-[17px] font-light tracking-wide text-[#1a1a1a]">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="font-spectral text-[12px] text-[#666] font-light leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Thin divider */}
        <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]" />
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-end justify-center space-y-3 min-w-[100px]">
        {/* Price - Large and elegant */}
        {product.price && (
          <div className="font-spectral text-[22px] text-[#1a1a1a] font-light">
            {product.price}
          </div>
        )}

        {/* CTA */}
        {showShopButton && product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[rgba(0,0,0,0.15)] bg-transparent text-[12px] font-light tracking-wide text-[#1a1a1a] transition-all duration-200 hover:bg-[rgba(0,0,0,0.03)] hover:border-[rgba(0,0,0,0.25)]"
          >
            View
          </a>
        )}
      </div>
    </div>
  );

  const renderPriceHighlight = () => (
    <div className="flex flex-col items-center text-center space-y-5 p-7">
      {/* Product Name - Small and minimal */}
      <h3 className="font-spectral text-[13px] font-light tracking-wide text-[#666]">
        {product.title}
      </h3>

      {/* Price - Dominant and centered with decorative rules */}
      {product.price && (
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-[rgba(0,0,0,0.2)]" />
          <div className="font-spectral text-[26px] text-[#1a1a1a] font-light tracking-wide">
            {product.price}
          </div>
          <div className="w-8 h-[1px] bg-[rgba(0,0,0,0.2)]" />
        </div>
      )}

      {/* CTA - Minimal text link */}
      {showShopButton && product.link && (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-spectral text-[12px] font-light tracking-wide text-[#1a1a1a] underline-offset-4 hover:underline transition-all duration-200"
        >
          View Product
        </a>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "luxury-minimal":
      return renderMinimal();
    case "luxury-image-focus":
      return renderImageFocus();
    case "luxury-split":
      return renderSplit();
    case "luxury-price-highlight":
      return renderPriceHighlight();
    default:
      return renderMinimal();
  }
};

export default LuxuryCard;
