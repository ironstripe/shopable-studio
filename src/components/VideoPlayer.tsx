import { useRef, useState, useEffect, useCallback } from "react";
import { Hotspot, Product, VideoCTA as VideoCTAType } from "@/types/video";
import VideoHotspot from "./VideoHotspot";
import ProductCard from "./ProductCard";
import HotspotInlineEditor from "./HotspotInlineEditor";
import VideoUploadZone from "./VideoUploadZone";
import VideoCTA from "./VideoCTA";
import SafeZoneOverlay from "./SafeZoneOverlay";
import TapIndicator from "./TapIndicator";
import HotspotNavigationPill from "./HotspotNavigationPill";
import NextHotspotChip from "./NextHotspotChip";
import HotspotSavedSnackbar from "./HotspotSavedSnackbar";
import SceneStateBanner from "./SceneStateBanner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { formatPriceDisplay, type CurrencyCode } from "@/utils/price-utils";
import { useLocale } from "@/lib/i18n";
import { isHotspotComplete, SceneState } from "@/hooks/use-scene-state";
import { 
  isPointInSafeZone, 
  clampHotspotTopLeft,
  centerToTopLeft,
  topLeftToCenter,
  getMaxScaleInSafeZone,
  getFallbackDimensions,
} from "@/utils/safe-zone";

interface VideoPlayerProps {
  videoSrc: string | null;
  hotspots: Hotspot[];
  products: Record<string, Product>;
  selectedHotspotId: string | null; // Unified selection state (ID only)
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  onAddHotspot: (x: number, y: number, time: number) => void;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onSelectHotspot: (hotspotId: string | null) => void; // Renamed from onHotspotSelect
  onUpdateHotspotPosition: (hotspotId: string, x: number, y: number) => void;
  onUpdateHotspotScale: (hotspotId: string, scale: number) => void;
  onOpenProductSelection: (hotspotId: string) => void;
  onOpenLayoutSheet: (hotspot: Hotspot) => void;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onVideoLoad: (src: string, videoId?: string) => void;
  onUploadComplete?: () => void;
  shouldAutoOpenProductPanel?: boolean;
  highlightedHotspotId?: string | null;
  videoCTA?: VideoCTAType;
  onUpdateVideoCTA?: (cta: VideoCTAType) => void;
  showSafeZones?: boolean;
  isMobile?: boolean;
  showPlacementHint?: boolean;
  isFirstHotspot?: boolean;
  onHotspotDragEnd?: (hotspotId: string) => void;
  isDeferringToolbar?: boolean;
  hotspotsLoading?: boolean;
  isAddingHotspot?: boolean;
  onExitAddMode?: () => void;
  onToggleAddMode?: () => void;
  showToolbar?: boolean;
  onToolbarDone?: () => void;
  showSavedIndicator?: boolean;
  // Navigation overlay props
  currentHotspotIndex?: number;
  totalHotspotCount?: number;
  onPreviousHotspot?: () => void;
  onNextHotspot?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  nextHotspotTime?: number | null;
  isNextHotspotComplete?: boolean;
  showSnackbar?: boolean;
  incompleteCount?: number;
  allComplete?: boolean;
  onJumpToNext?: () => void;
  onSnackbarDismiss?: () => void;
  // Scene state overlay props
  sceneState?: SceneState;
}

