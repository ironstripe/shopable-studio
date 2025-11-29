export type HotspotStyle = "icon-only" | "icon-cta-pill" | "badge-small" | "badge-large" | "minimal-dot";
export type ClickBehavior = "show-card" | "direct-link" | "no-action";

export interface Hotspot {
  id: string;
  timeStart: number;
  timeEnd: number;
  x: number;
  y: number;
  productId: string;
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
