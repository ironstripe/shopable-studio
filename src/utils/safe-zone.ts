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
// All calculations in CONTAINER-LOCAL PIXELS
// ========================================

/**
 * Compute safe zone boundaries in container-local pixels.
 * This is the SINGLE SOURCE OF TRUTH for safe zone boundaries.
 */
export function getSafeRectPx(
  containerWidth: number,
  containerHeight: number,
  margins: SafeZoneConfig = SAFE_ZONE_MARGINS
): { left: number; right: number; top: number; bottom: number } {
  return {
    left: containerWidth * margins.leftMargin,
    right: containerWidth * (1 - margins.rightMargin),
    top: containerHeight * margins.topMargin,
    bottom: containerHeight * (1 - margins.bottomMargin),
  };
}

/**
 * UNIFIED clamp function with symmetric left/right/top/bottom logic.
 * 
 * All inputs are in CONTAINER-LOCAL PIXELS.
 * 
 * Guarantees:
 *   safe.left <= hotspotLeft
 *   hotspotRight <= safe.right
 *   safe.top <= hotspotTop
 *   hotspotBottom <= safe.bottom
 */
export function clampCenterPx(
  centerX: number,        // container-local pixels
  centerY: number,        // container-local pixels
  contentWidth: number,   // pixels (from getBoundingClientRect)
  contentHeight: number,  // pixels (from getBoundingClientRect)
  containerWidth: number, // pixels
  containerHeight: number // pixels
): { centerX: number; centerY: number; wasConstrained: boolean } {
  const safe = getSafeRectPx(containerWidth, containerHeight);
  
  let cx = centerX;
  let cy = centerY;
  let constrained = false;

  const halfW = contentWidth / 2;
  const halfH = contentHeight / 2;

  // Compute min/max center positions (symmetric for all sides)
  const minX = safe.left + halfW;
  const maxX = safe.right - halfW;
  const minY = safe.top + halfH;
  const maxY = safe.bottom - halfH;

  // Clamp X
  if (cx < minX) {
    cx = minX;
    constrained = true;
  }
  if (cx > maxX) {
    cx = maxX;
    constrained = true;
  }

  // Clamp Y
  if (cy < minY) {
    cy = minY;
    constrained = true;
  }
  if (cy > maxY) {
    cy = maxY;
    constrained = true;
  }

  // Handle case where content is larger than safe zone (center it)
  const safeWidth = safe.right - safe.left;
  const safeHeight = safe.bottom - safe.top;
  
  if (contentWidth > safeWidth) {
    cx = safe.left + safeWidth / 2;
    constrained = true;
  }
  if (contentHeight > safeHeight) {
    cy = safe.top + safeHeight / 2;
    constrained = true;
  }

  // Development assertion: verify result satisfies constraints
  if (process.env.NODE_ENV !== "production") {
    const left = cx - halfW;
    const right = cx + halfW;
    const top = cy - halfH;
    const bottom = cy + halfH;
    
    // Allow 0.5px tolerance for floating point
    const tol = 0.5;
    if (left < safe.left - tol || right > safe.right + tol ||
        top < safe.top - tol || bottom > safe.bottom + tol) {
      console.error("[SafeZone] Clamp failed assertion!", { 
        result: { left, right, top, bottom },
        safe,
        content: { contentWidth, contentHeight },
        container: { containerWidth, containerHeight }
      });
    }
  }

  return { centerX: cx, centerY: cy, wasConstrained: constrained };
}

/**
 * Convenience wrapper: takes NORMALIZED (0-1) center, returns NORMALIZED center.
 * Internally converts to pixels, clamps, then converts back.
 * 
 * @param centerXNorm - normalized X (0-1)
 * @param centerYNorm - normalized Y (0-1)
 * @param contentWidth - measured content width in pixels
 * @param contentHeight - measured content height in pixels
 * @param containerWidth - container width in pixels
 * @param containerHeight - container height in pixels
 */
export function clampHotspotPercentage(
  centerXNorm: number,
  centerYNorm: number,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  preset: SafeZonePreset = 'vertical_social'
): { x: number; y: number; wasConstrained: boolean } {
  if (preset === 'none') {
    return { x: centerXNorm, y: centerYNorm, wasConstrained: false };
  }

  // Convert normalized center to container-local pixels
  const centerPxX = centerXNorm * containerWidth;
  const centerPxY = centerYNorm * containerHeight;

  // Clamp in pixel space
  const result = clampCenterPx(
    centerPxX,
    centerPxY,
    contentWidth,
    contentHeight,
    containerWidth,
    containerHeight
  );

  // Convert back to normalized (0-1)
  return {
    x: result.centerX / containerWidth,
    y: result.centerY / containerHeight,
    wasConstrained: result.wasConstrained,
  };
}

/**
 * Fallback dimensions when DOM measurement not yet available.
 * These are conservative estimates - actual DOM measurement is preferred.
 */
export function getFallbackDimensions(hasProduct: boolean): { width: number; height: number } {
  if (!hasProduct) {
    // EmptyHotspotIndicator: ~48px circle
    return { width: 48, height: 48 };
  }
  // Default product card: ~160x80
  return { width: 160, height: 80 };
}

/**
 * Calculate maximum allowed scale for a hotspot at given position within safe zone.
 * Uses measured dimensions at scale=1 to compute how much the hotspot can grow.
 */
export function getMaxScaleInSafeZone(
  centerXNorm: number,      // 0-1 normalized
  centerYNorm: number,      // 0-1 normalized
  baseWidth: number,        // content width at scale=1 (pixels)
  baseHeight: number,       // content height at scale=1 (pixels)
  containerWidth: number,   // pixels
  containerHeight: number,  // pixels
  preset: SafeZonePreset = 'vertical_social'
): number {
  if (preset === 'none') return HOTSPOT_CONSTRAINTS.maxScale;
  
  const safe = getSafeRectPx(containerWidth, containerHeight);
  
  // Convert center to pixels
  const centerPxX = centerXNorm * containerWidth;
  const centerPxY = centerYNorm * containerHeight;
  
  // Calculate max half-dimensions that fit from current center position
  const maxHalfLeft = centerPxX - safe.left;
  const maxHalfRight = safe.right - centerPxX;
  const maxHalfTop = centerPxY - safe.top;
  const maxHalfBottom = safe.bottom - centerPxY;
  
  // Max half-dimensions we can use (most restrictive side)
  const maxHalfWidth = Math.min(maxHalfLeft, maxHalfRight);
  const maxHalfHeight = Math.min(maxHalfTop, maxHalfBottom);
  
  // Calculate max scale based on each dimension
  const maxScaleByWidth = baseWidth > 0 ? (maxHalfWidth * 2) / baseWidth : HOTSPOT_CONSTRAINTS.maxScale;
  const maxScaleByHeight = baseHeight > 0 ? (maxHalfHeight * 2) / baseHeight : HOTSPOT_CONSTRAINTS.maxScale;
  
  // Return the most restrictive, clamped to valid range
  return Math.max(
    HOTSPOT_CONSTRAINTS.minScale, 
    Math.min(HOTSPOT_CONSTRAINTS.maxScale, Math.min(maxScaleByWidth, maxScaleByHeight))
  );
}
