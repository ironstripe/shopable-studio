import { HotspotStyle } from "@/types/video";

// Safe zone presets for different platforms
export type SafeZonePreset = 'vertical_social' | 'none';

// Safe rect (left, top, right, bottom as percentages 0-1)
export interface SafeRect {
  left: number;
  top: number;
  right: number;  // maximum X position for hotspot right edge
  bottom: number; // maximum Y position for hotspot bottom edge
}

// Pixel rectangle for calculations
export interface PixelRect {
  x: number;      // left edge in pixels
  y: number;      // top edge in pixels
  width: number;  // width in pixels
  height: number; // height in pixels
}

// ========================================
// Configurable Safe Zone Constants
// ========================================
export const SAFE_ZONE_CONFIG = {
  // Platform UI reserved areas (as fraction 0-1)
  rightMargin: 0.15,   // 15% for TikTok/IG/YT icons column
  bottomMargin: 0.18,  // 18% for captions/controls area
  
  // Hotspot constraints
  baseHotspotSize: 0.08,  // 8% of video dimension
  minScale: 0.5,
  maxScale: 2.0,
} as const;

/**
 * Get safe rect boundaries for a given preset (as percentages 0-1)
 */
export const getSafeRect = (preset: SafeZonePreset): SafeRect => {
  if (preset === 'none') {
    return { left: 0, top: 0, right: 1, bottom: 1 };
  }
  
  // vertical_social: reserves configured margins
  return {
    left: 0,
    top: 0,
    right: 1 - SAFE_ZONE_CONFIG.rightMargin,
    bottom: 1 - SAFE_ZONE_CONFIG.bottomMargin,
  };
};

/**
 * Get safe zone as pixel rectangle
 */
export const getSafeZonePixelRect = (
  containerWidth: number,
  containerHeight: number,
  preset: SafeZonePreset
): PixelRect => {
  const safe = getSafeRect(preset);
  return {
    x: safe.left * containerWidth,
    y: safe.top * containerHeight,
    width: (safe.right - safe.left) * containerWidth,
    height: (safe.bottom - safe.top) * containerHeight,
  };
};

/**
 * Get estimated hotspot pixel dimensions based on style
 * These match the actual rendered sizes in HotspotIcon.tsx
 */
export const getHotspotPixelDimensions = (
  style: HotspotStyle,
  scale: number,
  hasProduct: boolean
): { width: number; height: number } => {
  if (!hasProduct) {
    // EmptyHotspotIndicator: 48px base, minimum 44px
    const size = Math.max(44, 48 * scale);
    return { width: size, height: size };
  }
  
  // Product-assigned hotspot dimensions (from HotspotIcon.tsx actual renders)
  let baseWidth = 160;
  let baseHeight = 60;
  
  switch (style) {
    case "ecommerce-light-card":
      baseWidth = 192; baseHeight = 72; break; // padding + content
    case "ecommerce-sale-boost":
      baseWidth = 212; baseHeight = 160; break;
    case "ecommerce-minimal":
      baseWidth = 208; baseHeight = 56; break;
    case "luxury-fine-line":
      baseWidth = 178; baseHeight = 56; break;
    case "luxury-elegance-card":
      baseWidth = 206; baseHeight = 110; break;
    case "luxury-dot":
      baseWidth = 110; baseHeight = 28; break;
    case "seasonal-valentine":
    case "seasonal-easter":
    case "seasonal-black-friday":
      baseWidth = 150; baseHeight = 40; break;
    default:
      baseWidth = 160; baseHeight = 60;
  }
  
  return { 
    width: baseWidth * scale, 
    height: baseHeight * scale 
  };
};

/**
 * Check if a point is inside the safe zone
 */
export const isPointInSafeZone = (x: number, y: number, preset: SafeZonePreset): boolean => {
  const safe = getSafeRect(preset);
  return x >= safe.left && x <= safe.right && y >= safe.top && y <= safe.bottom;
};

/**
 * Clamp hotspot CENTER position to safe zone using pixel coordinates
 * Input: center position as percentage (0-1), hotspot pixel dimensions
 * Output: clamped center position as percentage (0-1)
 */
