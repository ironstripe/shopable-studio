// Editor mode
export type EditorMode = "edit" | "preview";

// Countdown configuration types
export type CountdownMode = "fixed-end" | "evergreen";
export type CountdownStyle = "light" | "bold";
export type CountdownPosition = "above" | "below" | "top-right";

export interface HotspotCountdown {
  active: boolean;
  mode: CountdownMode;
  endTime?: string; // ISO timestamp for fixed-end mode
  style: CountdownStyle;
  position: CountdownPosition;
}

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

// Simplified hotspot style system - 3 main styles + locked seasonal specials
export type HotspotStyle = 
  // Main MVP styles (1 per family)
  | "ecommerce-light-card"
  | "luxury-fine-line"
  | "seasonal-standard"
  // Locked seasonal specials (for upsell UI)
  | "seasonal-valentine"
  | "seasonal-easter"
  | "seasonal-black-friday";

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

// Product Card Family System - simplified to match hotspot families
export type CardFamily = "ecommerce" | "luxury" | "seasonal";

// Simplified card styles to match hotspot families
export type CardStyle = 
  | "ecommerce-light-card"
  | "luxury-fine-line"
  | "seasonal-standard";

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
  toolbarOffset?: { x: number; y: number }; // Custom toolbar position offset for drag
  countdown?: HotspotCountdown; // Optional countdown timer configuration
  revision?: number; // Optional: Increments on every update, forces React re-mount via key change
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
