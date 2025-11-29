import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { VideoCTA as VideoCTAType } from "@/types/video";

interface VideoCTAProps {
  videoCTA: VideoCTAType;
  currentTime: number;
  videoDuration: number;
  containerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

const VideoCTA = ({ videoCTA, currentTime, videoDuration, containerRef, isPlaying }: VideoCTAProps) => {
  const [position, setPosition] = useState({ bottom: 24, right: 24 });
  const [isVisible, setIsVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Calculate visibility based on mode
  useEffect(() => {
    if (videoCTA.mode === "off") {
      setIsVisible(false);
      return;
    }

    if (videoCTA.mode === "always-visible") {
      setIsVisible(isPlaying);
      return;
    }

    if (videoCTA.mode === "show-at-end") {
      const timeRemaining = videoDuration - currentTime;
      setIsVisible(timeRemaining <= 3 && timeRemaining > 0 && isPlaying);
      return;
    }
  }, [videoCTA.mode, currentTime, videoDuration, isPlaying]);

  // Calculate position based on video container
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPosition({
        bottom: window.innerHeight - rect.bottom + 24,
        right: window.innerWidth - rect.right + 24,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [containerRef]);

  const handleClick = () => {
    if (videoCTA.url) {
      window.open(videoCTA.url, "_blank");
    }
  };

  if (!isVisible || !videoCTA.url) return null;

  const ctaElement = (
    <div
      ref={ctaRef}
      style={{
        position: "fixed",
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
      }}
      className="animate-fade-in"
    >
      <button
        onClick={handleClick}
        className="bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 text-neutral-900 text-[13px] font-medium backdrop-blur-sm"
      >
        {videoCTA.label}
      </button>
    </div>
  );

  return createPortal(ctaElement, document.body);
};

export default VideoCTA;
