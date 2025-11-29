interface ResizeEdgesProps {
  rightEdgeProps: { onMouseDown: (e: React.MouseEvent) => void };
  bottomEdgeProps: { onMouseDown: (e: React.MouseEvent) => void };
  cornerProps: { onMouseDown: (e: React.MouseEvent) => void };
}

export function ResizeEdges({ rightEdgeProps, bottomEdgeProps, cornerProps }: ResizeEdgesProps) {
  return (
    <>
      {/* Right edge - full height, 6px wide, invisible */}
      <div
        {...rightEdgeProps}
        className="absolute top-0 right-0 w-[6px] h-full cursor-ew-resize z-10"
        style={{ touchAction: "none" }}
      />
      
      {/* Bottom edge - full width, 6px tall, invisible */}
      <div
        {...bottomEdgeProps}
        className="absolute bottom-0 left-0 w-full h-[6px] cursor-ns-resize z-10"
        style={{ touchAction: "none" }}
      />
      
      {/* Corner - 12x12px with visual indicator */}
      <div
        {...cornerProps}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group z-20"
        style={{ touchAction: "none" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="absolute bottom-0 right-0 text-[#D1D5DB] opacity-60 group-hover:opacity-100 transition-opacity"
        >
          <line x1="16" y1="10" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="14" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}
