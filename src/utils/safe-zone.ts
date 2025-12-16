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
// TOP-LEFT BASED CLAMPING (Approach A)
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
 * Clamp TOP-LEFT position in container-local pixels.
 * 
 * Guarantees:
 *   safe.left <= hotspotLeft
 *   hotspotLeft + contentWidth <= safe.right
 *   safe.top <= hotspotTop
 *   hotspotTop + contentHeight <= safe.bottom
 */
export function clampTopLeftPx(
  topLeftX: number,        // container-local pixels
  topLeftY: number,        // container-local pixels
  contentWidth: number,    // pixels (from getBoundingClientRect)
  contentHeight: number,   // pixels (from getBoundingClientRect)
  containerWidth: number,  // pixels
  containerHeight: number  // pixels
): { x: number; y: number; wasConstrained: boolean } {
  const safe = getSafeRectPx(containerWidth, containerHeight);
  
  let x = topLeftX;
  let y = topLeftY;
  let constrained = false;

  // Min bounds: top-left must be >= safe zone start
  const minX = safe.left;
  const minY = safe.top;
  
  // Max bounds: top-left + size must be <= safe zone end
  const maxX = safe.right - contentWidth;
  const maxY = safe.bottom - contentHeight;

  // Handle case where content is larger than safe zone (center it)
  const safeWidth = safe.right - safe.left;
  const safeHeight = safe.bottom - safe.top;
  
  if (contentWidth > safeWidth) {
    // Center horizontally if too wide
    x = safe.left + (safeWidth - contentWidth) / 2;
    constrained = true;
  } else {
    // Clamp X within bounds
    if (x < minX) {
      x = minX;
      constrained = true;
    }
    if (x > maxX) {
      x = maxX;
      constrained = true;
    }
  }
  
  if (contentHeight > safeHeight) {
    // Center vertically if too tall
    y = safe.top + (safeHeight - contentHeight) / 2;
    constrained = true;
  } else {
    // Clamp Y within bounds
    if (y < minY) {
      y = minY;
      constrained = true;
    }
    if (y > maxY) {
      y = maxY;
      constrained = true;
    }
  }

  // Development assertion: verify result satisfies constraints
  if (process.env.NODE_ENV !== "production") {
    const right = x + contentWidth;
    const bottom = y + contentHeight;
    
    // Allow 0.5px tolerance for floating point
    const tol = 0.5;
    if (x < safe.left - tol || right > safe.right + tol ||
        y < safe.top - tol || bottom > safe.bottom + tol) {
      console.error("[SafeZone] Top-left clamp failed assertion!", { 
        result: { left: x, right, top: y, bottom },
        safe,
        content: { contentWidth, contentHeight },
        container: { containerWidth, containerHeight }
      });
    }
  }

  return { x, y, wasConstrained: constrained };
}

/**
 * Clamp hotspot TOP-LEFT position (normalized 0-1).
 * Takes and returns TOP-LEFT coordinates.
 */
export function clampHotspotTopLeft(
  topLeftXNorm: number,    // normalized X (0-1) - TOP-LEFT
  topLeftYNorm: number,    // normalized Y (0-1) - TOP-LEFT
  contentWidth: number,    // measured content width in pixels
  contentHeight: number,   // measured content height in pixels
  containerWidth: number,  // container width in pixels
  containerHeight: number, // container height in pixels
  preset: SafeZonePreset = 'vertical_social'
): { x: number; y: number; wasConstrained: boolean } {
  if (preset === 'none') {
    return { x: topLeftXNorm, y: topLeftYNorm, wasConstrained: false };
  }

  // Convert normalized top-left to container-local pixels
  const topLeftPxX = topLeftXNorm * containerWidth;
  const topLeftPxY = topLeftYNorm * containerHeight;

  // Clamp in pixel space
  const result = clampTopLeftPx(
    topLeftPxX,
    topLeftPxY,
    contentWidth,
    contentHeight,
    containerWidth,
    containerHeight
  );

  // Convert back to normalized (0-1)
  return {
    x: result.x / containerWidth,
    y: result.y / containerHeight,
    wasConstrained: result.wasConstrained,
  };
}

/**
 * Convert CENTER position to TOP-LEFT position.
 * Used for migration from center-based data model.
 */
