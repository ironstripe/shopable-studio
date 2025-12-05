// Editor mode
export type EditorMode = "edit" | "preview";

// Safe zone configuration for social platforms
export interface SafeZone {
  id: string;
  name: string;
  right: number;  // Percentage from right edge (0-1)
  bottom: number; // Percentage from bottom edge (0-1)
}

// Predefined safe zone preset
export const VERTICAL_SOCIAL_SAFE_ZONE: SafeZone = {
  id: "vertical-social",
  name: "TikTok / Reels / Shorts",
  right: 0.15,  // 15% reserved for platform icons
  bottom: 0.18, // 18% reserved for captions/controls
};

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
export type ECommerceLineVariant = "compact-price-tag" | "label-strip" | "cta-pill-focus" | "product-card-lite";

// Editorial Line specific variants
export type EditorialLineVariant = "headline-tag" | "vertical-label" | "caption-frame" | "dash-marker";

// Combined style (type + variant for storage)
export type HotspotStyle = 
  | "icon-only-small" | "icon-only-large" | "icon-only-light" | "icon-only-strong"
  | "icon-cta-pill-small" | "icon-cta-pill-large" | "icon-cta-pill-light" | "icon-cta-pill-strong"
  | "badge-bubble-classic" | "badge-bubble-outline" | "badge-bubble-ghost" | "badge-bubble-accent-split"
  | "minimal-dot-pure-line" | "minimal-dot-soft-glass" | "minimal-dot-editorial-slim" | "minimal-dot-micro-dot"
  | "luxury-line-serif-whisper" | "luxury-line-gold-accent" | "luxury-line-glass-veil" | "luxury-line-dot-reveal"
  | "ecommerce-line-compact-price-tag" | "ecommerce-line-label-strip" | "ecommerce-line-cta-pill-focus" | "ecommerce-line-product-card-lite"
  | "editorial-line-headline-tag" | "editorial-line-vertical-label" | "editorial-line-caption-frame" | "editorial-line-dash-marker";

export type ClickBehavior = "show-card" | "direct-link" | "no-action";

// Video-level CTA (Global Video Link)
export type VideoCTAMode = "off" | "show-at-end" | "always-visible";

// CTA Type: Button vs Full-Video Link
export type VideoCTAType = "visible-button" | "full-video-link";

// CTA Button Style Families (12 variants)
export type VideoCTAStyle = 
  // eCommerce
  | "ecommerce-solid-white" 
  | "ecommerce-solid-dark" 
  | "ecommerce-pill-accent"
  // Luxury
  | "luxury-ghost" 
  | "luxury-underline" 
  | "luxury-corner-badge"
  // Editorial
  | "editorial-bottom-ribbon" 
  | "editorial-floating-label" 
  | "editorial-top-badge"
  // Minimal
  | "minimal-tiny-pill" 
  | "minimal-dot-label" 
  | "minimal-underline-text";

// Enhanced timing modes
export type VideoCTATimingMode = "entire-video" | "end-only" | "fade-in-at";

export interface VideoCTA {
  label: string;
  url: string;
  mode: VideoCTAMode; // Keep for backward compatibility
  enabled: boolean;
  type: VideoCTAType;
  style: VideoCTAStyle;
  timing: {
    mode: VideoCTATimingMode;
    fadeInAt?: number;
  };
  position?: { x: number; y: number }; // Position as percentage (0-1), default bottom-right
}

// Product Card Family System (Extensible Architecture)
export type CardFamily = "retail" | "luxury" | "editorial" | "fineline" | "ecommerce";

// Retail Card variants (E-Commerce focused, maps to badge-bubble hotspot family)
export type RetailCardVariant = "retail-compact" | "retail-split" | "retail-media" | "retail-price-focus";

// Fine Line Card variants (maps to minimal-dot hotspot family)
export type FineLineCardVariant = "fineline-text-underline" | "fineline-text-baseline" | "fineline-subtle-caption" | "fineline-micro-line";

// Luxury Card variants (maps to luxury-line hotspot family)
export type LuxuryCardVariant = "luxury-minimal" | "luxury-image-focus" | "luxury-split" | "luxury-price-highlight";

// E-Commerce Card variants (maps to ecommerce-line hotspot family)
export type ECommerceCardVariant = "ecommerce-grid" | "ecommerce-badge" | "ecommerce-price-tag" | "ecommerce-retail-promo";

// Editorial Card variants (maps to editorial-line hotspot family)
export type EditorialCardVariant = "editorial-article" | "editorial-caption" | "editorial-quote" | "editorial-minimal-info";

// Combined card style (family-variant)
export type CardStyle = RetailCardVariant | FineLineCardVariant | LuxuryCardVariant | ECommerceCardVariant | EditorialCardVariant;

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
  cardStyle?: CardStyle; // Optional, defaults based on hotspot family
}

export interface Product {
  id: string;
  title: string;
  price: string;
  link: string;
  description?: string;
  thumbnail?: string;
  ctaLabel?: string;
  defaultClickBehavior?: ClickBehavior;
}

export interface VideoProject {
  videoSrc: string;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  videoCTA?: VideoCTA;
}
