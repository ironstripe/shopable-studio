// Top-level hotspot types
export type HotspotType = "icon-only" | "icon-cta-pill" | "badge-bubble" | "minimal-dot" | "luxury-line" | "ecommerce-line" | "editorial-line";

// Unified variants (same for all types)
export type HotspotVariant = "small" | "large" | "light" | "strong";

// Badge Bubble specific variants (style-based, not size-based)
export type BadgeBubbleVariant = "classic" | "outline" | "ghost" | "accent-split";

// Fine Line specific variants (style-based creative variants)
export type FineLineVariant = "pure-line" | "soft-glass" | "editorial-slim" | "micro-dot";

// Luxury Line specific variants
export type LuxuryLineVariant = "serif-whisper" | "gold-accent" | "glass-veil" | "dot-reveal";

// E-Commerce Line specific variants
export type ECommerceLineVariant = "price-tag-compact" | "product-label-extended" | "cta-pill-focus" | "ecom-meta-strip";

// Editorial Line specific variants
export type EditorialLineVariant = "headline-tag" | "vertical-label" | "caption-box" | "editorial-marker";

// Combined style (type + variant for storage)
export type HotspotStyle = 
  | "icon-only-small" | "icon-only-large" | "icon-only-light" | "icon-only-strong"
  | "icon-cta-pill-small" | "icon-cta-pill-large" | "icon-cta-pill-light" | "icon-cta-pill-strong"
  | "badge-bubble-classic" | "badge-bubble-outline" | "badge-bubble-ghost" | "badge-bubble-accent-split"
  | "minimal-dot-pure-line" | "minimal-dot-soft-glass" | "minimal-dot-editorial-slim" | "minimal-dot-micro-dot"
  | "luxury-line-serif-whisper" | "luxury-line-gold-accent" | "luxury-line-glass-veil" | "luxury-line-dot-reveal"
  | "ecommerce-line-price-tag-compact" | "ecommerce-line-product-label-extended" | "ecommerce-line-cta-pill-focus" | "ecommerce-line-ecom-meta-strip"
  | "editorial-line-headline-tag" | "editorial-line-vertical-label" | "editorial-line-caption-box" | "editorial-line-editorial-marker";

export type ClickBehavior = "show-card" | "direct-link" | "no-action";

export interface Hotspot {
  id: string;
  timeStart: number;
  timeEnd: number;
  x: number;
  y: number;
  productId: string | null; // Made nullable to support unassigned state
  style: HotspotStyle;
  ctaLabel: string;
  scale: number;
  clickBehavior: ClickBehavior;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  link: string;
  description?: string;
  thumbnail?: string;
  ctaLabel?: string;
}

export interface VideoProject {
  videoSrc: string;
  hotspots: Hotspot[];
  products: Record<string, Product>;
}
