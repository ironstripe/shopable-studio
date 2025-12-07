import { useState, useCallback, useMemo } from "react";
import { Hotspot, HotspotStyle, CardStyle, ClickBehavior } from "@/types/video";

export interface UseHotspotsOptions {
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
  
  // Position/Scale helpers
  updateHotspotPosition: (id: string, x: number, y: number) => void;
  updateHotspotScale: (id: string, scale: number) => void;
  
  // Bulk operations
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
}

const DEFAULT_OPTIONS: Required<UseHotspotsOptions> = {
  defaultStyle: "ecommerce-light-card",
  defaultDuration: 3,
};

/**
 * useHotspots hook - manages hotspot state.
 * 
 * IMPORTANT: This hook does NOT perform safe zone clamping.
 * All clamping happens in VideoPlayer.tsx using pixel-accurate measurements.
 * The hook stores raw positions; VideoPlayer clamps before calling updateHotspotPosition.
 */
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

  // CREATE - no clamping here, clamping happens in VideoPlayer with measured dimensions
  const addHotspot = useCallback((x: number, y: number, time: number): Hotspot => {
    const defaultScale = 1;

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      timeStart: time,
      timeEnd: time + opts.defaultDuration,
      x: x,
      y: y,
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
  }, [opts.defaultStyle, opts.defaultDuration]);

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

  // UPDATE POSITION - stores raw position, clamping already done by caller
  const updateHotspotPosition = useCallback((id: string, x: number, y: number) => {
    setHotspots(prev => prev.map(h => h.id === id ? { ...h, x, y } : h));
  }, []);

  // UPDATE SCALE
  const updateHotspotScale = useCallback((id: string, scale: number) => {
    const clampedScale = Math.min(2, Math.max(0.5, scale));
    setHotspots(prev => prev.map(h => h.id === id ? { ...h, scale: clampedScale } : h));
  }, []);

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
