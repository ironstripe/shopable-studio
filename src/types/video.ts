export type HotspotStyle = "smart-badge" | "screen" | "flash-circle" | "tag-bubble" | "lux-dot";

export interface Hotspot {
  id: string;
  timeStart: number;
  timeEnd: number;
  x: number;
  y: number;
  productId: string;
  style: HotspotStyle;
  ctaLabel: string;
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
