import { useState, useRef, useCallback, useEffect } from "react";

interface UsePanelDragOptions {
  enabled?: boolean;
}

export function usePanelDrag(options: UsePanelDragOptions = {}) {
  const { enabled = true } = options;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = { ...offset };
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  }, [enabled, offset]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startMouseRef.current.x;
      const deltaY = e.clientY - startMouseRef.current.y;
      setOffset({
        x: startOffsetRef.current.x + deltaX,
        y: startOffsetRef.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
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
  }, []);

  const resetOffset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return {
    offset,
    resetOffset,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      style: { cursor: enabled ? "grab" : "default" } as React.CSSProperties,
    },
  };
}
