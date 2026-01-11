import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreationModeHintProps {
  isVisible: boolean;
}

const CreationModeHint = ({ isVisible }: CreationModeHintProps) => {
  const [hasShown, setHasShown] = useState(false);
  const [isFaded, setIsFaded] = useState(false);

  // Show hint when entering creation mode, then fade after 2.5 seconds
  useEffect(() => {
    if (isVisible && !hasShown) {
      setHasShown(true);
      setIsFaded(false);
      
      const timer = setTimeout(() => {
        setIsFaded(true);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset when leaving creation mode
    if (!isVisible) {
      setHasShown(false);
      setIsFaded(false);
    }
  }, [isVisible, hasShown]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "absolute top-14 left-1/2 -translate-x-1/2 z-30",
        "transition-opacity duration-500",
        isFaded ? "opacity-40" : "opacity-100"
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-full shadow-lg">
        <Plus className="w-3.5 h-3.5 animate-icon-pulse" />
        <span className="text-xs font-medium whitespace-nowrap">Tap to add hotspot</span>
      </div>
    </div>
  );
};

export default CreationModeHint;
