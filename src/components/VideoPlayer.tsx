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
  onAddHotspot: (x: number, y: number, time: number) => void;
  onEditHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  selectedHotspot,
  onAddHotspot,
  onEditHotspot,
  onDeleteHotspot,
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
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const time = videoRef.current.currentTime;

    onAddHotspot(x, y, time);
  };

  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products[hotspot.productId];
    if (product) {
      setSelectedProduct(product);
    }
  };

  const activeHotspots = hotspots.filter(
    (h) => currentTime >= h.timeStart && currentTime <= h.timeEnd
  );

  return (
    <div className="relative w-full max-w-[960px] mx-auto">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden"
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

        {activeHotspots.map((hotspot) => (
          <>
            <VideoHotspot
              key={hotspot.id}
              hotspot={hotspot}
              currentTime={currentTime}
              isSelected={selectedHotspot?.id === hotspot.id}
              onClick={(e) => handleHotspotClick(hotspot, e)}
            />
            <HotspotToolbar
              key={`toolbar-${hotspot.id}`}
              hotspot={hotspot}
              onEdit={() => onEditHotspot(hotspot)}
              onDelete={() => onDeleteHotspot(hotspot.id)}
            />
          </>
        ))}
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
