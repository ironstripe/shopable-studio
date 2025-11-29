interface EmptyHotspotIndicatorProps {
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  scale: number;
}

const EmptyHotspotIndicator = ({ 
  index, 
  isSelected, 
  isDragging, 
  isResizing,
  scale 
}: EmptyHotspotIndicatorProps) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${24 * scale}px`,
        height: `${24 * scale}px`,
        borderRadius: '50%',
        background: '#E5E7EB',
        color: '#374151',
        fontSize: `${11 * scale}px`,
        fontWeight: 600,
        boxShadow: isSelected 
          ? '0 2px 8px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3)'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging || isResizing ? 'none' : 'all 0.15s ease',
        transform: isSelected && !isDragging && !isResizing ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {index}
    </div>
  );
};

export default EmptyHotspotIndicator;
