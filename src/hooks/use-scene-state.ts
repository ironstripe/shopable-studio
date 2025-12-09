import { useMemo } from "react";
import { Hotspot } from "@/types/video";

export type SceneStateType = 
  | "no-hotspots-here"      // STATE 1: No hotspots now, but some exist later
  | "needs-configuration"   // STATE 2: Some active hotspots need product/layout
  | "all-complete-here"     // STATE 3: All active hotspots complete, more exist later
  | "all-done"              // STATE 4: All hotspots in entire video are complete
  | "no-hotspots";          // No hotspots exist at all

export interface SceneState {
  state: SceneStateType;
  activeHotspots: Hotspot[];
  incompleteHotspots: Hotspot[];
  completeHotspots: Hotspot[];
  nextHotspot: Hotspot | null;
  nextHotspotTime: number | null;
  allComplete: boolean;
  totalHotspots: number;
  completeCount: number;
}

/**
 * Check if a hotspot is "complete" - has both a product assigned and a style
 */
export const isHotspotComplete = (hotspot: Hotspot): boolean => {
  return !!hotspot.productId && !!hotspot.style;
};

/**
 * Custom hook that computes the current scene state based on video time and hotspots.
 */
export function useSceneState(hotspots: Hotspot[], currentTime: number): SceneState {
  return useMemo(() => {
    // No hotspots at all
    if (hotspots.length === 0) {
      return {
        state: "no-hotspots",
        activeHotspots: [],
        incompleteHotspots: [],
        completeHotspots: [],
        nextHotspot: null,
        nextHotspotTime: null,
        allComplete: true,
        totalHotspots: 0,
        completeCount: 0,
      };
    }

    // Get hotspots active at current time
    const activeHotspots = hotspots.filter(
      h => currentTime >= h.timeStart && currentTime <= h.timeEnd
    );

    // Get future hotspots (start after current time)
    const futureHotspots = hotspots
      .filter(h => h.timeStart > currentTime)
      .sort((a, b) => a.timeStart - b.timeStart);

    const nextHotspot = futureHotspots[0] || null;
    const nextHotspotTime = nextHotspot?.timeStart || null;

    // Check completion status
    const incompleteHotspots = hotspots.filter(h => !isHotspotComplete(h));
    const completeHotspots = hotspots.filter(h => isHotspotComplete(h));
    const allComplete = incompleteHotspots.length === 0;

    // Active incomplete hotspots
    const activeIncomplete = activeHotspots.filter(h => !isHotspotComplete(h));
    const activeComplete = activeHotspots.filter(h => isHotspotComplete(h));

    // Determine state
    let state: SceneStateType;

    if (allComplete) {
      // STATE 4: All hotspots in entire video are complete
      state = "all-done";
    } else if (activeHotspots.length === 0 && futureHotspots.length > 0) {
      // STATE 1: No hotspots here, but some exist later
      state = "no-hotspots-here";
    } else if (activeIncomplete.length > 0) {
      // STATE 2: Some active hotspots need configuration
      state = "needs-configuration";
    } else if (activeComplete.length > 0 && futureHotspots.length > 0) {
      // STATE 3: All active hotspots complete, but more exist later
      state = "all-complete-here";
    } else if (activeHotspots.length === 0 && futureHotspots.length === 0) {
      // Past all hotspots - check if all are complete
      state = allComplete ? "all-done" : "needs-configuration";
    } else {
      // Default to all-done if everything is complete
      state = "all-done";
    }

    return {
      state,
      activeHotspots,
      incompleteHotspots,
      completeHotspots,
      nextHotspot,
      nextHotspotTime,
      allComplete,
      totalHotspots: hotspots.length,
      completeCount: completeHotspots.length,
    };
  }, [hotspots, currentTime]);
}

/**
 * Format seconds to mm:ss display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