export const clampHotspotCenterToSafeZone = (
  centerX: number,       // 0-1 percentage from left (center of hotspot)
  centerY: number,       // 0-1 percentage from top (center of hotspot)
  hotspotWidth: number,  // pixels
  hotspotHeight: number, // pixels
  containerWidth: number,
  containerHeight: number,
  preset: SafeZonePreset
): { x: number; y: number; wasConstrained: boolean } => {
  if (preset === 'none') {
    return { x: centerX, y: centerY, wasConstrained: false };
  }
  
  const safeZone = getSafeZonePixelRect(containerWidth, containerHeight, preset);
  
  // Convert center percentage to pixel center
  let centerPixelX = centerX * containerWidth;
  let centerPixelY = centerY * containerHeight;
  
  // Calculate hotspot bounding box (from center)
  const halfWidth = hotspotWidth / 2;
  const halfHeight = hotspotHeight / 2;
  
  let wasConstrained = false;
  
  // Clamp left edge (center - halfWidth must be >= safe.x)
  if (centerPixelX - halfWidth < safeZone.x) {
    centerPixelX = safeZone.x + halfWidth;
    wasConstrained = true;
  }
  
  // Clamp top edge (center - halfHeight must be >= safe.y)
  if (centerPixelY - halfHeight < safeZone.y) {
    centerPixelY = safeZone.y + halfHeight;
    wasConstrained = true;
  }
  
  // Clamp right edge (center + halfWidth must be <= safe.x + safe.width)
  const safeRight = safeZone.x + safeZone.width;
  if (centerPixelX + halfWidth > safeRight) {
    centerPixelX = safeRight - halfWidth;
    wasConstrained = true;
  }
  
  // Clamp bottom edge (center + halfHeight must be <= safe.y + safe.height)
  const safeBottom = safeZone.y + safeZone.height;
  if (centerPixelY + halfHeight > safeBottom) {
    centerPixelY = safeBottom - halfHeight;
    wasConstrained = true;
  }
  
  // Handle case where hotspot is larger than safe zone (center it)
  if (hotspotWidth > safeZone.width) {
    centerPixelX = safeZone.x + safeZone.width / 2;
    wasConstrained = true;
  }
  if (hotspotHeight > safeZone.height) {
    centerPixelY = safeZone.y + safeZone.height / 2;
    wasConstrained = true;
  }
  
  // Convert back to percentage
  return {
    x: centerPixelX / containerWidth,
    y: centerPixelY / containerHeight,
    wasConstrained,
  };
};

/**
 * Calculate maximum allowed scale for a hotspot at given position within safe zone
 */
export const getMaxScaleInSafeZone = (
  centerX: number,       // 0-1 percentage
  centerY: number,       // 0-1 percentage
  style: HotspotStyle,
  hasProduct: boolean,
  containerWidth: number,
  containerHeight: number,
  preset: SafeZonePreset
): number => {
  if (preset === 'none') return SAFE_ZONE_CONFIG.maxScale;
  
  const safeZone = getSafeZonePixelRect(containerWidth, containerHeight, preset);
  
  // Get base dimensions at scale 1
  const { width: baseWidth, height: baseHeight } = getHotspotPixelDimensions(style, 1, hasProduct);
  
  // Convert center to pixels
  const centerPixelX = centerX * containerWidth;
  const centerPixelY = centerY * containerHeight;
  
  // Calculate max half-dimensions that fit from current center position
  const maxHalfLeft = centerPixelX - safeZone.x;
  const maxHalfRight = (safeZone.x + safeZone.width) - centerPixelX;
  const maxHalfTop = centerPixelY - safeZone.y;
  const maxHalfBottom = (safeZone.y + safeZone.height) - centerPixelY;
  
  // Max half-dimensions we can use
  const maxHalfWidth = Math.min(maxHalfLeft, maxHalfRight);
  const maxHalfHeight = Math.min(maxHalfTop, maxHalfBottom);
  
  // Calculate max scale based on each dimension
  const maxScaleByWidth = (maxHalfWidth * 2) / baseWidth;
  const maxScaleByHeight = (maxHalfHeight * 2) / baseHeight;
  
  // Return the most restrictive, clamped to valid range
  return Math.max(
    SAFE_ZONE_CONFIG.minScale, 
    Math.min(SAFE_ZONE_CONFIG.maxScale, Math.min(maxScaleByWidth, maxScaleByHeight))
  );
};

// Legacy function for backward compatibility
export const clampPositionToSafeZone = (
  x: number, 
  y: number, 
  scale: number,
  preset: SafeZonePreset
): { x: number; y: number; wasConstrained: boolean } => {
  // This is a simplified version that doesn't account for actual hotspot size
  // Use clampHotspotCenterToSafeZone for accurate clamping with pixel dimensions
  const safe = getSafeRect(preset);
  
  let newX = Math.max(safe.left, Math.min(safe.right, x));
  let newY = Math.max(safe.top, Math.min(safe.bottom, y));
  
  const wasConstrained = newX !== x || newY !== y;
  return { x: newX, y: newY, wasConstrained };
};
