import { RefObject, useState, useEffect } from "react";

interface UseSmartPositionProps {
  hotspotX: number; // 0-1 percentage
  hotspotY: number; // 0-1 percentage
  cardWidth: number; // pixels
  cardHeight: number; // pixels
  containerRef: RefObject<HTMLDivElement>;
  margin?: number; // default 12px
  isOpen: boolean; // trigger recalculation when card opens
}

interface Position {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export const useSmartPosition = ({
  hotspotX,
  hotspotY,
  cardWidth,
  cardHeight,
  containerRef,
  margin = 12,
  isOpen,
}: UseSmartPositionProps): Position => {
  const [position, setPosition] = useState<Position>({});

  useEffect(() => {
    if (!containerRef.current || !isOpen) return;

    const container = containerRef.current.getBoundingClientRect();
    
    // Convert hotspot percentages to pixel coordinates
    const hotspotPixelX = hotspotX * container.width;
    const hotspotPixelY = hotspotY * container.height;

    // Default offset from hotspot (20px)
    const offset = 20;

    // Try bottom-right first (default)
    let preferredLeft = hotspotPixelX + offset;
    let preferredTop = hotspotPixelY + offset;

    // Check right boundary - flip to left if clipped
    if (preferredLeft + cardWidth > container.width - margin) {
      preferredLeft = hotspotPixelX - cardWidth - offset;
    }

    // Check bottom boundary - flip to top if clipped
    if (preferredTop + cardHeight > container.height - margin) {
      preferredTop = hotspotPixelY - cardHeight - offset;
    }

    // Ensure minimum margin from all edges
    preferredLeft = Math.max(margin, Math.min(preferredLeft, container.width - cardWidth - margin));
    preferredTop = Math.max(margin, Math.min(preferredTop, container.height - cardHeight - margin));

    setPosition({
      left: preferredLeft,
      top: preferredTop,
    });
  }, [hotspotX, hotspotY, cardWidth, cardHeight, containerRef, margin, isOpen]);

  return position;
};
