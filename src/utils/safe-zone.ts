// Safe zone presets for different platforms
export type SafeZonePreset = 'vertical_social' | 'none';

// Safe rect (left, top, right, bottom as percentages 0-1)
export interface SafeRect {
  left: number;
  top: number;
  right: number;  // maximum X position for hotspot right edge
  bottom: number; // maximum Y position for hotspot bottom edge
}

// Base hotspot size as percentage of video dimensions
const BASE_HOTSPOT_SIZE = 0.08; // ~8% of video dimension

/**
 * Get safe rect boundaries for a given preset
 */
export const getSafeRect = (preset: SafeZonePreset): SafeRect => {
  if (preset === 'none') {
    return { left: 0, top: 0, right: 1, bottom: 1 };
  }
  
  // vertical_social: reserves 15% right edge, 18% bottom edge
  return {
    left: 0,
    top: 0,
    right: 0.85,   // 1 - 0.15 (15% reserved on right for platform icons)
    bottom: 0.82   // 1 - 0.18 (18% reserved on bottom for captions/controls)
  };
};

/**
 * Estimate hotspot visual dimensions based on scale
 */
export const getHotspotDimensions = (scale: number): { width: number; height: number } => {
  const size = BASE_HOTSPOT_SIZE * scale;
  return { width: size, height: size };
};

/**
 * Check if a point is inside the safe zone
 */
export const isPointInSafeZone = (x: number, y: number, preset: SafeZonePreset): boolean => {
  const safe = getSafeRect(preset);
  return x >= safe.left && x <= safe.right && y >= safe.top && y <= safe.bottom;
};

/**
 * Clamp hotspot bounds (considering position + dimensions) to safe rect
 * Returns corrected position/dimensions and whether constraint was applied
 */
export const clampHotspotToSafeZone = (
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  preset: SafeZonePreset
): { x: number; y: number; width: number; height: number; wasConstrained: boolean } => {
  if (preset === 'none') {
    return { x, y, width, height, wasConstrained: false };
  }
  
  const safe = getSafeRect(preset);
  
  let newX = x;
  let newY = y;
  let newWidth = width;
  let newHeight = height;
  let wasConstrained = false;
  
  // Clamp left edge
  if (newX < safe.left) { 
    newX = safe.left; 
    wasConstrained = true; 
  }
  
  // Clamp top edge
  if (newY < safe.top) { 
    newY = safe.top; 
    wasConstrained = true; 
  }
  
  // Clamp right edge (x + width must be <= safe.right)
  if (newX + newWidth > safe.right) {
    const overflow = (newX + newWidth) - safe.right;
    // First try shifting position left
    if (newX - overflow >= safe.left) {
      newX -= overflow;
    } else {
      // Can't shift enough, clamp position to left edge and reduce width
      newX = safe.left;
      newWidth = safe.right - safe.left;
    }
    wasConstrained = true;
  }
  
  // Clamp bottom edge (y + height must be <= safe.bottom)
  if (newY + newHeight > safe.bottom) {
    const overflow = (newY + newHeight) - safe.bottom;
    // First try shifting position up
    if (newY - overflow >= safe.top) {
      newY -= overflow;
    } else {
      // Can't shift enough, clamp position to top edge and reduce height
      newY = safe.top;
      newHeight = safe.bottom - safe.top;
    }
    wasConstrained = true;
  }
  
  return { x: newX, y: newY, width: newWidth, height: newHeight, wasConstrained };
};

/**
 * Clamp a hotspot position considering its scale/dimensions
 * Simplified helper for position-only updates (drag, placement)
 */
export const clampPositionToSafeZone = (
  x: number, 
  y: number, 
  scale: number,
  preset: SafeZonePreset
): { x: number; y: number; wasConstrained: boolean } => {
  const { width, height } = getHotspotDimensions(scale);
  const result = clampHotspotToSafeZone(x, y, width, height, preset);
  return { x: result.x, y: result.y, wasConstrained: result.wasConstrained };
};

/**
 * Calculate maximum allowed scale for a hotspot at given position
 */
export const getMaxScaleAtPosition = (
  x: number, 
  y: number, 
  preset: SafeZonePreset
): number => {
  if (preset === 'none') return 2; // Max scale
  
  const safe = getSafeRect(preset);
  const maxWidth = safe.right - x;
  const maxHeight = safe.bottom - y;
  const maxSize = Math.min(maxWidth, maxHeight);
  
  // Convert max size back to scale
  const maxScale = maxSize / BASE_HOTSPOT_SIZE;
  
  // Clamp to reasonable bounds (0.5 to 2.0)
  return Math.max(0.5, Math.min(2, maxScale));
};
