interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
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
  );
}
