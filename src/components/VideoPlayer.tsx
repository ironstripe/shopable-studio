import { useRef, useState, useEffect } from "react";
import { Hotspot, Product } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";

interface VideoPlayerProps {
  videoSrc: string | null;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  onAddHotspot: (x: number, y: number, time: number) => void;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  onAddHotspot,
  onSelectHotspot,
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

  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      onSelectHotspot(hotspot);
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
        onDoubleClick={handleVideoDoubleClick}
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

        {activeHotspots.map((hotspot) => (
          <VideoHotspot
            key={hotspot.id}
            hotspot={hotspot}
            currentTime={currentTime}
            onClick={(e) => handleHotspotClick(hotspot, e)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductCard
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            onSelectHotspot(null);
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
