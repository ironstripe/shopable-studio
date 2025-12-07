import { useState, useCallback, useMemo, useEffect } from "react";
import { Hotspot, HotspotStyle, CardStyle, ClickBehavior } from "@/types/video";
import {
  listHotspots as listHotspotsApi,
  createHotspot as createHotspotApi,
  updateHotspot as updateHotspotApi,
  deleteHotspot as deleteHotspotApi,
  mapDtoToHotspot,
  mapHotspotToPayload,
  mapHotspotUpdateToPayload,
} from "@/services/hotspot-api";

export interface UseHotspotsOptions {
  videoId?: string | null;
  defaultStyle?: HotspotStyle;
  defaultDuration?: number;
}

export interface UseHotspotsReturn {
  // State
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  selectedHotspot: Hotspot | null;
  isLoading: boolean;
  loadError: string | null;

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

  // Backend sync
  reload: () => Promise<void>;
  persistPositionUpdate: (id: string) => void;
}

const DEFAULT_OPTIONS: Required<Omit<UseHotspotsOptions, "videoId">> = {
  defaultStyle: "ecommerce-light-card",
  defaultDuration: 3,
};

/**
 * useHotspots hook - manages hotspot state with backend persistence.
 *
 * When videoId is provided, hotspots are loaded from and synced to the backend.
 * Updates are optimistic (local state updated immediately, then synced to backend).
 */
