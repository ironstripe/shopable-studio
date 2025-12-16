import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Hotspot, HotspotStyle, CardStyle, ClickBehavior } from "@/types/video";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  listHotspots as listHotspotsApi,
  createHotspot as createHotspotApi,
  updateHotspot as updateHotspotApi,
  deleteHotspot as deleteHotspotApi,
  mapDtoToHotspot,
  mapHotspotToPayload,
  mapHotspotUpdateToPayload,
  mapFullHotspotToUpdatePayload,
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
  
  // Track pending updates for hotspots awaiting backendId (fixes race condition)
  const pendingUpdatesMapRef = useRef<Map<string, Partial<Hotspot>>>(new Map());

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
      
      // STATE MACHINE: Transition draft → editing on first hotspot
      // Check current count BEFORE adding (prev.length === 0 means this is the first)
      const isFirstHotspot = hotspotsRef.current.length === 0;

      // Persist to backend if videoId is available
      if (videoId) {
        const payload = mapHotspotToPayload(newHotspot, videoId);
        createHotspotApi(videoId, payload)
          .then((createdDto) => {
            // Map backend response but KEEP the client-generated id stable
            const backendHotspot = mapDtoToHotspot(createdDto);
            const realBackendId = backendHotspot.id;
            
            // Check for pending updates that were queued while waiting for backendId
            const pendingUpdate = pendingUpdatesMapRef.current.get(tempId);
            
            // Merge backend hotspot with any pending updates
            const finalHotspot = pendingUpdate 
              ? { ...backendHotspot, ...pendingUpdate, id: tempId, backendId: realBackendId }
              : { ...backendHotspot, id: tempId, backendId: realBackendId };
            
            setHotspots((prev) =>
              prev.map((h) => (h.id === tempId ? finalHotspot : h))
            );
            
            console.log("[useHotspots] Created hotspot on backend:", createdDto.id, "-> client id:", tempId);
            
            // Replay pending update to backend if there was one
            if (pendingUpdate) {
              console.log("[useHotspots] Replaying pending update for:", tempId, pendingUpdate);
              const replayPayload = mapFullHotspotToUpdatePayload(finalHotspot);
              updateHotspotApi(videoId, realBackendId, replayPayload)
                .then(() => console.log("[useHotspots] Replayed pending update successfully"))
                .catch((err) => console.error("[useHotspots] Failed to replay pending update:", err));
              
              // Clear from pending map
              pendingUpdatesMapRef.current.delete(tempId);
            }
          })
          .catch((error) => {
            console.error("[useHotspots] Failed to create hotspot:", error);
            toast.error("Failed to save hotspot. Changes are local only.");
          });

        // STATE MACHINE: Transition draft → editing on first hotspot (after backend sync starts)
        if (isFirstHotspot) {
          supabase
            .from("videos")
            .update({ state: "editing" })
            .eq("id", videoId)
            .then(({ error }) => {
              if (error) {
                console.warn("[useHotspots] Failed to transition state to editing:", error);
              } else {
                console.log("[useHotspots] State transitioned: draft → editing");
              }
            });
        }
      }

      return newHotspot;
    },
    [opts.defaultStyle, opts.defaultDuration, videoId]
  );

  // UPDATE - updates local state immediately, then syncs FULL hotspot to backend
  const updateHotspot = useCallback(
    (updated: Partial<Hotspot> & { id: string }) => {
      // Check if this is ONLY a toolbarOffset update (no revision bump needed)
      const updateKeys = Object.keys(updated);
      const isToolbarOffsetOnly = 
        updateKeys.length === 2 && 
        updateKeys.includes('id') && 
        updateKeys.includes('toolbarOffset');

      // Find current hotspot SYNCHRONOUSLY before any state updates
      // This avoids React 18 batching issues where setState callback defers
      const currentHotspot = hotspotsRef.current.find(h => h.id === updated.id);
      if (!currentHotspot) {
        console.error("[useHotspots] Hotspot not found for update:", updated.id);
        return;
      }

      // Compute merged hotspot BEFORE setState (avoids React 18 batching issues)
      const nextRevision = isToolbarOffsetOnly 
        ? (currentHotspot.revision ?? 0) 
        : (currentHotspot.revision ?? 0) + 1;

      const mergedHotspot: Hotspot = {
        ...currentHotspot,
        ...updated,
        revision: nextRevision,
      };

      // Update local state with pre-computed merged hotspot
      setHotspots((prev) =>
        prev.map((h) => (h.id === updated.id ? mergedHotspot : h))
      );

      // Don't persist toolbarOffset to backend (it's client-side only)
      if (isToolbarOffsetOnly) {
        return;
      }

      // Persist FULL merged hotspot to backend
      const apiId = mergedHotspot.backendId;
      console.log("[useHotspots] updateHotspot called:", { 
        id: updated.id, 
        apiId, 
        hasVideoId: !!videoId,
        updateKeys,
        mergedProductUrl: mergedHotspot.productUrl,
      });
      
      if (videoId && apiId) {
        const payload = mapFullHotspotToUpdatePayload(mergedHotspot);
        console.log("[useHotspots] Syncing FULL hotspot to backend:", { apiId, payload });
        
        updateHotspotApi(videoId, apiId, payload)
          .then(() => {
            console.log("[useHotspots] Updated hotspot on backend:", apiId);
          })
          .catch((error) => {
            console.error("[useHotspots] Failed to update hotspot:", error);
            toast.error("Failed to save hotspot changes");
          });
      } else if (videoId && !apiId) {
        // Queue update for later - will be replayed when backendId arrives
        console.log("[useHotspots] Queueing update - awaiting backendId:", updated.id);
        const existing = pendingUpdatesMapRef.current.get(updated.id) || {};
        pendingUpdatesMapRef.current.set(updated.id, { ...existing, ...updated });
      } else {
        console.log("[useHotspots] Skipping backend sync - missing videoId:", { 
          videoId, 
          apiId, 
        });
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
      
      // Clear any pending updates for this hotspot
      pendingUpdatesMapRef.current.delete(id);

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

      // Use FULL payload to avoid wiping out product fields
      const payload = mapFullHotspotToUpdatePayload(hotspot);
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

      // Persist to backend using FULL payload to avoid wiping out product fields
      const hotspotForScale = hotspotsRef.current.find(h => h.id === id);
      if (videoId && hotspotForScale?.backendId) {
        // Create merged hotspot with new scale
        const updatedHotspot = { ...hotspotForScale, scale: clampedScale };
        const payload = mapFullHotspotToUpdatePayload(updatedHotspot);
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
