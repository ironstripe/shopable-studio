import { useState, useRef, useCallback, useEffect } from "react";

interface UsePanelResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth: number;
}

export function usePanelResize(options: UsePanelResizeOptions) {
  const { minWidth = 200, maxWidth = 600, defaultWidth } = options;
  const [width, setWidth] = useState(defaultWidth);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minWidth, maxWidth]);

  return {
    width,
    resizeHandleProps: {
      onMouseDown: handleMouseDown,
    },
  };
}