export function useHotspots(
  initialHotspots: Hotspot[] = [],
  options: UseHotspotsOptions = {}
): UseHotspotsReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { videoId } = options;

  const [hotspots, setHotspots] = useState<Hotspot[]>(initialHotspots);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Track pending position updates for debounced sync
  const [pendingPositionUpdates, setPendingPositionUpdates] = useState<Set<string>>(new Set());

  // Derived selected hotspot (always fresh from array!)
  const selectedHotspot = useMemo(() => {
    if (!selectedHotspotId) return null;
    return hotspots.find((h) => h.id === selectedHotspotId) ?? null;
  }, [hotspots, selectedHotspotId]);

  // Load hotspots from backend when videoId changes
  const loadHotspots = useCallback(async () => {
    if (!videoId) {
      setHotspots([]);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const dtos = await listHotspotsApi(videoId);
      const loaded = dtos.map(mapDtoToHotspot);
      setHotspots(loaded);
      console.log("[useHotspots] Loaded hotspots from backend:", loaded.length);
    } catch (error) {
      console.error("[useHotspots] Failed to load hotspots:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load hotspots");
      setHotspots([]);
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  // Load hotspots when videoId changes
  useEffect(() => {
    loadHotspots();
  }, [loadHotspots]);

  // Clear selection when videoId changes
  useEffect(() => {
    setSelectedHotspotId(null);
  }, [videoId]);

  // CREATE - creates locally with temp ID, then syncs to backend and updates with real ID
  const addHotspot = useCallback(
    (x: number, y: number, time: number): Hotspot => {
      const defaultScale = 1;
      const tempId = `hotspot-temp-${Date.now()}`;

      const newHotspot: Hotspot = {
        id: tempId,
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

      // Add to local state immediately (optimistic)
      setHotspots((prev) => [...prev, newHotspot]);
      setSelectedHotspotId(tempId);

      // Persist to backend if videoId is available
      if (videoId) {
        const payload = mapHotspotToPayload(newHotspot, videoId);
        createHotspotApi(videoId, payload)
          .then((createdDto) => {
            // Replace temp hotspot with real one from backend
            setHotspots((prev) =>
              prev.map((h) => (h.id === tempId ? mapDtoToHotspot(createdDto) : h))
            );
            // Update selection to real ID
            setSelectedHotspotId((prevId) =>
              prevId === tempId ? createdDto.id : prevId
            );
            console.log("[useHotspots] Created hotspot on backend:", createdDto.id);
          })
          .catch((error) => {
            console.error("[useHotspots] Failed to create hotspot:", error);
            // Remove the temp hotspot on failure
            setHotspots((prev) => prev.filter((h) => h.id !== tempId));
            setSelectedHotspotId((prevId) => (prevId === tempId ? null : prevId));
          });
      }

      return newHotspot;
    },
    [opts.defaultStyle, opts.defaultDuration, videoId]
  );

  // UPDATE - updates local state immediately, then syncs to backend
  const updateHotspot = useCallback(
    (updated: Partial<Hotspot> & { id: string }) => {
      setHotspots((prev) =>
        prev.map((h) => {
          if (h.id !== updated.id) return h;

          // Always bump revision to force React re-mount via key change
          const nextRevision = (h.revision ?? 0) + 1;

          return {
            ...h,
            ...updated,
            revision: nextRevision,
          };
        })
      );

      // Persist to backend if videoId is available
      // Skip temp IDs (they haven't been created yet)
      if (videoId && !updated.id.startsWith("hotspot-temp-")) {
        const payload = mapHotspotUpdateToPayload(updated);
        if (Object.keys(payload).length > 0) {
          updateHotspotApi(videoId, updated.id, payload)
            .then(() => {
              console.log("[useHotspots] Updated hotspot on backend:", updated.id);
            })
            .catch((error) => {
              console.error("[useHotspots] Failed to update hotspot:", error);
            });
        }
      }
    },
    [videoId]
  );

  // DELETE - removes from local state immediately, then syncs to backend
  const deleteHotspot = useCallback(
    (id: string) => {
      setHotspots((prev) => prev.filter((h) => h.id !== id));

      // Clear selection if deleted hotspot was selected
      setSelectedHotspotId((prev) => (prev === id ? null : prev));

      // Persist to backend if videoId is available
      // Skip temp IDs (they haven't been created yet)
      if (videoId && !id.startsWith("hotspot-temp-")) {
        deleteHotspotApi(videoId, id)
          .then(() => {
            console.log("[useHotspots] Deleted hotspot from backend:", id);
          })
          .catch((error) => {
            console.error("[useHotspots] Failed to delete hotspot:", error);
            // Optionally reload to restore state
          });
      }
    },
    [videoId]
  );

  // SELECT
  const selectHotspot = useCallback((id: string | null) => {
    setSelectedHotspotId(id);
  }, []);

  // CLEAR ALL
  const clearHotspots = useCallback(() => {
    setHotspots([]);
    setSelectedHotspotId(null);
  }, []);

  // UPDATE POSITION - stores locally, marks for pending backend sync
  const updateHotspotPosition = useCallback((id: string, x: number, y: number) => {
    setHotspots((prev) => prev.map((h) => (h.id === id ? { ...h, x, y } : h)));
    // Mark this hotspot as having pending position update
    setPendingPositionUpdates((prev) => new Set(prev).add(id));
  }, []);

  // PERSIST POSITION UPDATE - called on drag end to sync position to backend
  const persistPositionUpdate = useCallback(
    (id: string) => {
      if (!videoId || id.startsWith("hotspot-temp-")) return;

      const hotspot = hotspots.find((h) => h.id === id);
      if (!hotspot) return;

      // Only sync if there's a pending update
      if (!pendingPositionUpdates.has(id)) return;

      const payload = mapHotspotUpdateToPayload({ x: hotspot.x, y: hotspot.y });
      updateHotspotApi(videoId, id, payload)
        .then(() => {
          console.log("[useHotspots] Persisted position update:", id);
          setPendingPositionUpdates((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        })
        .catch((error) => {
          console.error("[useHotspots] Failed to persist position:", error);
        });
    },
    [videoId, hotspots, pendingPositionUpdates]
  );

  // UPDATE SCALE
  const updateHotspotScale = useCallback(
    (id: string, scale: number) => {
      const clampedScale = Math.min(2, Math.max(0.5, scale));
      setHotspots((prev) =>
        prev.map((h) => (h.id === id ? { ...h, scale: clampedScale } : h))
      );

      // Persist to backend
      if (videoId && !id.startsWith("hotspot-temp-")) {
        const payload = mapHotspotUpdateToPayload({ scale: clampedScale });
        updateHotspotApi(videoId, id, payload).catch((error) => {
          console.error("[useHotspots] Failed to update scale:", error);
        });
      }
    },
    [videoId]
  );

  return {
    hotspots,
    selectedHotspotId,
    selectedHotspot,
    isLoading,
    loadError,
    addHotspot,
    updateHotspot,
    deleteHotspot,
    selectHotspot,
    clearHotspots,
    updateHotspotPosition,
    updateHotspotScale,
    setHotspots,
    reload: loadHotspots,
    persistPositionUpdate,
  };
}
