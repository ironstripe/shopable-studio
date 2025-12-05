import { useState, useEffect, useCallback } from "react";

export type FTUXStep =
  | "welcome"          // Initial overlay
  | "emptyEditor"      // Waiting for video upload
  | "videoLoaded"      // Video loaded, show FAB hint
  | "hotspotPlacement" // FAB tapped, show "tap on video" hint
  | "productSelect"    // Hotspot placed, show product sheet hint
  | "postProduct"      // Product assigned, show preview hint
  | "exportHint"       // Show export hint
  | "complete";        // FTUX finished

const STORAGE_KEY = "shopable_ftux";

interface FTUXState {
  isComplete: boolean;
  currentStep: FTUXStep;
}

const getInitialState = (): FTUXState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        isComplete: parsed.isComplete ?? false,
        currentStep: parsed.currentStep ?? "welcome",
      };
    }
  } catch (e) {
    console.warn("Failed to load FTUX state:", e);
  }
  return { isComplete: false, currentStep: "welcome" };
};

export const useFTUX = () => {
  const [state, setState] = useState<FTUXState>(getInitialState);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save FTUX state:", e);
    }
  }, [state]);

  const advanceStep = useCallback((to: FTUXStep) => {
    setState((prev) => {
      if (prev.isComplete) return prev;
      return { ...prev, currentStep: to };
    });
  }, []);

  const completeFTUX = useCallback(() => {
    setState({ isComplete: true, currentStep: "complete" });
  }, []);

  const resetFTUX = useCallback(() => {
    setState({ isComplete: false, currentStep: "welcome" });
  }, []);

  const isStepActive = useCallback(
    (step: FTUXStep) => !state.isComplete && state.currentStep === step,
    [state]
  );

  return {
    step: state.currentStep,
    isComplete: state.isComplete,
    advanceStep,
    completeFTUX,
    resetFTUX,
    isStepActive,
  };
};

// Standalone reset function for settings UI
export const resetFTUX = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isComplete: false, currentStep: "welcome" })
    );
  } catch (e) {
    console.warn("Failed to reset FTUX:", e);
  }
};
