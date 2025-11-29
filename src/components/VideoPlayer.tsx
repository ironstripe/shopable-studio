import { useRef, useState, useEffect } from "react";
import { Hotspot, Product } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";
import HotspotToolbar from "./HotspotToolbar";
import VideoUploadZone from "./VideoUploadZone";
import { Eye, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPlayerProps {
  videoSrc: string | null;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspot: Hotspot | null;
  activeToolbarHotspotId: string | null;
  isPreviewMode: boolean;
  isEditorOpen: boolean;
  onTogglePreviewMode: () => void;
  onAddHotspot: (x: number, y: number, time: number) => void;
  onEditHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onHotspotSelect: (hotspotId: string) => void;
  onUpdateHotspotPosition: (hotspotId: string, x: number, y: number) => void;
  onUpdateHotspotScale: (hotspotId: string, scale: number) => void;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onVideoLoad: (src: string) => void;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  selectedHotspot,
  activeToolbarHotspotId,
  isPreviewMode,
  isEditorOpen,
  onTogglePreviewMode,
  onAddHotspot,
  onEditHotspot,
  onDeleteHotspot,
  onHotspotSelect,
  onUpdateHotspotPosition,
  onUpdateHotspotScale,
  onVideoRef,
  onVideoLoad,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wasEditorOpenRef = useRef(false);
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

  // Resume video when editor panel closes
  useEffect(() => {
    if (wasEditorOpenRef.current === true && isEditorOpen === false) {
      videoRef.current?.play();
    }
    
    wasEditorOpenRef.current = isEditorOpen;
  }, [isEditorOpen]);

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
      const product = products[hotspot.productId];
      if (!product) return;
      
      switch (hotspot.clickBehavior) {
        case "direct-shop":
          window.open(product.link, "_blank");
          break;
        
        case "card-only":
          videoRef.current?.pause();
          setSelectedProduct(product);
          setShowShopButton(false);
          break;
        
        case "card-then-shop":
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

  const activeHotspots = hotspots.filter(
    (h) => currentTime >= h.timeStart && currentTime <= h.timeEnd
  );

  return (
    <div className="relative w-full max-w-[960px] mx-auto">
      {/* Mode Toggle Icon - Fixed Position */}
      {videoSrc && (
        <div className="fixed top-24 right-8 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onTogglePreviewMode}
                  size="icon"
                  variant={isPreviewMode ? "secondary" : "default"}
                  className="rounded-full w-12 h-12 shadow-xl ring-2 ring-white"
                >
                  {isPreviewMode ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <Pencil className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isPreviewMode ? "Preview Mode" : "Hotspot Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-visible"
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            className="w-full animate-fade-in"
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
                {!isPreviewMode && activeToolbarHotspotId === hotspot.id && !draggingHotspot && (
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
          showShopButton={showShopButton}
          onClose={() => {
            setSelectedProduct(null);
            setShowShopButton(true);
            videoRef.current?.play();
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
