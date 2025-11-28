import { useRef, useState, useEffect } from "react";
import { Hotspot, Product } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";
import HotspotToolbar from "./HotspotToolbar";

interface VideoPlayerProps {
  videoSrc: string | null;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspot: Hotspot | null;
  activeToolbarHotspotId: string | null;
  onAddHotspot: (x: number, y: number, time: number) => void;
  onEditHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onHotspotSelect: (hotspotId: string) => void;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  selectedHotspot,
  activeToolbarHotspotId,
  onAddHotspot,
  onEditHotspot,
  onDeleteHotspot,
  onHotspotSelect,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleTimeUpdate);
    video.addEventListener("play", handleTimeUpdate);
    video.addEventListener("pause", handleTimeUpdate);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleTimeUpdate);
      video.removeEventListener("play", handleTimeUpdate);
      video.removeEventListener("pause", handleTimeUpdate);
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !containerRef.current) return;
    
    // Force sync currentTime state with actual video time
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onAddHotspot(x, y, actualTime);
  };

  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    onHotspotSelect(hotspot.id);
  };

  const activeHotspots = hotspots.filter(
    (h) => currentTime >= h.timeStart && currentTime <= h.timeEnd
  );

  return (
    <div className="relative w-full max-w-[960px] mx-auto">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg"
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            className="w-full"
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-secondary">
            <p className="text-muted-foreground">Upload a video to get started</p>
          </div>
        )}

        {/* Click overlay for hotspot placement - covers video except controls */}
        {videoSrc && (
          <div 
            className="absolute inset-0 bottom-[50px] hotspot-placement-cursor z-[5]"
            onClick={handleOverlayClick}
          />
        )}

        {/* Hotspots overlay - absolutely positioned over video */}
        {videoSrc && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {activeHotspots.map((hotspot) => (
              <div key={hotspot.id} className="pointer-events-auto">
                <VideoHotspot
                  hotspot={hotspot}
                  currentTime={currentTime}
                  isSelected={selectedHotspot?.id === hotspot.id || activeToolbarHotspotId === hotspot.id}
                  onClick={(e) => handleHotspotClick(hotspot, e)}
                />
                {activeToolbarHotspotId === hotspot.id && (
                  <HotspotToolbar
                    hotspot={hotspot}
                    onEdit={() => onEditHotspot(hotspot)}
                    onDelete={() => onDeleteHotspot(hotspot.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductCard
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
