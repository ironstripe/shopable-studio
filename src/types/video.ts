// Top-level hotspot types
export type HotspotType = "icon-only" | "icon-cta-pill" | "badge-bubble" | "minimal-dot";

// Variants per type
export type IconOnlyVariant = "filled" | "outline" | "glow";
export type IconCtaPillVariant = "standard" | "compact";
export type BadgeBubbleVariant = "small" | "large" | "light-shadow" | "strong-shadow";
export type MinimalDotVariant = "default" | "pulse";

// Combined style (type + variant for storage)
export type HotspotStyle = 
  | "icon-only-filled" | "icon-only-outline" | "icon-only-glow"
  | "icon-cta-pill-standard" | "icon-cta-pill-compact"
  | "badge-bubble-small" | "badge-bubble-large" | "badge-bubble-light" | "badge-bubble-strong"
  | "minimal-dot-default" | "minimal-dot-pulse";

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
