export type HotspotStyle = "smart-badge" | "screen" | "flash-circle" | "tag-bubble" | "lux-dot";
export type ClickBehavior = "card-then-shop" | "direct-shop" | "card-only";

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
}

export interface VideoProject {
  videoSrc: string;
  hotspots: Hotspot[];
  products: Record<string, Product>;
}
