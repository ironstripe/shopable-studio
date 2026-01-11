import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StatusPillProps {
  completeCount: number;
  totalCount: number;
  className?: string;
}

/**
 * Non-clickable status pill showing hotspot completion progress.
 * - Yellow/neutral when incomplete: "2 of 3 hotspots complete"
 * - Green when all complete: "All hotspots complete ✓"
 */
const StatusPill = ({ completeCount, totalCount, className }: StatusPillProps) => {
  if (totalCount === 0) return null;

  const allComplete = completeCount === totalCount;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none select-none",
        allComplete
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-amber-50 text-amber-700 border border-amber-200",
        className
      )}
    >
      {allComplete ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>All hotspots complete</span>
        </>
      ) : (
        <span>{completeCount} of {totalCount} hotspots complete</span>
      )}
    </div>
  );
};

export default StatusPill;
