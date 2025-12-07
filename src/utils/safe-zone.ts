import { HotspotStyle } from "@/types/video";

// ========================================
// Unified Safe Zone Configuration
// ========================================

export interface SafeZoneConfig {
  leftMargin: number;    // 0.0 means no left margin
  rightMargin: number;   // 0.15 means 15% reserved on right
  topMargin: number;     // 0.0 means no top margin
  bottomMargin: number;  // 0.18 means 18% reserved on bottom
}

// Single source of truth for safe zone margins
export const SAFE_ZONE_MARGINS: SafeZoneConfig = {
  leftMargin: 0,
  rightMargin: 0.15,   // 15% for TikTok/IG/YT icons column
  topMargin: 0,
  bottomMargin: 0.18,  // 18% for captions/controls area
};

// Hotspot constraints
export const HOTSPOT_CONSTRAINTS = {
  baseHotspotSize: 0.08,  // 8% of video dimension
  minScale: 0.5,
  maxScale: 2.0,
} as const;

// Legacy type for backward compatibility
export type SafeZonePreset = 'vertical_social' | 'none';

// Legacy interface for backward compatibility  
export interface SafeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// Legacy interface for backward compatibility
export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Get safe rect boundaries for a given preset (as percentages 0-1)
 * @deprecated Use SAFE_ZONE_MARGINS directly
 */
export const getSafeRect = (preset: SafeZonePreset): SafeRect => {
  if (preset === 'none') {
    return { left: 0, top: 0, right: 1, bottom: 1 };
  }
  
  return {
    left: SAFE_ZONE_MARGINS.leftMargin,
    top: SAFE_ZONE_MARGINS.topMargin,
    right: 1 - SAFE_ZONE_MARGINS.rightMargin,
    bottom: 1 - SAFE_ZONE_MARGINS.bottomMargin,
  };
};

/**
 * Check if a point is inside the safe zone
 */
export const isPointInSafeZone = (x: number, y: number, preset: SafeZonePreset): boolean => {
  if (preset === 'none') return true;
  
  const safeLeft = SAFE_ZONE_MARGINS.leftMargin;
  const safeRight = 1 - SAFE_ZONE_MARGINS.rightMargin;
  const safeTop = SAFE_ZONE_MARGINS.topMargin;
  const safeBottom = 1 - SAFE_ZONE_MARGINS.bottomMargin;
  
  return x >= safeLeft && x <= safeRight && y >= safeTop && y <= safeBottom;
};

// ========================================
// SINGLE UNIFIED CLAMP FUNCTION
// ========================================

export interface ClampOptions {
  centerX: number;           // in pixels
  centerY: number;           // in pixels
  hotspotWidth: number;      // in pixels
  hotspotHeight: number;     // in pixels
  containerWidth: number;    // in pixels
  containerHeight: number;   // in pixels
  safeZone?: SafeZoneConfig; // optional, defaults to SAFE_ZONE_MARGINS
}

export interface ClampResult {
  centerX: number;
  centerY: number;
  wasConstrained: boolean;
}

/**
 * UNIFIED clamp function with symmetric left/right logic.
 * 
 * Guarantees for every hotspot:
 *   safeLeft <= hotspotLeft
 *   hotspotRight <= safeRight
 *   safeTop <= hotspotTop
 *   hotspotBottom <= safeBottom
 * 
 * All inputs and outputs are in PIXELS.
 */
export function clampHotspotCenterToSafeZone(options: ClampOptions): ClampResult {
  const { 
    centerX: cxIn, 
    centerY: cyIn, 
    hotspotWidth, 
    hotspotHeight, 
    containerWidth, 
    containerHeight, 
    safeZone = SAFE_ZONE_MARGINS 
  } = options;

  let cx = cxIn;
  let cy = cyIn;
  let constrained = false;

  // Compute safe boundaries in PIXELS
  const safeLeft   = containerWidth  * safeZone.leftMargin;
  const safeRight  = containerWidth  * (1 - safeZone.rightMargin);
  const safeTop    = containerHeight * safeZone.topMargin;
  const safeBottom = containerHeight * (1 - safeZone.bottomMargin);

  const halfW = hotspotWidth / 2;
  const halfH = hotspotHeight / 2;

  // LEFT: hotspotLeft >= safeLeft  →  cx - halfW >= safeLeft
  if (cx - halfW < safeLeft) {
    cx = safeLeft + halfW;
    constrained = true;
  }

  // RIGHT: hotspotRight <= safeRight  →  cx + halfW <= safeRight
  if (cx + halfW > safeRight) {
    cx = safeRight - halfW;
    constrained = true;
  }

  // TOP: hotspotTop >= safeTop  →  cy - halfH >= safeTop
  if (cy - halfH < safeTop) {
    cy = safeTop + halfH;
    constrained = true;
  }

  // BOTTOM: hotspotBottom <= safeBottom  →  cy + halfH <= safeBottom
  if (cy + halfH > safeBottom) {
    cy = safeBottom - halfH;
    constrained = true;
  }

  // Handle case where hotspot is larger than safe zone (center it)
  const safeWidth = safeRight - safeLeft;
  const safeHeight = safeBottom - safeTop;
  
  if (hotspotWidth > safeWidth) {
    cx = safeLeft + safeWidth / 2;
    constrained = true;
  }
  if (hotspotHeight > safeHeight) {
    cy = safeTop + safeHeight / 2;
    constrained = true;
  }

  // Development assertion
  if (process.env.NODE_ENV !== "production") {
    const left  = cx - halfW;
    const right = cx + halfW;
    const top   = cy - halfH;
    const bottom = cy + halfH;
    
    // Allow 0.5px tolerance for floating point
    if (left < safeLeft - 0.5 || right > safeRight + 0.5 ||
        top < safeTop - 0.5 || bottom > safeBottom + 0.5) {
      console.error("[SafeZone] Clamp failed!", { 
        left, right, top, bottom, 
        safeLeft, safeRight, safeTop, safeBottom,
        hotspotWidth, hotspotHeight,
        containerWidth, containerHeight
      });
    }
  }

  return { centerX: cx, centerY: cy, wasConstrained: constrained };
}

