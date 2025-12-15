import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Hotspot, Product, VideoProject, VideoCTA, EditorMode, ClickBehavior } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import VideoGallery from "@/components/VideoGallery";
import VideoUploadZone from "@/components/VideoUploadZone";
import HotspotSidebar from "@/components/HotspotSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomControls from "@/components/MobileBottomControls";
import HotspotDrawer from "@/components/HotspotDrawer";

import SelectProductSheet from "@/components/SelectProductSheet";
import NewProductSheet from "@/components/NewProductSheet";
import LayoutBehaviorSheet from "@/components/LayoutBehaviorSheet";
import VideoCTASheet from "@/components/VideoCTASheet";
import WelcomeOverlay from "@/components/ftux/WelcomeOverlay";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Download, Pencil, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFTUX } from "@/hooks/use-ftux";
import { useHotspots } from "@/hooks/use-hotspots";
import { useSceneState, isHotspotComplete } from "@/hooks/use-scene-state";
import { useLocale } from "@/lib/i18n";
import shopableLogo from "@/assets/shopable-logo.png";
import { listVideos, VideoDto, triggerRender } from "@/services/video-api";
import VideoExportSection from "@/components/VideoExportSection";

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLocale();
  const { step: ftuxStep, isComplete: ftuxComplete, advanceStep, completeFTUX } = useFTUX();
  
  // Two-mode system: "select" (default) vs "add" mode
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  
  // Toolbar visibility (can be closed via Done while keeping hotspot selected)
  const [showToolbar, setShowToolbar] = useState(true);
  
  // Saved indicator for hotspot changes
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  
  // Backend video state
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  
  // Centralized hotspot management via hook - pass videoId for backend sync
  const {
    hotspots,
    selectedHotspotId,
    selectedHotspot, // Derived, always fresh!
    isLoading: hotspotsLoading,
    loadError: hotspotsError,
    addHotspot: addHotspotCore,
    updateHotspot,
    deleteHotspot: deleteHotspotCore,
    selectHotspot,
    clearHotspots,
    updateHotspotPosition,
    updateHotspotScale,
    setHotspots,
    persistPositionUpdate,
  } = useHotspots([], { videoId: currentVideoId });
  
  // Backend video list state
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [showVideoGallerySheet, setShowVideoGallerySheet] = useState(false);
  
  // Export/render state
  const [isExporting, setIsExporting] = useState(false);
  const [currentVideoRenderStatus, setCurrentVideoRenderStatus] = useState<"NOT_STARTED" | "PENDING" | "READY" | "NONE" | null>(null);
  const [currentVideoRenderUpdatedAt, setCurrentVideoRenderUpdatedAt] = useState<string | null>(null);
  
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [videoTitle, setVideoTitle] = useState<string>("Untitled Video");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [shouldAutoOpenProductPanel, setShouldAutoOpenProductPanel] = useState(false);
  const [highlightedHotspotId, setHighlightedHotspotId] = useState<string | null>(null);
  const [showReplaceVideoDialog, setShowReplaceVideoDialog] = useState(false);
  const [hotspotDrawerOpen, setHotspotDrawerOpen] = useState(false);
  const [videoCTASheetOpen, setVideoCTASheetOpen] = useState(false);
  const [selectProductSheetOpen, setSelectProductSheetOpen] = useState(false);
  const [newProductSheetOpen, setNewProductSheetOpen] = useState(false);
  const [productAssignmentHotspotId, setProductAssignmentHotspotId] = useState<string | null>(null);
  const [layoutBehaviorSheetOpen, setLayoutBehaviorSheetOpen] = useState(false);
  const [layoutEditingHotspotId, setLayoutEditingHotspotId] = useState<string | null>(null);
  const [pendingPanelHotspotId, setPendingPanelHotspotId] = useState<string | null>(null);
  const [isDeferringToolbar, setIsDeferringToolbar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shownPreviewHint, setShownPreviewHint] = useState(false);
  const [shownExportHint, setShownExportHint] = useState(false);
  const [videoCTA, setVideoCTA] = useState<VideoCTA>({
    label: "Shop Now",
    url: "",
    mode: "off",
    enabled: false,
    type: "visible-button",
    style: "ecommerce-solid-white",
    timing: { mode: "entire-video" },
    position: { x: 0.85, y: 0.85 },
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Derive layoutEditingHotspot from the hotspots array (always fresh!)
  const layoutEditingHotspot = layoutEditingHotspotId 
    ? hotspots.find(h => h.id === layoutEditingHotspotId) ?? null 
    : null;

  // Demo products
  const [products, setProducts] = useState<Record<string, Product>>({
    bose_headphones: {
      id: "bose_headphones",
      title: "Bose QuietComfort Ultra",
      price: "349.–",
      link: "https://www.galaxus.ch/en/s1/product/bose-quietcomfort-ultra-over-ear-bluetooth-headphones-38839067",
      description: "Premium noise-cancelling headphones with immersive audio",
    },
    sony_camera: {
      id: "sony_camera",
      title: "Sony Alpha 7 IV",
      price: "2499.–",
      link: "https://example.com/sony",
      description: "Professional full-frame mirrorless camera",
    },
    apple_watch: {
      id: "apple_watch",
      title: "Apple Watch Series 9",
      price: "449.–",
      link: "https://example.com/apple-watch",
      description: "Advanced health and fitness tracking",
    },
  });

  const isPreviewMode = editorMode === "preview";
  
  // Scene state engine - computes current state based on hotspots and video time
  const sceneState = useSceneState(hotspots, currentTime);
  
  // Jump to next hotspot function
  const jumpToNextHotspot = useCallback(() => {
    const next = hotspots
      .filter(h => h.timeStart > currentTime)
      .sort((a, b) => a.timeStart - b.timeStart)[0];
    
    if (next && videoRef.current) {
      const seekTime = Math.max(0, next.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
      selectHotspot(next.id);
      setShowToolbar(true);
    }
  }, [hotspots, currentTime, selectHotspot]);

  // Jump to previous hotspot function
  const jumpToPreviousHotspot = useCallback(() => {
    const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);
    const currentIndex = sortedHotspots.findIndex(h => h.id === selectedHotspotId);
    
    if (currentIndex > 0 && videoRef.current) {
      const prev = sortedHotspots[currentIndex - 1];
      const seekTime = Math.max(0, prev.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
      selectHotspot(prev.id);
      setShowToolbar(true);
    }
  }, [hotspots, selectedHotspotId, selectHotspot]);

  // Snackbar state for post-edit feedback
  const [showSavedSnackbar, setShowSavedSnackbar] = useState(false);

  // Computed navigation state
  const navigationState = useMemo(() => {
    const sortedHotspots = [...hotspots].sort((a, b) => a.timeStart - b.timeStart);
    const currentIndex = sortedHotspots.findIndex(h => h.id === selectedHotspotId);
    
    // Find next hotspot after current time (for chip)
    const nextFutureHotspot = hotspots
      .filter(h => h.timeStart > currentTime)
      .sort((a, b) => a.timeStart - b.timeStart)[0];
    
    return {
      currentIndex: currentIndex >= 0 ? currentIndex + 1 : 0, // 1-based
      totalCount: hotspots.length,
      canGoPrevious: currentIndex > 0,
      canGoNext: currentIndex >= 0 && currentIndex < sortedHotspots.length - 1,
      nextHotspotTime: nextFutureHotspot?.timeStart ?? null,
      isNextHotspotComplete: nextFutureHotspot ? isHotspotComplete(nextFutureHotspot) : true,
    };
  }, [hotspots, selectedHotspotId, currentTime]);

  // Fetch videos from backend on mount
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    setVideosError(null);
    try {
      const data = await listVideos();
      setVideos(data);
    } catch (error) {
      console.error('[Index] Failed to fetch videos:', error);
      setVideosError(error instanceof Error ? error.message : 'Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle selecting a video from the gallery
  const handleSelectVideoFromGallery = (video: VideoDto) => {
    if (video.fileUrl) {
      setVideoSrc(video.fileUrl);
      setCurrentVideoId(video.id);
      setVideoTitle(video.title || t("header.untitled"));
      setShowVideoGallerySheet(false);
      
      // Set render status from selected video
      setCurrentVideoRenderStatus(video.renderStatus || null);
      setCurrentVideoRenderUpdatedAt(video.renderUpdatedAt || null);
      
      // FTUX: Advance to videoLoaded step
      if (!ftuxComplete && ftuxStep === "emptyEditor") {
        advanceStep("videoLoaded");
      }
    } else {
      toast.error("Video is still processing, please try again later.");
    }
  };
  
  // Handle export/render
  const handleExportVideo = async () => {
    if (!currentVideoId) return;
    if (isExporting || currentVideoRenderStatus === "PENDING") return; // Prevent double-clicks
    
    setIsExporting(true);
    try {
      await triggerRender(currentVideoId);
      
      // Update local state to PENDING (render is in progress)
      setCurrentVideoRenderStatus("PENDING");
      setCurrentVideoRenderUpdatedAt(new Date().toISOString());
      
      // Update video in the list
      setVideos(prev => prev.map(v => 
        v.id === currentVideoId 
          ? { ...v, renderStatus: "PENDING", renderUpdatedAt: new Date().toISOString() }
          : v
      ));
      
      toast.success(t("export.rendering"));
    } catch (error) {
      console.error('[Export] Failed:', error);
      toast.error(t("export.failed"));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle upload complete - refresh video list
  const handleUploadComplete = () => {
    setShowVideoGallerySheet(false);
    fetchVideos();
  };

  // Handle opening video gallery
  const handleOpenVideoGallery = () => {
    fetchVideos(); // Refresh list before opening
    setShowVideoGallerySheet(true);
  };

  const handleVideoLoad = (src: string, videoId?: string) => {
    setVideoSrc(src);
    if (videoId) {
      setCurrentVideoId(videoId);
    }
    const filename = src.split('/').pop()?.split('.')[0] || t("header.untitled");
    setVideoTitle(filename);
    
    // Reset render status for newly loaded videos (we don't know the status yet)
    setCurrentVideoRenderStatus(null);
    setCurrentVideoRenderUpdatedAt(null);
    
    toast.success(t("upload.success"));
    
    // FTUX: Advance to videoLoaded step
    if (!ftuxComplete && ftuxStep === "emptyEditor") {
      advanceStep("videoLoaded");
    }
  };

  const handleAddHotspot = (x: number, y: number, time: number) => {
    // Safe zone clamping is now handled in VideoPlayer with pixel-accurate dimensions
    // Just create the hotspot at the provided (already clamped) position
    const newHotspot = addHotspotCore(x, y, time);
    
    // Defer toolbar and panel opening - allow drag first
    setIsDeferringToolbar(true);
    setPendingPanelHotspotId(newHotspot.id);
    
    toast.success(t("hotspots.created"));
  };

  const handleHotspotSelect = (hotspotId: string | null) => {
    selectHotspot(hotspotId);
    // Show toolbar when selecting a hotspot
    if (hotspotId) {
      setShowToolbar(true);
    }
  };

  // Handle toolbar "Done" button - hide toolbar, deselect hotspot, and show snackbar
  const handleToolbarDone = () => {
    setShowToolbar(false);
    selectHotspot(null);
    setShowSavedSnackbar(true);
  };

  // Show saved indicator briefly after hotspot updates
  const showSavedFeedback = () => {
    setShowSavedIndicator(true);
    setTimeout(() => setShowSavedIndicator(false), 1500);
  };

  // Called when drag ends - show toolbar and open panel now that finger is lifted
  const handleHotspotDragEnd = (hotspotId: string) => {
    // End deferring state - now show toolbar
    setIsDeferringToolbar(false);
    selectHotspot(hotspotId);
    
    // Persist position update to backend
    persistPositionUpdate(hotspotId);
    
    if (pendingPanelHotspotId === hotspotId) {
      // Small delay before opening product panel to avoid race conditions
      setTimeout(() => {
        setPendingPanelHotspotId(null);
        
        // FTUX flow
        if (!ftuxComplete && ftuxStep === "hotspotPlacement") {
          advanceStep("productSelect");
        }
        
        // Open product selection
        setProductAssignmentHotspotId(hotspotId);
        setSelectProductSheetOpen(true);
      }, 150);
    }
  };

  // Fallback for desktop clicks (no drag) - open panel after short delay
  useEffect(() => {
    if (pendingPanelHotspotId && isDeferringToolbar) {
      const timer = setTimeout(() => {
        // If still deferring after 400ms, assume it's a click (not a drag)
        setIsDeferringToolbar(false);
        selectHotspot(pendingPanelHotspotId);
        
        // FTUX flow
        if (!ftuxComplete && ftuxStep === "hotspotPlacement") {
          advanceStep("productSelect");
        }
        
        setProductAssignmentHotspotId(pendingPanelHotspotId);
        setSelectProductSheetOpen(true);
        setPendingPanelHotspotId(null);
      }, 400); // Give time for drag to start
      
      return () => clearTimeout(timer);
    }
  }, [pendingPanelHotspotId, isDeferringToolbar, ftuxComplete, ftuxStep, advanceStep, selectHotspot]);

  // Note: productAssignmentHotspotId sync is no longer needed since hotspot IDs are now stable
  // (we keep client-side id, store backend id in backendId field)

  const handleUpdateHotspot = (updatedHotspot: Hotspot) => {
    updateHotspot(updatedHotspot);
    showSavedFeedback();
    console.log('[Index.handleUpdateHotspot] Updated:', {
      id: updatedHotspot.id,
      style: updatedHotspot.style,
    });
  };

  const handleDeleteHotspot = async (hotspotId: string) => {
    // Clear related state if this hotspot is being referenced
    if (productAssignmentHotspotId === hotspotId) {
      setProductAssignmentHotspotId(null);
      setSelectProductSheetOpen(false);
    }
    if (layoutEditingHotspotId === hotspotId) {
      setLayoutEditingHotspotId(null);
      setLayoutBehaviorSheetOpen(false);
    }
    
    try {
      await deleteHotspotCore(hotspotId);
      toast.success(t("hotspots.deleted"));
    } catch (error) {
      toast.error(t("hotspots.deleteFailed"));
    }
  };

  const handleUpdateHotspotPosition = (hotspotId: string, x: number, y: number) => {
    updateHotspotPosition(hotspotId, x, y);
  };

  const handleUpdateHotspotScale = (hotspotId: string, scale: number) => {
    updateHotspotScale(hotspotId, scale);
  };

  const handleSelectFromList = (hotspot: Hotspot) => {
    selectHotspot(hotspot.id);
    setHighlightedHotspotId(hotspot.id);
    setTimeout(() => setHighlightedHotspotId(null), 1000);
    if (videoRef.current) {
      const seekTime = Math.max(0, hotspot.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleOpenLayoutSheet = (hotspot: Hotspot) => {
    if (!hotspot.productId) {
      handleOpenProductPanel(hotspot);
      return;
    }
    setLayoutEditingHotspotId(hotspot.id);
    setLayoutBehaviorSheetOpen(true);
    selectHotspot(hotspot.id);
    if (videoRef.current) {
      const seekTime = Math.max(0, hotspot.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleOpenProductPanel = (hotspot: Hotspot) => {
    // Open the new SelectProductSheet instead of inline panel
    setProductAssignmentHotspotId(hotspot.id);
    setSelectProductSheetOpen(true);
    selectHotspot(hotspot.id);
    if (videoRef.current) {
      const seekTime = Math.max(0, hotspot.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleOpenProductSelection = (hotspotId: string) => {
    setProductAssignmentHotspotId(hotspotId);
    setSelectProductSheetOpen(true);
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (hotspot) {
      selectHotspot(hotspotId);
      if (videoRef.current) {
        const seekTime = Math.max(0, hotspot.timeStart - 0.5);
        videoRef.current.currentTime = seekTime;
      }
    }
  };

  const handleAssignProduct = (
    productId: string,
    overrideClickBehavior?: ClickBehavior
  ) => {
    // 1) Determine correct hotspot ID - fallback to selectedHotspotId for backend ID updates
    const candidateId = productAssignmentHotspotId || selectedHotspotId;

    if (!candidateId) {
      console.warn("[Hotspots] handleAssignProduct: no hotspot id", {
        productAssignmentHotspotId,
        selectedHotspotId,
      });
      return;
    }

    // 2) Find hotspot in local state
    const target = hotspots.find((h) => h.id === candidateId);

    if (!target) {
      console.warn("[Hotspots] handleAssignProduct: hotspot not found", {
        candidateId,
        productAssignmentHotspotId,
        selectedHotspotId,
        hotspots,
      });
      return;
    }

    const clickBehavior =
      overrideClickBehavior ?? target.clickBehavior ?? "show-card";

    // Get product data for productTitle and productUrl
    const product = products[productId];

    // 3) Update hotspot with selected product and product info for Public display
    updateHotspot({
      id: target.id,
      productId,
      productTitle: product?.title ?? null,
      productUrl: product?.link ?? null,
      clickBehavior,
    });

    // 4) Close product selector and clear temp state
    setSelectProductSheetOpen(false);
    setProductAssignmentHotspotId(null);

    // 5) Ensure hotspot stays selected → toolbar stays visible
    selectHotspot(target.id);
  };

  const handleProductCreatedFromSheet = (productId: string, clickBehavior?: import("@/types/video").ClickBehavior) => {
    // Auto-assign the newly created product to the active hotspot
    if (productAssignmentHotspotId) {
      handleAssignProduct(productId, clickBehavior);
    }
    setNewProductSheetOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts({ ...products, [updatedProduct.id]: updatedProduct });
    toast.success(t("product.updated"));
  };

  const handleRemoveProductFromHotspot = () => {
    if (!productAssignmentHotspotId) return;
    
    updateHotspot({
      id: productAssignmentHotspotId,
      productId: null,
    } as Hotspot);
    
    toast.success(t("product.removed"));
  };

  const handleCreateProduct = (newProduct: Omit<Product, "id">): string => {
    const id = `product-${Date.now()}`;
    setProducts({ ...products, [id]: { ...newProduct, id } });
    toast.success(t("product.created"));
    return id;
  };

  const handleToggleMode = () => {
    if (editorMode === "edit") {
      // Switching to preview: close panels, clear selection, exit add mode
      selectHotspot(null);
      setHotspotDrawerOpen(false);
      setVideoCTASheetOpen(false);
      setIsAddingHotspot(false);
    }
    setEditorMode(editorMode === "edit" ? "preview" : "edit");
  };

  // Exit add mode after hotspot is created
  const handleExitAddMode = () => {
    setIsAddingHotspot(false);
  };

  // ESC key handler to exit add mode and close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddingHotspot) {
          setIsAddingHotspot(false);
        }
        if (selectProductSheetOpen) setSelectProductSheetOpen(false);
        if (layoutBehaviorSheetOpen) setLayoutBehaviorSheetOpen(false);
        if (newProductSheetOpen) setNewProductSheetOpen(false);
        if (videoCTASheetOpen) setVideoCTASheetOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddingHotspot, selectProductSheetOpen, layoutBehaviorSheetOpen, newProductSheetOpen, videoCTASheetOpen]);

  const handleReplaceVideo = () => {
    // Clear all video-related state
    setVideoSrc(null);
    setCurrentVideoId(null);
    clearHotspots(); // Use centralized clear
    setHighlightedHotspotId(null);
    setPendingPanelHotspotId(null);
    setIsDeferringToolbar(false);
    setProductAssignmentHotspotId(null);
    setLayoutEditingHotspotId(null);
    setLayoutBehaviorSheetOpen(false);
    setSelectProductSheetOpen(false);
    setNewProductSheetOpen(false);
    setHotspotDrawerOpen(false);
    setVideoCTA({
      label: "Shop Now",
      url: "",
      mode: "off",
      enabled: false,
      type: "visible-button",
      style: "ecommerce-solid-white",
      timing: { mode: "entire-video" },
      position: { x: 0.85, y: 0.85 },
    });
    setVideoTitle(t("header.untitled"));
    setEditorMode("edit");
    setShouldAutoOpenProductPanel(false);
    setShowReplaceVideoDialog(false);
    
    // Reset export/render state
    setCurrentVideoRenderStatus(null);
    setCurrentVideoRenderUpdatedAt(null);
    setIsExporting(false);
    
    // Refresh the video list to show all available videos
    fetchVideos();
    toast.success(t("video.removed"));
  };

  // handleExport now triggers backend render instead of JSON download
  const handleExport = () => {
    handleExportVideo();
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };


  // FTUX: Handle welcome overlay close
  const handleWelcomeClose = () => {
    advanceStep("emptyEditor");
  };

  // FTUX computed states
  const showWelcomeOverlay = !ftuxComplete && ftuxStep === "welcome";
  // Show placement hint when video is loaded, hotspots are loaded, in edit mode, and no hotspots exist
  const showPlacementHint = videoSrc && !hotspotsLoading && editorMode === "edit" && hotspots.length === 0;
  const showProductSheetHint = !ftuxComplete && ftuxStep === "productSelect";

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <MobileHeader
          videoTitle={videoTitle}
          onTitleChange={setVideoTitle}
          onReplaceVideo={() => setShowReplaceVideoDialog(true)}
          onExport={handleExport}
          hasVideo={!!videoSrc}
          onDeleteVideo={() => setShowReplaceVideoDialog(true)}
          onOpenVideoGallery={handleOpenVideoGallery}
          isExporting={isExporting}
          renderStatus={currentVideoRenderStatus}
        />

        {/* Main content area - accounts for header with safe area and bottom controls */}
        <main 
          className="flex-1 flex items-center justify-center px-2"
          style={{
            paddingTop: 'calc(56px + env(safe-area-inset-top, 0px) + 8px)',
            paddingBottom: videoSrc ? 'calc(140px + env(safe-area-inset-bottom, 0px) + 8px)' : 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Show upload zone if no video selected (entry screen) */}
          {!videoSrc ? (
            <VideoUploadZone
              onVideoLoad={handleVideoLoad}
              onUploadComplete={handleUploadComplete}
              onOpenVideoGallery={handleOpenVideoGallery}
            />
          ) : (
            <VideoPlayer
              videoSrc={videoSrc}
              hotspots={hotspots}
              products={products}
              selectedHotspotId={selectedHotspotId}
              isPreviewMode={isPreviewMode}
              onTogglePreviewMode={handleToggleMode}
              onAddHotspot={handleAddHotspot}
              onUpdateHotspot={handleUpdateHotspot}
              onDeleteHotspot={handleDeleteHotspot}
              onSelectHotspot={handleHotspotSelect}
              onUpdateHotspotPosition={handleUpdateHotspotPosition}
              onUpdateHotspotScale={handleUpdateHotspotScale}
              onOpenProductSelection={handleOpenProductSelection}
              onOpenLayoutSheet={handleOpenLayoutSheet}
              onVideoRef={(ref) => {
                videoRef.current = ref;
                if (ref) {
                  ref.addEventListener("timeupdate", () => setCurrentTime(ref.currentTime));
                  ref.addEventListener("durationchange", () => setDuration(ref.duration));
                  ref.addEventListener("play", () => setIsPlaying(true));
                  ref.addEventListener("pause", () => setIsPlaying(false));
                }
              }}
              onVideoLoad={handleVideoLoad}
              onUploadComplete={handleUploadComplete}
              shouldAutoOpenProductPanel={shouldAutoOpenProductPanel}
              highlightedHotspotId={highlightedHotspotId}
              videoCTA={videoCTA}
              onUpdateVideoCTA={setVideoCTA}
              showSafeZones={editorMode === "edit"}
              isMobile={true}
              showPlacementHint={!!showPlacementHint && isAddingHotspot}
              onHotspotDragEnd={handleHotspotDragEnd}
              isDeferringToolbar={isDeferringToolbar}
              hotspotsLoading={hotspotsLoading}
              isAddingHotspot={isAddingHotspot}
              onExitAddMode={handleExitAddMode}
              onToggleAddMode={() => setIsAddingHotspot(!isAddingHotspot)}
              showToolbar={showToolbar}
              onToolbarDone={handleToolbarDone}
              showSavedIndicator={showSavedIndicator}
              // Navigation overlay props
              currentHotspotIndex={navigationState.currentIndex}
              totalHotspotCount={navigationState.totalCount}
              onPreviousHotspot={jumpToPreviousHotspot}
              onNextHotspot={jumpToNextHotspot}
              canGoPrevious={navigationState.canGoPrevious}
              canGoNext={navigationState.canGoNext}
              nextHotspotTime={navigationState.nextHotspotTime}
              isNextHotspotComplete={navigationState.isNextHotspotComplete}
              showSnackbar={showSavedSnackbar}
              incompleteCount={sceneState.incompleteHotspots.length}
              allComplete={sceneState.allComplete}
              onJumpToNext={jumpToNextHotspot}
              onSnackbarDismiss={() => setShowSavedSnackbar(false)}
              sceneState={sceneState}
            />
          )}
        </main>

        {/* Export Section - below video, above bottom controls */}
        {videoSrc && editorMode === "edit" && (
          <VideoExportSection
            renderStatus={currentVideoRenderStatus}
            renderUpdatedAt={currentVideoRenderUpdatedAt}
            fileUrl={videoSrc}
            isExporting={isExporting}
            onExport={handleExportVideo}
          />
        )}

        {/* Mobile bottom controls */}
        {videoSrc && (
          <MobileBottomControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            editorMode={editorMode}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onToggleMode={handleToggleMode}
            onOpenHotspotDrawer={() => setHotspotDrawerOpen(true)}
            onOpenCTASettings={() => setVideoCTASheetOpen(true)}
            hotspotCount={hotspots.length}
            isAddingHotspot={isAddingHotspot}
            onToggleAddMode={() => setIsAddingHotspot(!isAddingHotspot)}
          />
        )}


        {/* Hotspot Drawer */}
        <HotspotDrawer
          open={hotspotDrawerOpen}
          onOpenChange={setHotspotDrawerOpen}
          hotspots={hotspots}
          products={products}
          selectedHotspotId={selectedHotspotId}
          onSelectHotspot={handleSelectFromList}
          onOpenProductSelection={handleOpenProductSelection}
          onOpenLayoutSheet={handleOpenLayoutSheet}
          onDeleteHotspot={handleDeleteHotspot}
          isPreviewMode={isPreviewMode}
        />

        {/* Select Product Sheet */}
        <SelectProductSheet
          open={selectProductSheetOpen}
          onOpenChange={setSelectProductSheetOpen}
          products={products}
          selectedProductId={productAssignmentHotspotId ? hotspots.find(h => h.id === productAssignmentHotspotId)?.productId : null}
          assignedProductId={productAssignmentHotspotId ? hotspots.find(h => h.id === productAssignmentHotspotId)?.productId : null}
          onSelectProduct={handleAssignProduct}
          onUpdateProduct={handleUpdateProduct}
          onRemoveProduct={handleRemoveProductFromHotspot}
          onOpenNewProduct={() => setNewProductSheetOpen(true)}
          showFTUXHint={showProductSheetHint}
          onFTUXHintDismiss={() => advanceStep("postProduct")}
        />

        {/* New Product Sheet */}
        <NewProductSheet
          open={newProductSheetOpen}
          onOpenChange={setNewProductSheetOpen}
          onCreateProduct={handleCreateProduct}
          onProductCreated={handleProductCreatedFromSheet}
        />

        {/* Layout & Behavior Sheet */}
        <LayoutBehaviorSheet
          open={layoutBehaviorSheetOpen}
          onOpenChange={setLayoutBehaviorSheetOpen}
          hotspot={layoutEditingHotspot}
          onUpdateHotspot={handleUpdateHotspot}
          onDeleteHotspot={handleDeleteHotspot}
        />

        {/* Video CTA Sheet */}
        <VideoCTASheet
          open={videoCTASheetOpen}
          onOpenChange={setVideoCTASheetOpen}
          videoCTA={videoCTA}
          onUpdateCTA={setVideoCTA}
        />

        {/* Replace Video Dialog */}
        <AlertDialog open={showReplaceVideoDialog} onOpenChange={setShowReplaceVideoDialog}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Replace current video?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Replacing the video will remove all hotspots and their timings. Your products will stay available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReplaceVideo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Replace video
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Welcome Overlay - shown on first visit */}
        {showWelcomeOverlay && <WelcomeOverlay onStart={handleWelcomeClose} />}

        {/* Video Gallery Sheet */}
        <Sheet open={showVideoGallerySheet} onOpenChange={setShowVideoGallerySheet}>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <VideoGallery
              videos={videos}
              isLoading={videosLoading}
              error={videosError}
              onSelectVideo={handleSelectVideoFromGallery}
              onRetry={fetchVideos}
              onUploadClick={() => setShowVideoGallerySheet(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between h-full px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={shopableLogo} alt="Shopable" className="w-[140px] h-auto" />
            <div className="h-4 w-px bg-[rgba(0,0,0,0.08)]" />
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                className="text-[14px] font-medium text-[#111827] bg-white border border-[#3B82F6] rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#3B82F6] min-w-[200px]"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 text-[14px] font-medium text-[#111827] hover:text-[#374151] transition-colors group"
              >
                {videoTitle}
                <Pencil className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center justify-center flex-1" />

          <div className="flex items-center gap-2">
            {videoSrc && (
              <button
                onClick={() => setShowReplaceVideoDialog(true)}
                className={cn(
                  "inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-full",
                  "bg-transparent border border-transparent text-[#6B7280]",
                  "hover:bg-[rgba(0,0,0,0.04)] hover:text-[#374151]",
                  "transition-all duration-150"
                )}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Change video
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={!videoSrc || isExporting || currentVideoRenderStatus === "PENDING"}
              className={cn(
                "inline-flex items-center h-8 px-4 text-[13px] font-medium rounded-full",
                "bg-white border border-[rgba(0,0,0,0.08)] text-[#111827]",
                "hover:bg-[rgba(59,130,246,0.06)] hover:border-[rgba(59,130,246,0.3)]",
                "transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Main Content */}
      <main className="flex w-full pt-[56px] min-h-screen">
        <div className="flex-1 min-w-0 flex justify-center items-start p-6">
          {/* Show upload zone if no video selected (entry screen) */}
          {!videoSrc ? (
            <VideoUploadZone
              onVideoLoad={handleVideoLoad}
              onUploadComplete={handleUploadComplete}
              onOpenVideoGallery={handleOpenVideoGallery}
            />
          ) : (
            <VideoPlayer
              videoSrc={videoSrc}
              hotspots={hotspots}
              products={products}
              selectedHotspotId={selectedHotspotId}
              isPreviewMode={isPreviewMode}
              onTogglePreviewMode={handleToggleMode}
              onAddHotspot={handleAddHotspot}
              onUpdateHotspot={handleUpdateHotspot}
              onDeleteHotspot={handleDeleteHotspot}
              onSelectHotspot={handleHotspotSelect}
              onUpdateHotspotPosition={handleUpdateHotspotPosition}
              onUpdateHotspotScale={handleUpdateHotspotScale}
              onOpenProductSelection={handleOpenProductSelection}
              onOpenLayoutSheet={handleOpenLayoutSheet}
              onVideoRef={(ref) => (videoRef.current = ref)}
              onVideoLoad={handleVideoLoad}
              onUploadComplete={handleUploadComplete}
              shouldAutoOpenProductPanel={shouldAutoOpenProductPanel}
              highlightedHotspotId={highlightedHotspotId}
              videoCTA={videoCTA}
              onUpdateVideoCTA={setVideoCTA}
              showSafeZones={editorMode === "edit"}
              isMobile={false}
              showPlacementHint={!!showPlacementHint && isAddingHotspot}
              onHotspotDragEnd={handleHotspotDragEnd}
              isDeferringToolbar={isDeferringToolbar}
              hotspotsLoading={hotspotsLoading}
              isAddingHotspot={isAddingHotspot}
              onExitAddMode={handleExitAddMode}
              onToggleAddMode={() => setIsAddingHotspot(!isAddingHotspot)}
              showToolbar={showToolbar}
              onToolbarDone={handleToolbarDone}
              showSavedIndicator={showSavedIndicator}
              // Navigation overlay props
              currentHotspotIndex={navigationState.currentIndex}
              totalHotspotCount={navigationState.totalCount}
              onPreviousHotspot={jumpToPreviousHotspot}
              onNextHotspot={jumpToNextHotspot}
              canGoPrevious={navigationState.canGoPrevious}
              canGoNext={navigationState.canGoNext}
              nextHotspotTime={navigationState.nextHotspotTime}
              isNextHotspotComplete={navigationState.isNextHotspotComplete}
              showSnackbar={showSavedSnackbar}
              incompleteCount={sceneState.incompleteHotspots.length}
              allComplete={sceneState.allComplete}
              onJumpToNext={jumpToNextHotspot}
              onSnackbarDismiss={() => setShowSavedSnackbar(false)}
              sceneState={sceneState}
            />
          )}
        </div>

        {videoSrc && (
          <div className="w-[320px] flex-shrink-0 bg-white border-l border-[rgba(0,0,0,0.04)] flex flex-col overflow-y-auto">
            <HotspotSidebar
              hotspots={hotspots}
              products={products}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={handleSelectFromList}
              onOpenProductSelection={handleOpenProductSelection}
              onOpenLayoutSheet={handleOpenLayoutSheet}
              onDeleteHotspot={handleDeleteHotspot}
              isPreviewMode={isPreviewMode}
            />
          </div>
        )}

        {/* Desktop: Select Product Sheet */}
        <SelectProductSheet
          open={selectProductSheetOpen}
          onOpenChange={setSelectProductSheetOpen}
          products={products}
          selectedProductId={productAssignmentHotspotId ? hotspots.find(h => h.id === productAssignmentHotspotId)?.productId : null}
          assignedProductId={productAssignmentHotspotId ? hotspots.find(h => h.id === productAssignmentHotspotId)?.productId : null}
          onSelectProduct={handleAssignProduct}
          onUpdateProduct={handleUpdateProduct}
          onRemoveProduct={handleRemoveProductFromHotspot}
          onOpenNewProduct={() => setNewProductSheetOpen(true)}
          showFTUXHint={showProductSheetHint}
          onFTUXHintDismiss={() => advanceStep("postProduct")}
        />

        {/* Desktop: New Product Sheet */}
        <NewProductSheet
          open={newProductSheetOpen}
          onOpenChange={setNewProductSheetOpen}
          onCreateProduct={handleCreateProduct}
          onProductCreated={handleProductCreatedFromSheet}
        />

        {/* Desktop: Layout & Behavior Sheet */}
        <LayoutBehaviorSheet
          open={layoutBehaviorSheetOpen}
          onOpenChange={setLayoutBehaviorSheetOpen}
          hotspot={layoutEditingHotspot}
          onUpdateHotspot={handleUpdateHotspot}
          onDeleteHotspot={handleDeleteHotspot}
        />

        {/* Desktop: Video CTA Sheet */}
        <VideoCTASheet
          open={videoCTASheetOpen}
          onOpenChange={setVideoCTASheetOpen}
          videoCTA={videoCTA}
          onUpdateCTA={setVideoCTA}
        />
      </main>

      <AlertDialog open={showReplaceVideoDialog} onOpenChange={setShowReplaceVideoDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current video?</AlertDialogTitle>
            <AlertDialogDescription>
              Replacing the video will remove all hotspots and their timings. Your products will stay available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceVideo} className="bg-red-500 hover:bg-red-600 text-white">
              Replace video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome Overlay - shown on first visit */}
      {showWelcomeOverlay && <WelcomeOverlay onStart={handleWelcomeClose} />}

      {/* Video Gallery Sheet (Desktop) */}
      <Sheet open={showVideoGallerySheet} onOpenChange={setShowVideoGallerySheet}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <VideoGallery
            videos={videos}
            isLoading={videosLoading}
            error={videosError}
            onSelectVideo={handleSelectVideoFromGallery}
            onRetry={fetchVideos}
            onUploadClick={() => setShowVideoGallerySheet(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
