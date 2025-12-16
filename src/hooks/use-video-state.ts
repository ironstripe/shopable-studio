import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hotspot } from "@/types/video";

/**
 * Video state machine for MVP flow control.
 * 
 * States:
 * - draft: Video uploaded, no hotspots started
 * - editing: Hotspots are being added or modified
 * - ready_to_post: All hotspots completed, slug confirmed, caption generated
 * - posted: Video has been published externally (optional, manual flag)
 */
export type VideoState = "draft" | "editing" | "ready_to_post" | "posted";

/**
 * Allowed state transitions (STRICT).
 * - draft → editing
 * - editing → ready_to_post
 * - ready_to_post → posted
 * 
 * All other transitions are disallowed.
 */
const ALLOWED_TRANSITIONS: Record<VideoState, VideoState[]> = {
  draft: ["editing"],
  editing: ["ready_to_post"],
  ready_to_post: ["posted"],
  posted: [], // Terminal state
};

/**
 * Check if a state transition is allowed.
 */
export function canTransitionTo(
  currentState: VideoState,
  nextState: VideoState
): boolean {
  return ALLOWED_TRANSITIONS[currentState]?.includes(nextState) ?? false;
}

/**
 * Derive video state from data (fallback when explicit state is invalid/missing).
 * This ensures we always have a valid state based on actual data.
 */
export function deriveVideoState(
  slugFinalized: boolean | null,
  hasHotspots: boolean,
  explicitState?: string | null
): VideoState {
  // If explicit state is valid, use it
  if (
    explicitState &&
    ["draft", "editing", "ready_to_post", "posted"].includes(explicitState)
  ) {
    return explicitState as VideoState;
  }

  // Derive from data
  if (slugFinalized) {
    return "ready_to_post";
  }

  if (hasHotspots) {
    return "editing";
  }

  return "draft";
}

/**
 * Get safe state - returns valid state or derives from data.
 */
export function getSafeState(
  video: { state?: string | null; slug_finalized?: boolean | null } | null,
  hotspots: Hotspot[]
): VideoState {
  if (!video) return "draft";

  const explicitState = video.state;
  const slugFinalized = video.slug_finalized ?? false;
  const hasHotspots = hotspots.length > 0;

  return deriveVideoState(slugFinalized, hasHotspots, explicitState);
}

interface UseVideoStateReturn {
  transitionTo: (videoId: string, nextState: VideoState) => Promise<boolean>;
  canTransitionTo: (currentState: VideoState, nextState: VideoState) => boolean;
  deriveState: (
    slugFinalized: boolean | null,
    hasHotspots: boolean,
    explicitState?: string | null
  ) => VideoState;
}

/**
 * Hook for managing video state transitions.
 */
export function useVideoState(): UseVideoStateReturn {
  /**
   * Transition video to a new state (with validation).
   * Returns true if transition succeeded, false otherwise.
   */
  const transitionTo = useCallback(
    async (videoId: string, nextState: VideoState): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("videos")
          .update({ state: nextState })
          .eq("id", videoId);

        if (error) {
          console.error("[useVideoState] Failed to transition state:", error);
          return false;
        }

        console.log("[useVideoState] State transitioned to:", nextState);
        return true;
      } catch (err) {
        console.error("[useVideoState] Transition error:", err);
        return false;
      }
    },
    []
  );

  return {
    transitionTo,
    canTransitionTo,
    deriveState: deriveVideoState,
  };
}
