import { useState } from "react";
import { cn } from "@/lib/utils";
import shopableLogo from "@/assets/shopable-logo.png";

interface WelcomeOverlayProps {
  onStart: () => void;
}

const WelcomeOverlay = ({ onStart }: WelcomeOverlayProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onStart();
    }, 200);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white",
        "transition-opacity duration-200",
        isExiting ? "opacity-0" : "opacity-100 animate-fade-in"
      )}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-sm">
        {/* Logo */}
        <img
          src={shopableLogo}
          alt="Shopable"
          className="w-[160px] h-auto mb-8"
        />

        {/* Title */}
        <h1 className="text-[24px] font-semibold text-foreground mb-2">
          Welcome to Shopable.
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] text-muted-foreground mb-10">
          Turn your video into a shop.
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className={cn(
            "w-full max-w-[260px] h-12 rounded-full",
            "bg-primary text-primary-foreground",
            "text-[16px] font-medium",
            "hover:bg-primary/90 active:scale-[0.98]",
            "transition-all duration-150",
            "shadow-sm"
          )}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