export function centerToTopLeft(
  centerXNorm: number,
  centerYNorm: number,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  // Convert center to pixels
  const centerPxX = centerXNorm * containerWidth;
  const centerPxY = centerYNorm * containerHeight;
  
  // Compute top-left
  const topLeftPxX = centerPxX - contentWidth / 2;
  const topLeftPxY = centerPxY - contentHeight / 2;
  
  // Convert back to normalized
  return {
    x: topLeftPxX / containerWidth,
    y: topLeftPxY / containerHeight,
  };
}

/**
 * Convert TOP-LEFT position to CENTER position.
 * Used for API compatibility if needed.
 */
export function topLeftToCenter(
  topLeftXNorm: number,
  topLeftYNorm: number,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  // Convert top-left to pixels
  const topLeftPxX = topLeftXNorm * containerWidth;
  const topLeftPxY = topLeftYNorm * containerHeight;
  
  // Compute center
  const centerPxX = topLeftPxX + contentWidth / 2;
  const centerPxY = topLeftPxY + contentHeight / 2;
  
  // Convert back to normalized
  return {
    x: centerPxX / containerWidth,
    y: centerPxY / containerHeight,
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
 * Calculate maximum allowed scale for a hotspot at given TOP-LEFT position within safe zone.
 * Uses measured dimensions at scale=1 to compute how much the hotspot can grow.
 */
export function getMaxScaleInSafeZone(
  topLeftXNorm: number,      // 0-1 normalized TOP-LEFT
  topLeftYNorm: number,      // 0-1 normalized TOP-LEFT
  baseWidth: number,         // content width at scale=1 (pixels)
  baseHeight: number,        // content height at scale=1 (pixels)
  containerWidth: number,    // pixels
  containerHeight: number,   // pixels
  preset: SafeZonePreset = 'vertical_social'
): number {
  if (preset === 'none') return HOTSPOT_CONSTRAINTS.maxScale;
  
  const safe = getSafeRectPx(containerWidth, containerHeight);
  
  // Convert top-left to pixels
  const topLeftPxX = topLeftXNorm * containerWidth;
  const topLeftPxY = topLeftYNorm * containerHeight;
  
  // Available space from top-left position
  const availableWidth = safe.right - topLeftPxX;
  const availableHeight = safe.bottom - topLeftPxY;
  
  // Also check space from left/top edges (hotspot might need to grow "backwards")
  const availableFromLeft = topLeftPxX - safe.left;
  const availableFromTop = topLeftPxY - safe.top;
  
  // Max scale is limited by the most restrictive direction
  // For simplicity, use the space available from current position to safe boundary
  const maxScaleByWidth = baseWidth > 0 ? availableWidth / baseWidth : HOTSPOT_CONSTRAINTS.maxScale;
  const maxScaleByHeight = baseHeight > 0 ? availableHeight / baseHeight : HOTSPOT_CONSTRAINTS.maxScale;
  
  // Return the most restrictive, clamped to valid range
  return Math.max(
    HOTSPOT_CONSTRAINTS.minScale, 
    Math.min(HOTSPOT_CONSTRAINTS.maxScale, Math.min(maxScaleByWidth, maxScaleByHeight))
  );
}

// ========================================
// LEGACY CENTER-BASED FUNCTIONS (deprecated)
// Keep for backward compatibility but prefer top-left approach
// ========================================

/**
 * @deprecated Use clampTopLeftPx instead
 */
export function clampCenterPx(
  centerX: number,
  centerY: number,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number
): { centerX: number; centerY: number; wasConstrained: boolean } {
  // Convert center to top-left
  const topLeftX = centerX - contentWidth / 2;
  const topLeftY = centerY - contentHeight / 2;
  
  // Clamp top-left
  const result = clampTopLeftPx(topLeftX, topLeftY, contentWidth, contentHeight, containerWidth, containerHeight);
  
  // Convert back to center
  return {
    centerX: result.x + contentWidth / 2,
    centerY: result.y + contentHeight / 2,
    wasConstrained: result.wasConstrained,
  };
}

/**
 * @deprecated Use clampHotspotTopLeft instead
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

  // Convert center to top-left
  const topLeft = centerToTopLeft(centerXNorm, centerYNorm, contentWidth, contentHeight, containerWidth, containerHeight);
  
  // Clamp top-left
  const clamped = clampHotspotTopLeft(topLeft.x, topLeft.y, contentWidth, contentHeight, containerWidth, containerHeight, preset);
  
  // Convert back to center
  const center = topLeftToCenter(clamped.x, clamped.y, contentWidth, contentHeight, containerWidth, containerHeight);
  
  return {
    x: center.x,
    y: center.y,
    wasConstrained: clamped.wasConstrained,
  };
}
