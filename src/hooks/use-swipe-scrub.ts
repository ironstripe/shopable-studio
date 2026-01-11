import { useRef, useCallback } from "react";

interface UseSwipeScrubOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  enabled: boolean;
  sensitivity?: number; // pixels per second of video time
}

interface SwipeState {
  isSwipeing: boolean;
  startX: number;
  startTime: number;
}

/**
 * Hook for horizontal swipe-to-scrub gesture on video.
 * Left swipe = rewind, Right swipe = forward.
 */
export function useSwipeScrub({
  videoRef,
  containerRef,
  enabled,
  sensitivity = 100, // 100px = 1 second
}: UseSwipeScrubOptions) {
  const swipeState = useRef<SwipeState>({
    isSwipeing: false,
    startX: 0,
    startTime: 0,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !videoRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      swipeState.current = {
        isSwipeing: true,
        startX: touch.clientX,
        startTime: videoRef.current.currentTime,
      };
    },
    [enabled, videoRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !swipeState.current.isSwipeing || !videoRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaTime = deltaX / sensitivity;
      
      const video = videoRef.current;
      const newTime = Math.max(0, Math.min(video.duration, swipeState.current.startTime + deltaTime));
      
      video.currentTime = newTime;
    },
    [enabled, videoRef, sensitivity]
  );

  const handleTouchEnd = useCallback(() => {
    swipeState.current.isSwipeing = false;
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isSwipeing: swipeState.current.isSwipeing,
  };
}
