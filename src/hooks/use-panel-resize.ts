import { useState, useRef, useCallback, useEffect } from "react";

interface UsePanelResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  defaultWidth: number;
  defaultHeight: number;
}

type ResizeMode = 'width' | 'height' | 'both';

export function usePanelResize(options: UsePanelResizeOptions) {
  const { minWidth = 200, maxWidth = 600, minHeight = 200, maxHeight = 600, defaultWidth, defaultHeight } = options;
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const isResizingRef = useRef(false);
  const resizeModeRef = useRef<ResizeMode>('both');
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleRightEdgeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    resizeModeRef.current = 'width';
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightRef.current = height;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [width, height]);

  const handleBottomEdgeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    resizeModeRef.current = 'height';
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightRef.current = height;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, [width, height]);

  const handleCornerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    resizeModeRef.current = 'both';
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightRef.current = height;
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
  }, [width, height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;
      
      if (resizeModeRef.current === 'width' || resizeModeRef.current === 'both') {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
        setWidth(newWidth);
      }
      
      if (resizeModeRef.current === 'height' || resizeModeRef.current === 'both') {
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));
        setHeight(newHeight);
      }
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
  }, [minWidth, maxWidth, minHeight, maxHeight]);

  return {
    width,
    height,
    rightEdgeProps: {
      onMouseDown: handleRightEdgeMouseDown,
    },
    bottomEdgeProps: {
      onMouseDown: handleBottomEdgeMouseDown,
    },
    cornerProps: {
      onMouseDown: handleCornerMouseDown,
    },
  };
}
