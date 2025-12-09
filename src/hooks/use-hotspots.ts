import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  deleteHotspot: (id: string) => Promise<void>;
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

  // Ref to always have current hotspots (avoids stale closure in callbacks)
  const hotspotsRef = useRef<Hotspot[]>(hotspots);
  useEffect(() => {
    hotspotsRef.current = hotspots;
  }, [hotspots]);

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
            // Map backend response but KEEP the client-generated id stable
            const backendHotspot = mapDtoToHotspot(createdDto);
            
            setHotspots((prev) =>
              prev.map((h) => {
                if (h.id !== tempId) return h;
                return {
                  ...backendHotspot,
                  id: tempId, // Keep stable client ID
                  backendId: backendHotspot.id, // Store backend ID separately
                };
              })
            );
            
            // Don't change selectedHotspotId - it already has tempId which is stable
            console.log("[useHotspots] Created hotspot on backend:", createdDto.id, "-> client id:", tempId);
          })
          .catch((error) => {
            console.error("[useHotspots] Failed to create hotspot:", error);
            // DON'T remove - keep the hotspot visible for local editing
            // User can continue editing even if backend save failed
            // Show error toast to inform user
            import('sonner').then(({ toast }) => {
              toast.error("Failed to save hotspot. Changes are local only.");
            });
          });
      }

      return newHotspot;
    },
    [opts.defaultStyle, opts.defaultDuration, videoId]
  );

  // UPDATE - updates local state immediately, then syncs to backend
  const updateHotspot = useCallback(
    (updated: Partial<Hotspot> & { id: string }) => {
      // Check if this is ONLY a toolbarOffset update (no revision bump needed)
      // toolbarOffset is client-only and doesn't need backend sync
      const updateKeys = Object.keys(updated);
      const isToolbarOffsetOnly = 
        updateKeys.length === 2 && 
        updateKeys.includes('id') && 
        updateKeys.includes('toolbarOffset');

      setHotspots((prev) =>
        prev.map((h) => {
          if (h.id !== updated.id) return h;

          // Skip revision bump for toolbar offset updates to prevent remount during drag
          const nextRevision = isToolbarOffsetOnly 
            ? (h.revision ?? 0) 
            : (h.revision ?? 0) + 1;

          return {
            ...h,
            ...updated,
            revision: nextRevision,
          };
        })
      );

      // Don't persist toolbarOffset to backend (it's client-side only)
      if (isToolbarOffsetOnly) {
        return;
      }

      // Persist to backend if videoId is available
      // Priority: use backendId from update object, fallback to lookup from current state via ref
      const apiId = (updated as Hotspot).backendId || 
                    hotspotsRef.current.find(h => h.id === updated.id)?.backendId;
      
      console.log("[useHotspots] updateHotspot called:", { 
        id: updated.id, 
        apiId, 
        hasVideoId: !!videoId,
        updateKeys: Object.keys(updated)
      });
      
      if (videoId && apiId) {
        const payload = mapHotspotUpdateToPayload(updated);
        console.log("[useHotspots] Syncing update to backend:", { apiId, payload });
        if (Object.keys(payload).length > 0) {
          updateHotspotApi(videoId, apiId, payload)
            .then(() => {
              console.log("[useHotspots] Updated hotspot on backend:", apiId);
            })
            .catch((error) => {
              console.error("[useHotspots] Failed to update hotspot:", error);
            });
        }
      } else {
        console.log("[useHotspots] Skipping backend sync - no videoId or apiId:", { videoId, apiId });
      }
    },
    [videoId]
  );

  // DELETE - removes from local state immediately, then syncs to backend
  // Returns a Promise so caller can handle success/failure (e.g., for toasts)
  const deleteHotspot = useCallback(
    async (id: string): Promise<void> => {
      // Capture state BEFORE deletion for potential rollback
      const hotspotToDelete = hotspots.find(h => h.id === id);
      const previousHotspots = [...hotspots];
      const previousSelectedId = selectedHotspotId;

      // Optimistic removal
      setHotspots((prev) => prev.filter((h) => h.id !== id));
      setSelectedHotspotId((prev) => (prev === id ? null : prev));

      // Persist to backend if videoId is available
      const apiId = hotspotToDelete?.backendId ?? hotspotToDelete?.id;
      console.log("[useHotspots] Attempting to delete hotspot:", { id, apiId, videoId });
      
      if (videoId && apiId) {
        try {
          await deleteHotspotApi(videoId, apiId);
          console.log("[useHotspots] Successfully deleted hotspot from backend:", apiId);
        } catch (error) {
          console.error("[useHotspots] Failed to delete hotspot:", error);
          // Rollback: restore previous state
          setHotspots(previousHotspots);
          setSelectedHotspotId(previousSelectedId);
          throw error; // Re-throw so caller can show error toast
        }
      }
    },
    [videoId, hotspots, selectedHotspotId]
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
      const hotspot = hotspots.find((h) => h.id === id);
      if (!hotspot || !videoId || !hotspot.backendId) return;

      // Only sync if there's a pending update
      if (!pendingPositionUpdates.has(id)) return;

      const payload = mapHotspotUpdateToPayload({ x: hotspot.x, y: hotspot.y });
      updateHotspotApi(videoId, hotspot.backendId, payload)
        .then(() => {
          console.log("[useHotspots] Persisted position update:", hotspot.backendId);
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

      // Persist to backend using backendId from ref (avoids stale closure)
      const hotspotForScale = hotspotsRef.current.find(h => h.id === id);
      if (videoId && hotspotForScale?.backendId) {
        const payload = mapHotspotUpdateToPayload({ scale: clampedScale });
        updateHotspotApi(videoId, hotspotForScale.backendId, payload).catch((error) => {
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
