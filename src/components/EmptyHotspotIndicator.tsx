import { Plus } from "lucide-react";

interface EmptyHotspotIndicatorProps {
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  scale: number;
  isEditMode?: boolean;
}

const EmptyHotspotIndicator = ({ 
  index, 
  isSelected, 
  isDragging, 
  isResizing,
  scale,
  isEditMode = true,
}: EmptyHotspotIndicatorProps) => {
  // Larger size in Edit mode for easier mobile grabbing (48px base)
  // Smaller size in Preview mode (24px base) - though unassigned hotspots are hidden in preview
  const baseSize = isEditMode ? 48 : 24;
  const fontSize = isEditMode ? 16 : 11;
  const iconSize = isEditMode ? 18 : 12;
  
  return (
    <div
      className="flex items-center justify-center relative"
      style={{
        width: `${baseSize * scale}px`,
        height: `${baseSize * scale}px`,
        minWidth: '44px',  // Minimum touch target per Apple HIG
        minHeight: '44px',
        borderRadius: '50%',
        background: '#E5E7EB',
        border: isSelected ? '3px solid #3B82F6' : '2px solid #3B82F6',
        color: '#374151',
        fontSize: `${fontSize * scale}px`,
        fontWeight: 600,
        boxShadow: isSelected 
          ? '0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging || isResizing ? 'none' : 'all 0.15s ease',
        transform: isSelected && !isDragging && !isResizing ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {/* Show plus icon for unassigned state */}
      <Plus 
        className="text-primary" 
        style={{ 
          width: `${iconSize * scale}px`, 
          height: `${iconSize * scale}px` 
        }} 
      />
      
      {/* Small index badge in corner */}
      <div 
        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
        style={{
          width: `${18 * scale}px`,
          height: `${18 * scale}px`,
          fontSize: `${10 * scale}px`,
          fontWeight: 700,
        }}
      >
        {index}
      </div>
    </div>
  );
};

export default EmptyHotspotIndicator;
