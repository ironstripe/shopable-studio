import { useState, useCallback, useMemo } from "react";
import { Hotspot, HotspotStyle, CardStyle, ClickBehavior } from "@/types/video";
import { clampPositionToSafeZone, clampHotspotToSafeZone, getHotspotDimensions, getMaxScaleAtPosition, SafeZonePreset, SAFE_ZONE_CONFIG } from "@/utils/safe-zone";

export interface UseHotspotsOptions {
  safeZonePreset?: SafeZonePreset;
  defaultStyle?: HotspotStyle;
  defaultDuration?: number;
}

export interface UseHotspotsReturn {
  // State
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  selectedHotspot: Hotspot | null; // Derived, always fresh
  
  // Operations
  addHotspot: (x: number, y: number, time: number) => Hotspot;
  updateHotspot: (updated: Partial<Hotspot> & { id: string }) => void;
  deleteHotspot: (id: string) => void;
  selectHotspot: (id: string | null) => void;
  clearHotspots: () => void;
  
  // Position/Scale helpers (with safe zone clamping)
  updateHotspotPosition: (id: string, x: number, y: number) => void;
  updateHotspotScale: (id: string, scale: number) => void;
  
  // Bulk operations
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
}

const DEFAULT_OPTIONS: Required<UseHotspotsOptions> = {
  safeZonePreset: 'vertical_social',
  defaultStyle: "ecommerce-light-card",
  defaultDuration: 3,
};

export function useHotspots(
  initialHotspots: Hotspot[] = [],
  options: UseHotspotsOptions = {}
): UseHotspotsReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [hotspots, setHotspots] = useState<Hotspot[]>(initialHotspots);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Derived selected hotspot (always fresh from array!)
  const selectedHotspot = useMemo(() => {
    if (!selectedHotspotId) return null;
    return hotspots.find(h => h.id === selectedHotspotId) ?? null;
  }, [hotspots, selectedHotspotId]);

  // CREATE
  const addHotspot = useCallback((x: number, y: number, time: number): Hotspot => {
    const defaultScale = 1;
    
    // Clamp to safe zone
    const { x: safeX, y: safeY } = clampPositionToSafeZone(
      x, y, defaultScale, opts.safeZonePreset
    );

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      timeStart: time,
      timeEnd: time + opts.defaultDuration,
      x: safeX,
      y: safeY,
      productId: null,
      style: opts.defaultStyle,
      ctaLabel: "Shop Now",
      scale: defaultScale,
      clickBehavior: "show-card",
      cardStyle: "ecommerce-light-card",
      revision: 0,
    };

    setHotspots(prev => [...prev, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
    
    return newHotspot;
  }, [opts.safeZonePreset, opts.defaultStyle, opts.defaultDuration]);

  // UPDATE
  const updateHotspot = useCallback((updated: Partial<Hotspot> & { id: string }) => {
    setHotspots(prev => prev.map(h => {
      if (h.id !== updated.id) return h;
      
      // Always bump revision to force React re-mount via key change
      const nextRevision = (h.revision ?? 0) + 1;
      
      return {
        ...h,
        ...updated,
        revision: nextRevision,
      };
    }));
  }, []);

  // DELETE
  const deleteHotspot = useCallback((id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
    
    // Clear selection if deleted hotspot was selected
    setSelectedHotspotId(prev => prev === id ? null : prev);
  }, []);

  // SELECT
  const selectHotspot = useCallback((id: string | null) => {
    setSelectedHotspotId(id);
  }, []);

  // CLEAR ALL
  const clearHotspots = useCallback(() => {
    setHotspots([]);
    setSelectedHotspotId(null);
  }, []);

  // UPDATE POSITION (with safe zone clamping)
  const updateHotspotPosition = useCallback((id: string, x: number, y: number) => {
    setHotspots(prev => {
      const hotspot = prev.find(h => h.id === id);
      if (!hotspot) return prev;
      
      const { x: safeX, y: safeY } = clampPositionToSafeZone(
        x, y, hotspot.scale, opts.safeZonePreset
      );
      
      return prev.map(h => h.id === id ? { ...h, x: safeX, y: safeY } : h);
    });
  }, [opts.safeZonePreset]);

  // UPDATE SCALE (with safe zone clamping and position adjustment)
  const updateHotspotScale = useCallback((id: string, scale: number) => {
    setHotspots(prev => {
      const hotspot = prev.find(h => h.id === id);
      if (!hotspot) return prev;
      
      // Clamp scale to valid range first
      const clampedScale = Math.min(2, Math.max(0.5, scale));
      
      // Get hotspot dimensions at new scale
      const { width, height } = getHotspotDimensions(clampedScale);
      
      // Clamp position + dimensions to safe zone (may adjust position)
      const { x: newX, y: newY, width: newWidth, height: newHeight } = 
        clampHotspotToSafeZone(hotspot.x, hotspot.y, width, height, opts.safeZonePreset);
      
      // If dimensions had to be reduced, recalculate scale from the reduced dimensions
      const finalScale = Math.min(
        newWidth / SAFE_ZONE_CONFIG.baseHotspotSize, 
        newHeight / SAFE_ZONE_CONFIG.baseHotspotSize
      );
      
      return prev.map(h => h.id === id ? { 
        ...h, 
        x: newX, 
        y: newY,
        scale: Math.min(clampedScale, Math.max(0.5, finalScale))
      } : h);
    });
  }, [opts.safeZonePreset]);

  return {
    hotspots,
    selectedHotspotId,
    selectedHotspot,
    addHotspot,
    updateHotspot,
    deleteHotspot,
    selectHotspot,
    clearHotspots,
    updateHotspotPosition,
    updateHotspotScale,
    setHotspots,
  };
}