const VideoPlayer = ({
  videoSrc,
  hotspots,
  products,
  selectedHotspotId,
  isPreviewMode,
  onTogglePreviewMode,
  onAddHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onSelectHotspot,
  onUpdateHotspotPosition,
  onUpdateHotspotScale,
  onOpenProductSelection,
  onOpenLayoutSheet,
  onVideoRef,
  onVideoLoad,
  onUploadComplete,
  shouldAutoOpenProductPanel,
  highlightedHotspotId,
  videoCTA,
  onUpdateVideoCTA,
  showSafeZones = false,
  isMobile = false,
  showPlacementHint = false,
  isFirstHotspot = true,
  onHotspotDragEnd,
  isDeferringToolbar = false,
  hotspotsLoading = false,
  isAddingHotspot = false,
  onExitAddMode,
  onToggleAddMode,
  showToolbar = true,
  onToolbarDone,
  showSavedIndicator = false,
  // Navigation overlay props
  currentHotspotIndex = 0,
  totalHotspotCount = 0,
  onPreviousHotspot,
  onNextHotspot,
  canGoPrevious = false,
  canGoNext = false,
  nextHotspotTime = null,
  isNextHotspotComplete = true,
  showSnackbar = false,
  incompleteCount = 0,
  allComplete = false,
  onJumpToNext,
  onSnackbarDismiss,
  sceneState,
}: VideoPlayerProps) => {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
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
  
  // Queue for hotspots that need re-clamping after style/product change
  const [reclampQueue, setReclampQueue] = useState<string[]>([]);
  
  // Store MEASURED dimensions per hotspot (from DOM via onContentMeasure callback)
  const measuredDimensionsRef = useRef<Map<string, { width: number; height: number }>>(new Map());
  
  // Track hotspot state to detect changes that need re-clamping
  const prevHotspotStateRef = useRef<Map<string, { hasProduct: boolean; style: string; scale: number }>>(new Map());
  
  // Callback for VideoHotspot to report measured content dimensions
  const handleContentMeasure = useCallback((hotspotId: string, width: number, height: number) => {
    const prev = measuredDimensionsRef.current.get(hotspotId);
    // Only update if dimensions changed significantly (more than 1px)
    if (!prev || Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1) {
      measuredDimensionsRef.current.set(hotspotId, { width, height });
      // Queue for re-clamp when dimensions change
      setReclampQueue(q => q.includes(hotspotId) ? q : [...q, hotspotId]);
    }
  }, []);
  
  // Get dimensions for a hotspot (measured if available, fallback otherwise)
  const getHotspotDimensions = useCallback((hotspotId: string, hasProduct: boolean) => {
    const measured = measuredDimensionsRef.current.get(hotspotId);
    if (measured && measured.width > 0 && measured.height > 0) {
      return measured;
    }
    return getFallbackDimensions(hasProduct);
  }, []);
  
  // Detect when hotspot state changes and queue for re-clamp
  useEffect(() => {
    hotspots.forEach(hotspot => {
      const prev = prevHotspotStateRef.current.get(hotspot.id);
      const hasProduct = !!hotspot.productId;
      const current = { hasProduct, style: hotspot.style, scale: hotspot.scale };
      
      if (!prev) {
        // New hotspot - queue for initial clamp
        setReclampQueue(q => q.includes(hotspot.id) ? q : [...q, hotspot.id]);
      } else if (prev.hasProduct !== hasProduct || prev.style !== hotspot.style || prev.scale !== hotspot.scale) {
        // State changed - queue for re-clamp
        console.log('[SafeZone] Hotspot state changed, queuing re-clamp:', hotspot.id, { prev, current });
        setReclampQueue(q => q.includes(hotspot.id) ? q : [...q, hotspot.id]);
      }
      
      prevHotspotStateRef.current.set(hotspot.id, current);
    });
  }, [hotspots]);
  
  // Re-clamp hotspots when their dimensions change (product assigned, style changed, ResizeObserver)
  useEffect(() => {
    if (reclampQueue.length === 0 || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    // Process queue in next tick to allow DOM to update
    const timer = setTimeout(() => {
      reclampQueue.forEach(hotspotId => {
        const hotspot = hotspots.find(h => h.id === hotspotId);
        if (!hotspot) return;
        
        // Use MEASURED dimensions (or fallback)
        const { width, height } = getHotspotDimensions(hotspotId, !!hotspot.productId);
        
        // Convert CENTER (stored) to TOP-LEFT for clamping
        const topLeft = centerToTopLeft(
          hotspot.x, hotspot.y, width, height, rect.width, rect.height
        );
        
        // Clamp TOP-LEFT position
        const clampedTopLeft = clampHotspotTopLeft(
          topLeft.x, topLeft.y, width, height, rect.width, rect.height, 'vertical_social'
        );
        
        // Convert back to CENTER for storage
        const center = topLeftToCenter(
          clampedTopLeft.x, clampedTopLeft.y, width, height, rect.width, rect.height
        );
        
        if (clampedTopLeft.wasConstrained) {
          console.log('[SafeZone] Re-clamping hotspot:', hotspotId, { 
            from: { x: hotspot.x, y: hotspot.y }, 
            to: { x: center.x, y: center.y },
            dimensions: { width, height },
            container: { width: rect.width, height: rect.height }
          });
          onUpdateHotspotPosition(hotspotId, center.x, center.y);
        }
      });
      
      // Clear the queue
      setReclampQueue([]);
    }, 50); // Small delay to allow DOM measurement
    
    return () => clearTimeout(timer);
  }, [reclampQueue, hotspots, onUpdateHotspotPosition, getHotspotDimensions]);

  const removeTapIndicator = useCallback((id: string) => {
    setTapIndicators(prev => prev.filter(t => t.id !== id));
  }, []);

  // Clear states when video is removed or changed
  useEffect(() => {
    if (!videoSrc) {
      setDraggingHotspot(null);
      setSelectedProduct(null);
      setSelectedProductHotspot(null);
      setTapIndicators([]);
      setPendingDragPosition(null);
      setIsVideoReady(false);
    } else {
      // Reset ready state when video source changes
      setIsVideoReady(false);
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
        // Explicitly pause and seek to beginning
        video.pause();
        video.currentTime = 0;
      };
      
      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        console.error('[VideoPlayer] Video error:', target.error?.code, target.error?.message);
      };
      
      const handleCanPlay = () => {
        console.log('[VideoPlayer] Video can play - marking as ready');
        // Ensure video is paused at 0:00
        video.pause();
        if (video.currentTime !== 0) {
          video.currentTime = 0;
        }
        // Mark video as ready to display
        setIsVideoReady(true);
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
        console.log('[VideoPlayer] New hotspot detected, enabling immediate drag:', newHotspot.id);
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

  // Handle click on overlay - creates hotspot in edit mode (tap-first approach)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't create hotspot if click originated from an existing hotspot element
    if ((e.target as HTMLElement).closest('.hotspot-draggable')) {
      console.log("[VideoPlayer] Click originated from hotspot, ignoring overlay click");
      return;
    }
    
    console.log("[VideoPlayer] tap to add hotspot (click)", { 
      currentTime: videoRef.current?.currentTime,
      clientX: e.clientX,
      clientY: e.clientY 
    });
    
    if (!videoRef.current || !containerRef.current) return;
    
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Use generous fallback for initial placement (unassigned hotspot ~48px circle)
    const fallbackSize = 60; // Larger fallback for safety
    
    // User tap point is where we want the CENTER of the hotspot
    // Convert to TOP-LEFT for clamping
    const topLeft = centerToTopLeft(x, y, fallbackSize, fallbackSize, rect.width, rect.height);
    
    // Clamp TOP-LEFT position
    const clampedTopLeft = clampHotspotTopLeft(
      topLeft.x, topLeft.y, fallbackSize, fallbackSize, rect.width, rect.height, 'vertical_social'
    );
    
    // Convert back to CENTER for storage (hotspot.x/y stores center position)
    const center = topLeftToCenter(
      clampedTopLeft.x, clampedTopLeft.y, fallbackSize, fallbackSize, rect.width, rect.height
    );
    const safeX = center.x;
    const safeY = center.y;

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

    // Create real hotspot immediately
    onAddHotspot(safeX, safeY, actualTime);
    videoRef.current.pause();
    
    // Exit add mode if it was active
    onExitAddMode?.();
  };

  // iOS touch event handler for hotspot placement - tap-first approach
  const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Don't create hotspot if touch originated from an existing hotspot element
    if ((e.target as HTMLElement).closest('.hotspot-draggable')) {
      console.log("[VideoPlayer] Touch originated from hotspot, ignoring overlay touch");
      return;
    }
    
    if (!videoRef.current || !containerRef.current) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    // Prevent default to stop click from firing and enable immediate interaction
    e.preventDefault();
    e.stopPropagation();

    console.log('[VideoPlayer] TouchStart on overlay - creating real hotspot immediately');
    
    const actualTime = videoRef.current.currentTime;
    setCurrentTime(actualTime);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    // Use generous fallback for initial placement
    const fallbackSize = 60;
    
    // User tap point is where we want the CENTER of the hotspot
    // Convert to TOP-LEFT for clamping
    const topLeft = centerToTopLeft(x, y, fallbackSize, fallbackSize, rect.width, rect.height);
    
    // Clamp TOP-LEFT position
    const clampedTopLeft = clampHotspotTopLeft(
      topLeft.x, topLeft.y, fallbackSize, fallbackSize, rect.width, rect.height, 'vertical_social'
    );
    
    // Convert back to CENTER for storage
    const center = topLeftToCenter(
      clampedTopLeft.x, clampedTopLeft.y, fallbackSize, fallbackSize, rect.width, rect.height
    );
    const safeX = center.x;
    const safeY = center.y;

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

    // Store position for immediate drag after hotspot is created
    setPendingDragPosition({
      x: safeX,
      y: safeY,
      hotspotCount: hotspots.length,
    });

    // Create real hotspot immediately (no ghost hotspot)
    onAddHotspot(safeX, safeY, actualTime);
    videoRef.current.pause();
    
    // Exit add mode if it was active
    onExitAddMode?.();
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
    
    const hotspot = hotspots.find(h => h.id === draggingHotspot.id);
    if (!hotspot) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // rawX, rawY is the proposed CENTER position (offset accounts for drag start offset from center)
    const rawCenterX = (e.clientX - rect.left) / rect.width - draggingHotspot.offsetX;
    const rawCenterY = (e.clientY - rect.top) / rect.height - draggingHotspot.offsetY;
    
    // Use MEASURED dimensions from DOM (or fallback)
    const { width, height } = getHotspotDimensions(hotspot.id, !!hotspot.productId);
    
    // Convert CENTER to TOP-LEFT for clamping
    const topLeft = centerToTopLeft(rawCenterX, rawCenterY, width, height, rect.width, rect.height);
    
    // Clamp TOP-LEFT position
    const clampedTopLeft = clampHotspotTopLeft(
      topLeft.x, topLeft.y, width, height, rect.width, rect.height, 'vertical_social'
    );
    
    // Convert back to CENTER for storage
    const center = topLeftToCenter(
      clampedTopLeft.x, clampedTopLeft.y, width, height, rect.width, rect.height
    );
    
    onUpdateHotspotPosition(draggingHotspot.id, center.x, center.y);
    setDidDrag(true);
  };

  const handleTouchDragMove = (e: TouchEvent) => {
    if (!draggingHotspot || !containerRef.current) return;
    
    e.preventDefault();
    
    const hotspot = hotspots.find(h => h.id === draggingHotspot.id);
    if (!hotspot) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // rawX, rawY is the proposed CENTER position
    const rawCenterX = (touch.clientX - rect.left) / rect.width - draggingHotspot.offsetX;
    const rawCenterY = (touch.clientY - rect.top) / rect.height - draggingHotspot.offsetY;
    
    // Use MEASURED dimensions from DOM (or fallback)
    const { width, height } = getHotspotDimensions(hotspot.id, !!hotspot.productId);
    
    // Convert CENTER to TOP-LEFT for clamping
    const topLeft = centerToTopLeft(rawCenterX, rawCenterY, width, height, rect.width, rect.height);
    
    // Clamp TOP-LEFT position
    const clampedTopLeft = clampHotspotTopLeft(
      topLeft.x, topLeft.y, width, height, rect.width, rect.height, 'vertical_social'
    );
    
    // Convert back to CENTER for storage
    const center = topLeftToCenter(
      clampedTopLeft.x, clampedTopLeft.y, width, height, rect.width, rect.height
    );
    
    onUpdateHotspotPosition(draggingHotspot.id, center.x, center.y);
    setDidDrag(true);
  };

  const handleDragEnd = () => {
    const draggedId = draggingHotspot?.id;
    setDraggingHotspot(null);
    setPendingDragPosition(null);
    
    // Notify parent that drag ended so it can open panel
    if (draggedId && onHotspotDragEnd) {
      onHotspotDragEnd(draggedId);
    }
  };

  const getDistanceFromCenter = useCallback((hotspot: Hotspot, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    
    const centerX = rect.left + hotspot.x * rect.width;
    const centerY = rect.top + hotspot.y * rect.height;
    
    return Math.sqrt(
      Math.pow(clientX - centerX, 2) + 
      Math.pow(clientY - centerY, 2)
    );
  }, []);

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

  // Use refs to avoid stale closures in event handlers
  const resizingHotspotRef = useRef(resizingHotspot);
  const hotspotsRef = useRef(hotspots);
  
  useEffect(() => {
    resizingHotspotRef.current = resizingHotspot;
  }, [resizingHotspot]);
  
  useEffect(() => {
    hotspotsRef.current = hotspots;
  }, [hotspots]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const currentResizing = resizingHotspotRef.current;
    if (!currentResizing || !containerRef.current) return;
    
    const hotspot = hotspotsRef.current.find(h => h.id === currentResizing.id);
    if (!hotspot) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentDistance = getDistanceFromCenter(hotspot, e.clientX, e.clientY);
    const scaleRatio = currentDistance / currentResizing.initialDistance;
    let newScale = Math.min(2, Math.max(0.5, currentResizing.initialScale * scaleRatio));
    
    // Get base dimensions at scale=1 for max scale calculation
    const measured = measuredDimensionsRef.current.get(hotspot.id);
    const baseWidth = measured ? measured.width / hotspot.scale : 100;
    const baseHeight = measured ? measured.height / hotspot.scale : 50;
    
    // Convert CENTER (stored) to TOP-LEFT for max scale calculation
    const topLeft = centerToTopLeft(hotspot.x, hotspot.y, baseWidth, baseHeight, rect.width, rect.height);
    
    // Get max scale that keeps hotspot in safe zone
    const maxScale = getMaxScaleInSafeZone(
      topLeft.x, topLeft.y, baseWidth, baseHeight,
      rect.width, rect.height, 'vertical_social'
    );
    newScale = Math.min(newScale, maxScale);
    
    onUpdateHotspotScale(currentResizing.id, newScale);
  }, [onUpdateHotspotScale, getDistanceFromCenter]);

  const handleTouchResizeMove = useCallback((e: TouchEvent) => {
    const currentResizing = resizingHotspotRef.current;
    if (!currentResizing || !containerRef.current) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const hotspot = hotspotsRef.current.find(h => h.id === currentResizing.id);
    if (!hotspot) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentDistance = getDistanceFromCenter(hotspot, touch.clientX, touch.clientY);
    const scaleRatio = currentDistance / currentResizing.initialDistance;
    let newScale = Math.min(2, Math.max(0.5, currentResizing.initialScale * scaleRatio));
    
    // Get base dimensions at scale=1 for max scale calculation
    const measured = measuredDimensionsRef.current.get(hotspot.id);
    const baseWidth = measured ? measured.width / hotspot.scale : 100;
    const baseHeight = measured ? measured.height / hotspot.scale : 50;
    
    // Convert CENTER (stored) to TOP-LEFT for max scale calculation
    const topLeft = centerToTopLeft(hotspot.x, hotspot.y, baseWidth, baseHeight, rect.width, rect.height);
    
    // Get max scale that keeps hotspot in safe zone
    const maxScale = getMaxScaleInSafeZone(
      topLeft.x, topLeft.y, baseWidth, baseHeight,
      rect.width, rect.height, 'vertical_social'
    );
    newScale = Math.min(newScale, maxScale);
    
    onUpdateHotspotScale(currentResizing.id, newScale);
  }, [onUpdateHotspotScale, getDistanceFromCenter]);

  const handleResizeEnd = useCallback(() => {
    setResizingHotspot(null);
  }, []);

  // Event listeners for drag (mouse + touch)
  useEffect(() => {
    if (draggingHotspot) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
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
  }, [draggingHotspot, handleDragMove, handleTouchDragMove, handleDragEnd]);

  // Event listeners for resize (mouse + touch) - separate effect to avoid stale closures
  useEffect(() => {
    if (resizingHotspot) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
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
  }, [resizingHotspot, handleResizeMove, handleTouchResizeMove, handleResizeEnd]);

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
      // In edit mode, clicking a hotspot selects it and exits add mode
      onSelectHotspot(hotspot.id);
      onExitAddMode?.();
    }
  };

  const activeHotspots = hotspots.filter((h) => {
    const isInTimeRange = currentTime >= h.timeStart && currentTime <= h.timeEnd;
    const isSelected = selectedHotspotId === h.id;
    
    if (isPreviewMode && !h.productId) return false;
    
    return isInTimeRange || (!isPreviewMode && isSelected);
  });

  console.log('[VideoPlayer] activeHotspots:', 
    activeHotspots.map(h => ({ id: h.id, style: h.style, revision: h.revision }))
  );

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
      {/* Mode Controls - Above Video (Desktop only) - Only show when video is ready */}
      {videoSrc && isVideoReady && !isMobile && (
        <div className="flex flex-col items-center mb-6">
          <div className="inline-flex items-center gap-2">
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
            
            {/* Add Hotspot Button - only in edit mode */}
            {!isPreviewMode && (
              <button
                onClick={onToggleAddMode}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                  isAddingHotspot
                    ? "bg-[#3B82F6] text-white shadow-sm"
                    : "bg-white border border-[rgba(0,0,0,0.12)] text-[#374151] hover:bg-[rgba(59,130,246,0.05)] hover:border-[rgba(59,130,246,0.3)]"
                )}
              >
                <svg className={cn("w-4 h-4 transition-transform", isAddingHotspot && "rotate-45")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isAddingHotspot ? "Cancel" : "Add Hotspot"}
              </button>
            )}
          </div>

          {!isPreviewMode && (
            <p className="text-[12px] text-[#6B7280] mt-3 text-center">
              {isAddingHotspot 
                ? "✚ Click in the video to place a hotspot, or click Cancel to exit."
                : "✎ Select mode – click hotspots to edit. Click 'Add Hotspot' to create new ones."
              }
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
            // Light neutral background while loading, then subtle container when ready
            videoSrc && !isVideoReady && "bg-neutral-100 rounded-[14px] flex items-center justify-center",
            videoSrc && isVideoReady && "bg-neutral-100 rounded-[14px] p-1",
            videoSrc && isVideoReady && "shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
            videoSrc && isVideoReady && !isPreviewMode && "ring-2 ring-[rgba(59,130,246,0.4)]"
          )}
          style={{
            minHeight: videoSrc ? '200px' : undefined,
          }}
        >
          {/* Loading indicator while video is processing */}
          {videoSrc && !isVideoReady && (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-neutral-500">Loading video...</p>
            </div>
          )}
          
          {/* Loading indicator for hotspots - shown as small overlay */}
          {videoSrc && isVideoReady && hotspotsLoading && (
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs text-neutral-600">Loading hotspots...</span>
            </div>
          )}

          {videoSrc ? (
            <video
              ref={videoRef}
              controls={!isMobile && isVideoReady}
              playsInline
              // @ts-ignore - webkit-playsinline is needed for older iOS
              webkit-playsinline=""
              muted
              preload="auto"
              autoPlay={false}
              poster=""
              className={cn(
                "w-full h-full min-h-[200px] rounded-[12px] ios-video-fix",
                isVideoReady ? "animate-fade-in" : "opacity-0 absolute"
              )}
              style={{ 
                display: "block",
                objectFit: "contain",
                width: "100%",
                height: "100%",
                minHeight: "200px",
                backgroundColor: "#000",
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
            <VideoUploadZone onVideoLoad={onVideoLoad} onUploadComplete={onUploadComplete} />
          )}

          {/* Safe Zone Overlay - Edit mode only, when video is ready */}
          {videoSrc && isVideoReady && !isPreviewMode && showSafeZones && (
            <SafeZoneOverlay />
          )}

          {/* Zero-hotspots placement hint overlay - lighter, smaller, smarter */}
          {videoSrc && isVideoReady && !isPreviewMode && showPlacementHint && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[15]">
              <div className="bg-black/50 backdrop-blur-md text-white px-4 py-3 rounded-full text-center animate-fade-in shadow-lg max-w-[280px]">
                <p className="font-medium text-[13px] leading-snug">
                  {isFirstHotspot 
                    ? t("editor.hint.tapToAddHotspot") 
                    : t("editor.hint.tapToAddAnother")}
                </p>
              </div>
            </div>
          )}

          {/* Unified click overlay for hotspot creation - tap-first approach in Edit mode */}
          {videoSrc && isVideoReady && !isPreviewMode && (
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

          {/* Scene state overlay - top right corner */}
          {videoSrc && isVideoReady && !isPreviewMode && sceneState && onJumpToNext && (
            <div className="absolute right-3 top-3 z-20">
              <SceneStateBanner
                sceneState={sceneState}
                onJumpToNext={onJumpToNext}
                isEditMode={!isPreviewMode}
              />
            </div>
          )}

          {/* In-video navigation overlays - only in edit mode */}
          {videoSrc && !isPreviewMode && totalHotspotCount > 0 && selectedHotspotId && (
            <HotspotNavigationPill
              currentIndex={currentHotspotIndex}
              totalCount={totalHotspotCount}
              onPrevious={onPreviousHotspot || (() => {})}
              onNext={onNextHotspot || (() => {})}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
            />
          )}

          {/* Next hotspot chip - shown when no hotspot selected and there's a future hotspot */}
          {videoSrc && !isPreviewMode && !selectedHotspotId && onJumpToNext && (
            <NextHotspotChip
              nextHotspotTime={nextHotspotTime}
              isComplete={isNextHotspotComplete}
              onJump={onJumpToNext}
              visible={nextHotspotTime !== null}
            />
          )}

          {/* Hotspot saved snackbar - post-edit feedback */}
          {videoSrc && !isPreviewMode && onJumpToNext && onSnackbarDismiss && (
            <HotspotSavedSnackbar
              visible={showSnackbar}
              incompleteCount={incompleteCount}
              nextHotspotTime={nextHotspotTime}
              allComplete={allComplete}
              onJump={onJumpToNext}
              onDismiss={onSnackbarDismiss}
            />
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

          {/* Hotspots overlay */}
          {videoSrc && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              {activeHotspots.map((hotspot) => {
                const product = hotspot.productId ? products[hotspot.productId] : null;
                const currency = (hotspot.productCurrency as CurrencyCode) || "USD";
                const price = hotspot.productPrice 
                  ? formatPriceDisplay(hotspot.productPrice, currency)
                  : product?.price 
                    ? formatPriceDisplay(product.price, currency)
                    : undefined;
                const isThisSelected = selectedHotspotId === hotspot.id;
                const isAnyHotspotEditing = selectedHotspotId !== null;
                
                // Compute TOP-LEFT position for rendering from CENTER position stored in data
                const containerRect = containerRef.current?.getBoundingClientRect();
                const { width: contentWidth, height: contentHeight } = getHotspotDimensions(hotspot.id, !!hotspot.productId);
                const containerWidth = containerRect?.width || 1;
                const containerHeight = containerRect?.height || 1;
                
                // Convert CENTER (hotspot.x, hotspot.y) to TOP-LEFT for rendering
                const topLeftPos = centerToTopLeft(
                  hotspot.x, hotspot.y, 
                  contentWidth, contentHeight, 
                  containerWidth, containerHeight
                );
                
                return (
                  <div
                    key={`hotspot-${hotspot.id}-rev${hotspot.revision ?? 0}-style${hotspot.style}`}
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
                      isAddingHotspot={isAddingHotspot}
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
                      forceVisible={isThisSelected}
                      onContentMeasure={(w, h) => handleContentMeasure(hotspot.id, w, h)}
                      renderX={topLeftPos.x}
                      renderY={topLeftPos.y}
                    />
                    {!isPreviewMode && isThisSelected && !draggingHotspot && !isDeferringToolbar && showToolbar && (
                      <HotspotInlineEditor
                        hotspot={hotspot}
                        products={products}
                        onUpdateHotspot={onUpdateHotspot}
                        onDeleteHotspot={() => onDeleteHotspot(hotspot.id)}
                        onOpenProductSelection={onOpenProductSelection}
                        onOpenLayoutSheet={onOpenLayoutSheet}
                        autoOpenProductPanel={shouldAutoOpenProductPanel && !hotspot.productId}
                        containerRef={containerRef}
                        onDone={onToolbarDone}
                        showSaved={showSavedIndicator}
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
            cardStyle={selectedProductHotspot.cardStyle || "ecommerce-light-card"}
            hotspotPosition={{ x: selectedProductHotspot.x, y: selectedProductHotspot.y }}
            containerRef={containerRef}
            currency={(selectedProductHotspot.productCurrency as CurrencyCode) || "USD"}
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
