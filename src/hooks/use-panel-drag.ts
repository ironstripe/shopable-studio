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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    if (!touch) return;
    
    e.stopPropagation();
    isDraggingRef.current = true;
    startMouseRef.current = { x: touch.clientX, y: touch.clientY };
    startOffsetRef.current = { ...offset };
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

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      e.preventDefault(); // Prevent scroll while dragging
      
      const deltaX = touch.clientX - startMouseRef.current.x;
      const deltaY = touch.clientY - startMouseRef.current.y;
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

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  const resetOffset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return {
    offset,
    resetOffset,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      style: { cursor: enabled ? "grab" : "default", touchAction: "none" } as React.CSSProperties,
    },
  };
}
