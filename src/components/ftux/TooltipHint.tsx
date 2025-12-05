import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TooltipHintProps {
  title: string;
  subtitle?: string;
  position?: "top" | "bottom" | "left" | "right";
  show: boolean;
  onDismiss: () => void;
  className?: string;
}

const TooltipHint = ({
  title,
  subtitle,
  position = "top",
  show,
  onDismiss,
  className,
}: TooltipHintProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };

    // Delay adding listener to prevent immediate dismiss
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [show, onDismiss]);

  if (!show) return null;

  const arrowClasses = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white",
    right: "left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white",
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "bg-white rounded-xl shadow-lg border border-border/30 px-4 py-3",
        "animate-fade-in",
        "max-w-[220px]",
        className
      )}
    >
      <p className="text-[14px] font-semibold text-foreground leading-tight">
        {title}
      </p>
      {subtitle && (
        <p className="text-[12px] text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
      {/* Arrow */}
      <div
        className={cn(
          "absolute w-0 h-0 border-[6px]",
          arrowClasses[position]
        )}
      />
    </div>
  );
};

export default TooltipHint;
