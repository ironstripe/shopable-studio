import { useRef, useState, useEffect, useCallback } from "react";
import { Hotspot, Product, VideoCTA as VideoCTAType, VERTICAL_SOCIAL_SAFE_ZONE } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";
import HotspotInlineEditor from "./HotspotInlineEditor";
import VideoUploadZone from "./VideoUploadZone";
import VideoCTA from "./VideoCTA";
import SafeZoneOverlay from "./SafeZoneOverlay";
import TapIndicator from "./TapIndicator";
import GhostHotspot from "./GhostHotspot";
import { cn } from "@/lib/utils";
import { isPointInSafeZone, clampPositionToSafeZone } from "@/utils/safe-zone";

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
  onOpenProductSelection: (hotspotId: string) => void;
  onOpenLayoutSheet: (hotspot: Hotspot) => void;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onVideoLoad: (src: string) => void;
  shouldAutoOpenProductPanel?: boolean;
  highlightedHotspotId?: string | null;
  videoCTA?: VideoCTAType;
  onUpdateVideoCTA?: (cta: VideoCTAType) => void;
  showSafeZones?: boolean;
  isMobile?: boolean;
  showPlacementHint?: boolean;
  onPlacementHintDismiss?: () => void;
  onHotspotDragEnd?: (hotspotId: string) => void;
  isDeferringToolbar?: boolean;
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
  onOpenProductSelection,
  onOpenLayoutSheet,
  onVideoRef,
  onVideoLoad,
  shouldAutoOpenProductPanel,
  highlightedHotspotId,
  videoCTA,
  onUpdateVideoCTA,
  showSafeZones = false,
  isMobile = false,
  showPlacementHint = false,
  onPlacementHintDismiss,
  onHotspotDragEnd,
  isDeferringToolbar = false,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductHotspot, setSelectedProductHotspot] = useState<Hotspot | null>(null);
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
  const [safeZoneTooltip, setSafeZoneTooltip] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });
  const [tapIndicators, setTapIndicators] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [pendingDragPosition, setPendingDragPosition] = useState<{
    x: number;
    y: number;
    hotspotCount: number;
  } | null>(null);
  
  // Ghost hotspot state for two-step placement
  const [ghostHotspot, setGhostHotspot] = useState<{
    x: number;
    y: number;
    time: number;
    isDragging: boolean;
  } | null>(null);
  const autoCommitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ghostDragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const removeTapIndicator = useCallback((id: string) => {
    setTapIndicators(prev => prev.filter(t => t.id !== id));
  }, []);

  // Clear ghost hotspot and related states when video is removed
  useEffect(() => {
    if (!videoSrc) {
      setGhostHotspot(null);
      if (autoCommitTimerRef.current) {
        clearTimeout(autoCommitTimerRef.current);
        autoCommitTimerRef.current = null;
      }
      ghostDragRef.current = null;
      setDraggingHotspot(null);
      setSelectedProduct(null);
      setSelectedProductHotspot(null);
      setTapIndicators([]);
      setPendingDragPosition(null);
    }
  }, [videoSrc]);

  useEffect(() => {
    if (onVideoRef && videoRef.current) {
      onVideoRef(videoRef.current);
    }
  }, [onVideoRef]);

  // iOS Safari fix: explicitly load video when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSrc) {
      console.log('[VideoPlayer] Loading video source:', videoSrc.substring(0, 50));
      video.load();
      
      // iOS Safari: wait for loadedmetadata event before allowing interaction
      const handleLoadedMetadata = () => {
        console.log('[VideoPlayer] Video metadata loaded successfully');
      };
      
      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        console.error('[VideoPlayer] Video error:', target.error?.code, target.error?.message);
      };
      
      const handleCanPlay = () => {
        console.log('[VideoPlayer] Video can play');
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => {
      setIsPlaying(true);
      handleTimeUpdate();
    };
    const handlePause = () => {
      setIsPlaying(false);
      handleTimeUpdate();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoSrc]);

  // Enable immediate drag after hotspot creation on touch
  useEffect(() => {
    if (pendingDragPosition && hotspots.length > pendingDragPosition.hotspotCount) {
      // A new hotspot was created - find it and start dragging
      const tolerance = 0.05;
      const newHotspot = hotspots.find(h => 
        Math.abs(h.x - pendingDragPosition.x) < tolerance &&
        Math.abs(h.y - pendingDragPosition.y) < tolerance
      );
      
      if (newHotspot && !draggingHotspot) {
        console.log('[VideoPlayer] New hotspot detected, enabling immediate drag');
        setDraggingHotspot({ 
          id: newHotspot.id, 
          offsetX: 0, 
          offsetY: 0 
        });
        setDidDrag(false);
        setPendingDragPosition(null);
      }
    }
  }, [hotspots, pendingDragPosition, draggingHotspot]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !containerRef.current) return;
    
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Add tap indicator at click position (pixel coords)
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const indicatorId = `tap-${Date.now()}`;
    setTapIndicators(prev => [...prev, { id: indicatorId, x: pixelX, y: pixelY }]);

    // Check if click is in reserved zone and show tooltip
    const isInSafeZone = isPointInSafeZone(x, y, 'vertical_social');
    if (!isInSafeZone) {
      setSafeZoneTooltip({ x: e.clientX, y: e.clientY, show: true });
      setTimeout(() => setSafeZoneTooltip(prev => ({ ...prev, show: false })), 2500);
    }

    // Dismiss placement hint when hotspot is placed
    if (showPlacementHint && onPlacementHintDismiss) {
      onPlacementHintDismiss();
    }

    onAddHotspot(x, y, actualTime);
    videoRef.current.pause();
  };

  // iOS touch event handler for hotspot placement - two-step ghost placement
  const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current || !containerRef.current) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    // Prevent default to stop click from firing and enable immediate interaction
    e.preventDefault();
    e.stopPropagation();

    console.log('[VideoPlayer] TouchStart on overlay - creating ghost hotspot');
    
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    // Clamp to safe zone
    const { x: safeX, y: safeY } = clampPositionToSafeZone(x, y, 1, 'vertical_social');

    // Add tap indicator at touch position with offset above thumb
    const pixelX = touch.clientX - rect.left;
    const pixelY = touch.clientY - rect.top;
    const indicatorId = `tap-${Date.now()}`;
    setTapIndicators(prev => [...prev, { id: indicatorId, x: pixelX, y: pixelY }]);

    // Check if touch is in reserved zone and show tooltip
    const isInSafeZone = isPointInSafeZone(x, y, 'vertical_social');
    if (!isInSafeZone) {
      setSafeZoneTooltip({ x: touch.clientX, y: touch.clientY, show: true });
      setTimeout(() => setSafeZoneTooltip(prev => ({ ...prev, show: false })), 2500);
    }

    // Dismiss placement hint when hotspot is placed
    if (showPlacementHint && onPlacementHintDismiss) {
      onPlacementHintDismiss();
    }

    // Create ghost hotspot for two-step placement
    setGhostHotspot({
      x: safeX,
      y: safeY,
      time: actualTime,
      isDragging: true,
    });
    
    // Store offset for drag
    ghostDragRef.current = { offsetX: 0, offsetY: 0 };

    videoRef.current.pause();
  };

  // Mouse drag handlers
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

  // Touch drag handlers (iOS)
  const handleTouchDragStart = (hotspot: Hotspot, e: React.TouchEvent) => {
    if (isPreviewMode || !containerRef.current) return;
    
    e.stopPropagation();
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = (touch.clientX - rect.left) / rect.width - hotspot.x;
    const offsetY = (touch.clientY - rect.top) / rect.height - hotspot.y;
    
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

  const handleTouchDragMove = (e: TouchEvent) => {
    // Handle ghost hotspot dragging
    if (ghostHotspot?.isDragging && containerRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;
      
      const { x: safeX, y: safeY } = clampPositionToSafeZone(x, y, 1, 'vertical_social');
      
      setGhostHotspot(prev => prev ? { ...prev, x: safeX, y: safeY } : null);
      return;
    }
    
    if (!draggingHotspot || !containerRef.current) return;
    
    e.preventDefault(); // Prevent scroll while dragging
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width - draggingHotspot.offsetX));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height - draggingHotspot.offsetY));
    
    onUpdateHotspotPosition(draggingHotspot.id, x, y);
    setDidDrag(true);
  };

  const handleDragEnd = () => {
    // Handle ghost hotspot finger lift
    if (ghostHotspot?.isDragging) {
      setGhostHotspot(prev => prev ? { ...prev, isDragging: false } : null);
      
      // Auto-commit after 200ms if no further interaction
      autoCommitTimerRef.current = setTimeout(() => {
        commitGhostHotspot();
      }, 200);
      return;
    }
    
    const draggedId = draggingHotspot?.id;
    setDraggingHotspot(null);
    setPendingDragPosition(null);
    
    // Notify parent that drag ended so it can open panel
    if (draggedId && onHotspotDragEnd) {
      onHotspotDragEnd(draggedId);
    }
  };
  
  // Commit ghost hotspot to real hotspot
  const commitGhostHotspot = useCallback(() => {
    if (!ghostHotspot) return;
    
    // Clear any pending timer
    if (autoCommitTimerRef.current) {
      clearTimeout(autoCommitTimerRef.current);
      autoCommitTimerRef.current = null;
    }
    
    // Create actual hotspot
    onAddHotspot(ghostHotspot.x, ghostHotspot.y, ghostHotspot.time);
    setGhostHotspot(null);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [ghostHotspot, onAddHotspot]);
  
  // Cancel ghost hotspot
  const cancelGhostHotspot = useCallback(() => {
    if (autoCommitTimerRef.current) {
      clearTimeout(autoCommitTimerRef.current);
      autoCommitTimerRef.current = null;
    }
    setGhostHotspot(null);
  }, []);

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

  // Mouse resize handlers
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

  // Touch resize handlers (iOS)
  const handleTouchResizeStart = (hotspot: Hotspot, e: React.TouchEvent) => {
    if (isPreviewMode || !containerRef.current) return;
    
    e.stopPropagation();
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const initialDistance = getDistanceFromCenter(hotspot, touch.clientX, touch.clientY);
    
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

  const handleTouchResizeMove = (e: TouchEvent) => {
    if (!resizingHotspot) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const hotspot = hotspots.find(h => h.id === resizingHotspot.id);
    if (!hotspot) return;
    
    const currentDistance = getDistanceFromCenter(hotspot, touch.clientX, touch.clientY);
    const scaleRatio = currentDistance / resizingHotspot.initialDistance;
    const newScale = Math.min(2, Math.max(0.5, resizingHotspot.initialScale * scaleRatio));
    
    onUpdateHotspotScale(resizingHotspot.id, newScale);
  };

  const handleResizeEnd = () => {
    setResizingHotspot(null);
  };

  // Event listeners for drag and resize (mouse + touch)
  useEffect(() => {
    // Ghost hotspot dragging (touch placement)
    if (ghostHotspot?.isDragging) {
      document.addEventListener('touchmove', handleTouchDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('touchcancel', handleDragEnd);
      };
    }
    
    if (draggingHotspot) {
      // Mouse events
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      // Touch events (iOS)
      document.addEventListener('touchmove', handleTouchDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleTouchDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('touchcancel', handleDragEnd);
      };
    }
    if (resizingHotspot) {
      // Mouse events
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      // Touch events (iOS)
      document.addEventListener('touchmove', handleTouchResizeMove, { passive: false });
      document.addEventListener('touchend', handleResizeEnd);
      document.addEventListener('touchcancel', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleTouchResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
        document.removeEventListener('touchcancel', handleResizeEnd);
      };
    }
  }, [draggingHotspot, resizingHotspot, hotspots, ghostHotspot?.isDragging]);

  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (didDrag) {
      setDidDrag(false);
      return;
    }
    
    if (isPreviewMode) {
      if (!hotspot.productId) return;
      const product = products[hotspot.productId];
      if (!product) return;
      
      switch (hotspot.clickBehavior) {
        case "direct-link":
          window.open(product.link, "_blank");
          break;
        case "no-action":
          videoRef.current?.pause();
          setSelectedProduct(product);
          setSelectedProductHotspot(hotspot);
          setShowShopButton(false);
          break;
        case "show-card":
        default:
          videoRef.current?.pause();
          setSelectedProduct(product);
          setSelectedProductHotspot(hotspot);
          setShowShopButton(true);
          break;
      }
    } else {
      onHotspotSelect(hotspot.id);
    }
  };

  const activeHotspots = hotspots.filter((h) => {
    const isInTimeRange = currentTime >= h.timeStart && currentTime <= h.timeEnd;
    const isSelectedOrActive = selectedHotspot?.id === h.id || activeToolbarHotspotId === h.id;
    
    if (isPreviewMode && !h.productId) return false;
    
    return isInTimeRange || (!isPreviewMode && isSelectedOrActive);
  });

  const assignedHotspots = hotspots.filter(h => h.productId);
  const unassignedHotspots = hotspots.filter(h => !h.productId);
  
  const getHotspotIndex = (hotspot: Hotspot) => {
    if (hotspot.productId) {
      return assignedHotspots.findIndex(h => h.id === hotspot.id) + 1;
    } else {
      return unassignedHotspots.findIndex(h => h.id === hotspot.id) + 1;
    }
  };

  return (
    <div className={cn("w-full mx-auto", isMobile ? "max-w-full" : "max-w-[960px]")}>
      {/* Mode Controls - Above Video (Desktop only) */}
      {videoSrc && !isMobile && (
        <div className="flex flex-col items-center mb-6">
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
            "relative w-full min-h-[300px] overflow-visible transition-all duration-200",
            isMobile && "aspect-[9/16] max-h-[80vh]",
            videoSrc && "bg-gradient-to-br from-[#101010] to-[#181818] rounded-[14px] p-1",
            videoSrc && "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
            videoSrc && !isPreviewMode && "ring-2 ring-[rgba(59,130,246,0.4)]"
          )}
          style={{
            minHeight: videoSrc ? '200px' : undefined,
          }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              controls={!isMobile}
              playsInline
              // @ts-ignore - webkit-playsinline is needed for older iOS
              webkit-playsinline=""
              muted
              preload="auto"
              autoPlay={false}
              poster=""
              className="w-full h-full min-h-[200px] rounded-[12px] animate-video-enter ios-video-fix"
              style={{ 
                display: "block",
                objectFit: "contain",
                width: "100%",
                height: "100%",
                minHeight: "200px",
              }}
            >
              <source 
                src={videoSrc.startsWith('data:') ? videoSrc : `${videoSrc}#t=0.001`}
                type={
                  videoSrc.startsWith('data:video/') 
                    ? videoSrc.match(/^data:(video\/[^;]+)/)?.[1] || 'video/mp4'
                    : 'video/mp4'
                } 
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <VideoUploadZone onVideoLoad={onVideoLoad} />
          )}

          {/* Safe Zone Overlay - Edit mode only */}
          {videoSrc && !isPreviewMode && showSafeZones && (
            <SafeZoneOverlay safeZone={VERTICAL_SOCIAL_SAFE_ZONE} />
          )}

          {/* Placement hint overlay */}
          {videoSrc && !isPreviewMode && showPlacementHint && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[15]">
              <div className="bg-black/80 text-white px-5 py-3 rounded-xl text-center animate-fade-in shadow-lg">
                <p className="font-medium text-[15px]">Tap on the video</p>
                <p className="text-[13px] text-white/70 mt-0.5">to place your hotspot</p>
              </div>
            </div>
          )}

          {/* Click overlay for hotspot placement (edit mode only) */}
          {videoSrc && !isPreviewMode && (
            <div
              className="absolute inset-0 bottom-[50px] hotspot-placement-cursor z-[5]"
              onClick={handleOverlayClick}
              onTouchStart={handleOverlayTouchStart}
              onTouchEnd={(e) => e.preventDefault()} // Prevent click from double-firing
              style={{
                touchAction: 'none', // Disable all browser touch actions for immediate response
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                backgroundColor: 'rgba(0, 0, 0, 0.001)', // Nearly invisible but detectable on iOS
              }}
            />
          )}

          {/* Tap indicators for hotspot creation feedback */}
          {tapIndicators.map(indicator => (
            <TapIndicator
              key={indicator.id}
              x={indicator.x}
              y={indicator.y}
              isMobile={isMobile}
              onComplete={() => removeTapIndicator(indicator.id)}
            />
          ))}

          {/* Safe zone tooltip feedback */}
          {safeZoneTooltip.show && (
            <div 
              className="fixed z-[200] px-3 py-2 bg-black/85 text-white text-xs rounded-md shadow-lg animate-fade-in pointer-events-none"
              style={{ 
                left: safeZoneTooltip.x + 12, 
                top: safeZoneTooltip.y - 36,
                maxWidth: 220 
              }}
            >
              This area is reserved by platform UI
            </div>
          )}

          {/* Full-Video Link Overlay (preview mode only) */}
          {videoSrc && isPreviewMode && videoCTA?.enabled && videoCTA.type === "full-video-link" && videoCTA.url && (
            <div
              className="absolute inset-0 bottom-[50px] cursor-pointer z-[4] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const normalizeUrl = (url: string): string => {
                  if (!url) return url;
                  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
                  return url;
                };
                window.open(normalizeUrl(videoCTA.url), "_blank");
              }}
            />
          )}

          {/* Ghost hotspot for two-step placement */}
          {ghostHotspot && (
            <GhostHotspot
              x={ghostHotspot.x}
              y={ghostHotspot.y}
              scale={1}
              isDragging={ghostHotspot.isDragging}
              onCommit={commitGhostHotspot}
              onCancel={cancelGhostHotspot}
            />
          )}

          {/* Hotspots overlay */}
          {videoSrc && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              {activeHotspots.map((hotspot) => {
                const product = hotspot.productId ? products[hotspot.productId] : null;
                const price = product?.price;
                const isThisSelected = selectedHotspot?.id === hotspot.id || activeToolbarHotspotId === hotspot.id;
                const isAnyHotspotEditing = activeToolbarHotspotId !== null || selectedHotspot !== null;
                
                return (
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
                      isSelected={isThisSelected}
                      isDragging={draggingHotspot?.id === hotspot.id}
                      isResizing={resizingHotspot?.id === hotspot.id}
                      isEditMode={!isPreviewMode}
                      onClick={(e) => handleHotspotClick(hotspot, e)}
                      onDragStart={(e) => handleDragStart(hotspot, e)}
                      onTouchDragStart={(e) => handleTouchDragStart(hotspot, e)}
                      onResizeStart={(e) => handleResizeStart(hotspot, e)}
                      onTouchResizeStart={(e) => handleTouchResizeStart(hotspot, e)}
                      price={price}
                      hotspotIndex={getHotspotIndex(hotspot)}
                      hasProduct={!!hotspot.productId}
                      isHighlighted={highlightedHotspotId === hotspot.id}
                      isAnyEditing={isAnyHotspotEditing}
                    />
                    {!isPreviewMode && isThisSelected && !draggingHotspot && !ghostHotspot && !isDeferringToolbar && (
                      <HotspotInlineEditor
                        hotspot={hotspot}
                        products={products}
                        onUpdateHotspot={onUpdateHotspot}
                        onDeleteHotspot={() => onDeleteHotspot(hotspot.id)}
                        onOpenProductSelection={onOpenProductSelection}
                        onOpenLayoutSheet={onOpenLayoutSheet}
                        autoOpenProductPanel={shouldAutoOpenProductPanel && !hotspot.productId}
                        containerRef={containerRef}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedProduct && selectedProductHotspot && (
          <ProductCard
            product={selectedProduct}
            showShopButton={showShopButton}
            cardStyle={selectedProductHotspot.cardStyle || "retail-compact"}
            hotspotPosition={{ x: selectedProductHotspot.x, y: selectedProductHotspot.y }}
            containerRef={containerRef}
            onClose={() => {
              setSelectedProduct(null);
              setSelectedProductHotspot(null);
              setShowShopButton(true);
              videoRef.current?.play();
            }}
          />
        )}

        {/* Video CTA */}
        {videoCTA && videoRef.current && (
          <VideoCTA
            videoCTA={videoCTA}
            currentTime={currentTime}
            videoDuration={videoRef.current.duration || 0}
            containerRef={containerRef}
            isPlaying={isPlaying}
            isEditMode={!isPreviewMode}
            onPositionUpdate={(x, y) => {
              if (onUpdateVideoCTA) {
                onUpdateVideoCTA({ ...videoCTA, position: { x, y } });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