/**
 * Convenience wrapper that takes percentage inputs and returns percentage outputs.
 * Internally converts to pixels, clamps, then converts back.
 */
export function clampHotspotPercentage(
  centerXPct: number,      // 0-1 percentage
  centerYPct: number,      // 0-1 percentage  
  hotspotWidth: number,    // pixels
  hotspotHeight: number,   // pixels
  containerWidth: number,  // pixels
  containerHeight: number, // pixels
  preset: SafeZonePreset = 'vertical_social'
): { x: number; y: number; wasConstrained: boolean } {
  if (preset === 'none') {
    return { x: centerXPct, y: centerYPct, wasConstrained: false };
  }

  // Convert percentage center to pixel center
  const centerPixelX = centerXPct * containerWidth;
  const centerPixelY = centerYPct * containerHeight;

  // Clamp in pixel space
  const result = clampHotspotCenterToSafeZone({
    centerX: centerPixelX,
    centerY: centerPixelY,
    hotspotWidth,
    hotspotHeight,
    containerWidth,
    containerHeight,
    safeZone: SAFE_ZONE_MARGINS,
  });

  // Convert back to percentage
  return {
    x: result.centerX / containerWidth,
    y: result.centerY / containerHeight,
    wasConstrained: result.wasConstrained,
  };
}

/**
 * Get estimated hotspot pixel dimensions based on style
 * Used as fallback when DOM measurements aren't available
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
  
  let baseWidth = 160;
  let baseHeight = 60;
  
  switch (style) {
    case "ecommerce-light-card":
      baseWidth = 192; baseHeight = 72; break;
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
  if (preset === 'none') return HOTSPOT_CONSTRAINTS.maxScale;
  
  // Get base dimensions at scale 1
  const { width: baseWidth, height: baseHeight } = getHotspotPixelDimensions(style, 1, hasProduct);
  
  // Convert center to pixels
  const centerPixelX = centerX * containerWidth;
  const centerPixelY = centerY * containerHeight;
  
  // Calculate safe boundaries
  const safeLeft = containerWidth * SAFE_ZONE_MARGINS.leftMargin;
  const safeRight = containerWidth * (1 - SAFE_ZONE_MARGINS.rightMargin);
  const safeTop = containerHeight * SAFE_ZONE_MARGINS.topMargin;
  const safeBottom = containerHeight * (1 - SAFE_ZONE_MARGINS.bottomMargin);
  
  // Calculate max half-dimensions that fit from current center position
  const maxHalfLeft = centerPixelX - safeLeft;
  const maxHalfRight = safeRight - centerPixelX;
  const maxHalfTop = centerPixelY - safeTop;
  const maxHalfBottom = safeBottom - centerPixelY;
  
  // Max half-dimensions we can use
  const maxHalfWidth = Math.min(maxHalfLeft, maxHalfRight);
  const maxHalfHeight = Math.min(maxHalfTop, maxHalfBottom);
  
  // Calculate max scale based on each dimension
  const maxScaleByWidth = (maxHalfWidth * 2) / baseWidth;
  const maxScaleByHeight = (maxHalfHeight * 2) / baseHeight;
  
  // Return the most restrictive, clamped to valid range
  return Math.max(
    HOTSPOT_CONSTRAINTS.minScale, 
    Math.min(HOTSPOT_CONSTRAINTS.maxScale, Math.min(maxScaleByWidth, maxScaleByHeight))
  );
};
