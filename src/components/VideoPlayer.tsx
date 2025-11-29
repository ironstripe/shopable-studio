import { useRef, useState, useEffect } from "react";
import { Hotspot, Product } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";
import HotspotInlineEditor from "./HotspotInlineEditor";
import VideoUploadZone from "./VideoUploadZone";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoSrc: string | null;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspot: Hotspot | null;
  activeToolbarHotspotId: string | null;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  onAddHotspot: (x: number, y: number, time: number) => void;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onHotspotSelect: (hotspotId: string) => void;
  onUpdateHotspotPosition: (hotspotId: string, x: number, y: number) => void;
  onUpdateHotspotScale: (hotspotId: string, scale: number) => void;
  onUpdateProduct: (product: Product) => void;
  onCreateProduct: (product: Omit<Product, "id">) => string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onVideoLoad: (src: string) => void;
  shouldAutoOpenProductPanel?: boolean;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  selectedHotspot,
  activeToolbarHotspotId,
  isPreviewMode,
  onTogglePreviewMode,
  onAddHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onHotspotSelect,
  onUpdateHotspotPosition,
  onUpdateHotspotScale,
  onUpdateProduct,
  onCreateProduct,
  onVideoRef,
  onVideoLoad,
  shouldAutoOpenProductPanel,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showShopButton, setShowShopButton] = useState(true);
  const [draggingHotspot, setDraggingHotspot] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [resizingHotspot, setResizingHotspot] = useState<{
    id: string;
    initialScale: number;
    initialDistance: number;
  } | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current);
    }
  }, [onVideoRef]);

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
  }, [videoSrc]);


  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !containerRef.current) return;
    
    // Force sync currentTime state with actual video time
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onAddHotspot(x, y, actualTime);
    videoRef.current.pause();
  };

  const handleDragStart = (hotspot: Hotspot, e: React.MouseEvent) => {
    if (isPreviewMode || !containerRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - hotspot.x;
    const offsetY = (e.clientY - rect.top) / rect.height - hotspot.y;
    
    setDraggingHotspot({ id: hotspot.id, offsetX, offsetY });
    setDidDrag(false);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggingHotspot || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width - draggingHotspot.offsetX));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height - draggingHotspot.offsetY));
    
    onUpdateHotspotPosition(draggingHotspot.id, x, y);
    setDidDrag(true);
  };

  const handleDragEnd = () => {
    setDraggingHotspot(null);
  };

  const getDistanceFromCenter = (hotspot: Hotspot, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    
    const centerX = rect.left + hotspot.x * rect.width;
    const centerY = rect.top + hotspot.y * rect.height;
    
    return Math.sqrt(
      Math.pow(clientX - centerX, 2) + 
      Math.pow(clientY - centerY, 2)
    );
  };

  const handleResizeStart = (hotspot: Hotspot, e: React.MouseEvent) => {
    if (isPreviewMode || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const initialDistance = getDistanceFromCenter(hotspot, e.clientX, e.clientY);
    
    setResizingHotspot({
      id: hotspot.id,
      initialScale: hotspot.scale,
      initialDistance: Math.max(initialDistance, 10),
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingHotspot) return;
    
    const hotspot = hotspots.find(h => h.id === resizingHotspot.id);
    if (!hotspot) return;
    
    const currentDistance = getDistanceFromCenter(hotspot, e.clientX, e.clientY);
    const scaleRatio = currentDistance / resizingHotspot.initialDistance;
    const newScale = Math.min(2, Math.max(0.5, resizingHotspot.initialScale * scaleRatio));
    
    onUpdateHotspotScale(resizingHotspot.id, newScale);
  };

  const handleResizeEnd = () => {
    setResizingHotspot(null);
  };

  useEffect(() => {
    if (draggingHotspot) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
    if (resizingHotspot) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [draggingHotspot, resizingHotspot]);

  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (didDrag) {
      setDidDrag(false);
      return;
    }
    
    if (isPreviewMode) {
      if (!hotspot.productId) return; // Skip if no product assigned
      const product = products[hotspot.productId];
      if (!product) return;
      
      switch (hotspot.clickBehavior) {
        case "direct-link":
          window.open(product.link, "_blank");
          break;
        
        case "no-action":
          videoRef.current?.pause();
          setSelectedProduct(product);
          setShowShopButton(false);
          break;
        
        case "show-card":
        default:
          videoRef.current?.pause();
          setSelectedProduct(product);
          setShowShopButton(true);
          break;
      }
    } else {
      onHotspotSelect(hotspot.id);
    }
  };

  const activeHotspots = hotspots.filter((h) => {
    const isInTimeRange = currentTime >= h.timeStart && currentTime <= h.timeEnd;
    
    // In preview mode, only show hotspots with assigned products
    if (isPreviewMode && !h.productId) {
      return false;
    }
    
    return isInTimeRange;
  });

  // Debug logging
  useEffect(() => {
    console.log('[VideoPlayer] videoSrc changed:', videoSrc);
    console.log('[VideoPlayer] isPreviewMode:', isPreviewMode);
  }, [videoSrc, isPreviewMode]);

  return (
    <div className="w-full max-w-[960px] mx-auto">
      {/* Mode Controls - Above Video */}
      {videoSrc && (
        <div className="flex flex-col items-center mb-6">
          {/* Segmented Toggle */}
          <div className="inline-flex items-center rounded-lg bg-white border border-[rgba(0,0,0,0.12)] p-0.5 shadow-sm">
            <button
              onClick={() => isPreviewMode && onTogglePreviewMode()}
              className={cn(
                "px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150",
                !isPreviewMode
                  ? "bg-[#3B82F6] text-white shadow-sm"
                  : "bg-transparent text-[#6B7280] hover:bg-[rgba(59,130,246,0.05)]"
              )}
            >
              Edit Hotspots
            </button>
            <button
              onClick={() => !isPreviewMode && onTogglePreviewMode()}
              className={cn(
                "px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150",
                isPreviewMode
                  ? "bg-[#3B82F6] text-white shadow-sm"
                  : "bg-transparent text-[#6B7280] hover:bg-[rgba(59,130,246,0.05)]"
              )}
            >
              Preview
            </button>
          </div>

          {/* Helper Text */}
          {!isPreviewMode && (
            <p className="text-[12px] text-[#6B7280] mt-3 text-center">
              ✎ Edit mode – click in the video to add a hotspot.
            </p>
          )}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full">
        <div
          ref={containerRef}
          className={cn(
            "relative w-full overflow-visible transition-all duration-200",
            videoSrc && "bg-gradient-to-br from-[#101010] to-[#181818] rounded-[14px] p-1",
            videoSrc && "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
            videoSrc && !isPreviewMode && "ring-2 ring-[rgba(59,130,246,0.4)]"
          )}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              className="w-full max-w-full h-auto rounded-[12px] animate-video-enter"
              style={{ display: "block" }}
            />
          ) : (
            <VideoUploadZone onVideoLoad={onVideoLoad} />
          )}

          {/* Click overlay for hotspot placement - covers video except controls (only in edit mode) */}
          {videoSrc && !isPreviewMode && (
            <div
              className="absolute inset-0 bottom-[50px] hotspot-placement-cursor z-[5]"
              onClick={handleOverlayClick}
            />
          )}

          {/* Hotspots overlay - absolutely positioned over video */}
          {videoSrc && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              {activeHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(hotspot, e);
                  }}
                >
                  <VideoHotspot
                    hotspot={hotspot}
                    currentTime={currentTime}
                    isSelected={selectedHotspot?.id === hotspot.id || activeToolbarHotspotId === hotspot.id}
                    isDragging={draggingHotspot?.id === hotspot.id}
                    isResizing={resizingHotspot?.id === hotspot.id}
                    isEditMode={!isPreviewMode}
                    onClick={(e) => handleHotspotClick(hotspot, e)}
                    onDragStart={(e) => handleDragStart(hotspot, e)}
                    onResizeStart={(e) => handleResizeStart(hotspot, e)}
                  />
                  {!isPreviewMode && (selectedHotspot?.id === hotspot.id || activeToolbarHotspotId === hotspot.id) && !draggingHotspot && (
                    <HotspotInlineEditor
                      hotspot={hotspot}
                      products={products}
                      onUpdateHotspot={onUpdateHotspot}
                      onDeleteHotspot={() => onDeleteHotspot(hotspot.id)}
                      onUpdateProduct={onUpdateProduct}
                      onCreateProduct={onCreateProduct}
                      autoOpenProductPanel={shouldAutoOpenProductPanel && !hotspot.productId}
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
            showShopButton={showShopButton}
            onClose={() => {
              setSelectedProduct(null);
              setShowShopButton(true);
              videoRef.current?.play();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
