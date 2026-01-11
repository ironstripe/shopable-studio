import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Hotspot, Product, VideoProject, VideoCTA, EditorMode, ClickBehavior, InteractionMode } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import VideoGallery from "@/components/VideoGallery";
import VideoUploadZone from "@/components/VideoUploadZone";
import HotspotSidebar from "@/components/HotspotSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomControls from "@/components/MobileBottomControls";
import HotspotDrawer from "@/components/HotspotDrawer";
import SlugEditSheet from "@/components/SlugEditSheet";

import SelectProductSheet from "@/components/SelectProductSheet";
import NewProductSheet from "@/components/NewProductSheet";
import LayoutBehaviorSheet from "@/components/LayoutBehaviorSheet";
import VideoCTASheet from "@/components/VideoCTASheet";
// WelcomeOverlay removed - entry screen IS the FTUX now
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
import { useVideoState } from "@/hooks/use-video-state";
import { useLocale } from "@/lib/i18n";
import { useCreator } from "@/contexts/CreatorContext";
import shopableLogo from "@/assets/shopable-logo.png";
import { listVideos, VideoDto, triggerRender } from "@/services/video-api";
import VideoExportSection from "@/components/VideoExportSection";
import { trackEvent } from "@/services/event-tracking";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLocale();
  const { creator } = useCreator();
  const { transitionTo: transitionVideoState } = useVideoState();
  const { step: ftuxStep, isComplete: ftuxComplete, advanceStep, completeFTUX } = useFTUX();
  
  // Two-mode interaction system tied to playback:
  // "hotspot-focus" (default, when paused): Select/edit hotspots, no creation
  // "time-navigation" (when playing): Create hotspots by tapping
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("hotspot-focus");
  
  // Derived state: in time-navigation mode, tapping video creates hotspots
  const isTimeNavigationMode = interactionMode === "time-navigation";
  
  // Toolbar visibility (can be closed via Done while keeping hotspot selected)
  const [showToolbar, setShowToolbar] = useState(true);
  
  // Saved indicator for hotspot changes
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  
  // Backend video state
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  
  // Slug sheet state
  const [slugSheetOpen, setSlugSheetOpen] = useState(false);
  
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
  
  // FTUX Step 3: First success toast state (persisted)
  const [hasShownFirstSuccess, setHasShownFirstSuccess] = useState(() => {
    return localStorage.getItem("shopable_ftux_first_success") === "true";
  });
  
  // Computed: Can finalize (at least one complete hotspot)
  const canFinalize = useMemo(() => {
    return hotspots.some(h => isHotspotComplete(h));
  }, [hotspots]);
  
  // Computed: Show finalize button ONLY in Preview mode (user is done editing)
  // "Ready to post" REMOVED during edit mode entirely per UX spec
  const showFinalizeButton = useMemo(() => {
    return canFinalize 
      && editorMode === "preview" // ONLY show when user is in Preview mode
      && !selectProductSheetOpen 
      && !layoutBehaviorSheetOpen 
      && !newProductSheetOpen;
  }, [canFinalize, editorMode, selectProductSheetOpen, layoutBehaviorSheetOpen, newProductSheetOpen]);
  
  // Get first product name for slug generation
  const firstProductName = useMemo(() => {
    const completeHotspot = hotspots.find(h => h.productTitle);
    return completeHotspot?.productTitle || undefined;
  }, [hotspots]);
  
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

  // Products state - rebuilt from hotspots after load (hotspots are the source of truth)
  const [products, setProducts] = useState<Record<string, Product>>({});

  // Rebuild products from hotspots (single source of truth)
  // This ensures product edit sheet has correct data after page load
  useEffect(() => {
    const productsFromHotspots: Record<string, Product & { currency?: string }> = {};

    hotspots.forEach((h) => {
      if (!h.productId) return;

      productsFromHotspots[h.productId] = {
        id: h.productId,
        title: h.productTitle || h.ctaLabel || "Product",
        description: h.productDescription || undefined,
        link: h.productUrl || "#",
        thumbnail: h.productImageUrl || undefined,
        price: h.productPrice || "",
        ctaLabel: h.ctaLabel || "Shop Now",
        currency: h.productCurrency || "USD",
        promoCode: h.productPromoCode || undefined,
      };
    });

    // Replace products state entirely with hotspot-derived data
    // Prevent clearing during initial loading when hotspots haven't loaded yet
    if (Object.keys(productsFromHotspots).length > 0) {
      setProducts(productsFromHotspots);
    }
  }, [hotspots]);

  // FTUX Step 3: Show first success toast when first product is linked
  useEffect(() => {
    if (hasShownFirstSuccess) return;
    
    const firstHotspotWithProduct = hotspots.find(h => h.productId);
    if (firstHotspotWithProduct) {
      toast.success(t("ftux.firstSuccess"));
      setHasShownFirstSuccess(true);
      localStorage.setItem("shopable_ftux_first_success", "true");
    }
  }, [hotspots, hasShownFirstSuccess, t]);

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
    // STATE MACHINE GUARD: If video is already ready_to_post, redirect to exit flow
    if (video.state === "ready_to_post" || video.state === "posted") {
      navigate(`/ready/${video.id}`);
      return;
    }

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
      
      // Track video_created event for new uploads
      if (creator) {
        trackEvent({
          eventName: "video_created",
          creatorId: creator.id,
          videoId,
        });
      }
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
    // Only create hotspot if we're in TIME-NAVIGATION mode (video is playing/was playing)
    if (interactionMode !== "time-navigation") {
      console.log("[Index] handleAddHotspot called but not in TIME-NAVIGATION mode, ignoring");
      return;
    }
    
    // Safe zone clamping is now handled in VideoPlayer with pixel-accurate dimensions
    // Just create the hotspot at the provided (already clamped) position
    const newHotspot = addHotspotCore(x, y, time);
    
    // Pause video and switch to HOTSPOT-FOCUS mode
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setInteractionMode("hotspot-focus");
    
    // Defer toolbar and panel opening - allow drag first
    setIsDeferringToolbar(true);
    setPendingPanelHotspotId(newHotspot.id);
    
    toast.success(t("hotspots.created"));
  };

  const handleHotspotSelect = (hotspotId: string | null) => {
    if (hotspotId) {
      // Selecting a hotspot → pause video, switch to HOTSPOT-FOCUS
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      setInteractionMode("hotspot-focus");
      selectHotspot(hotspotId);
      setShowToolbar(true);
    } else {
      // Deselecting → stay in HOTSPOT-FOCUS (no auto-switch to navigation)
      selectHotspot(null);
    }
  };

  // Handle toolbar "Done" button - hide toolbar, stay in HOTSPOT-FOCUS, show snackbar
  const handleToolbarDone = () => {
    setShowToolbar(false);
    selectHotspot(null);
    // Stay in hotspot-focus mode - user must explicitly press Play to navigate
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
    
    // Defensive logging
    console.log("[Studio] Assigning product to hotspot:", {
      hotspotId: target.id,
      productId,
      productUrl: product?.link,
      productCurrency: (product as Product & { currency?: string })?.currency,
    });

    // 3) Update hotspot with selected product and product info for Public display
    updateHotspot({
      id: target.id,
      productId,
      productTitle: product?.title ?? null,
      productDescription: product?.description ?? null,
      productUrl: product?.link ?? null,
      productImageUrl: product?.thumbnail ?? null,
      productPrice: product?.price ?? null,
      productCurrency: (product as Product & { currency?: string })?.currency ?? "USD",
      clickBehavior,
    });

    // 4) Close product selector and clear temp state
    setSelectProductSheetOpen(false);
    setProductAssignmentHotspotId(null);

    // 5) Ensure hotspot stays selected → toolbar stays visible
    selectHotspot(target.id);
  };

  const handleProductCreatedFromSheet = (
    productId: string, 
    productData: Omit<Product, "id"> & { currency?: string },
    clickBehavior?: ClickBehavior
  ) => {
    // Auto-assign the newly created product to the active hotspot
    // Use productData directly to avoid race condition with products state
    if (productAssignmentHotspotId) {
      const target = hotspots.find((h) => h.id === productAssignmentHotspotId);
      if (target) {
        const finalClickBehavior = clickBehavior ?? target.clickBehavior ?? "show-card";
        
        // Defensive logging
        console.log("[Studio] Saving hotspot productUrl:", productData.link);
        
        // Use productData directly instead of looking up in products state
        updateHotspot({
          id: target.id,
          productId,
          productTitle: productData.title ?? null,
          productDescription: productData.description ?? null,
          productUrl: productData.link ?? null,
          productImageUrl: productData.thumbnail ?? null,
          productPrice: productData.price ?? null,
          productCurrency: productData.currency ?? "USD",
          productPromoCode: productData.promoCode ?? null,
          ctaLabel: productData.ctaLabel ?? "Shop Now",
          clickBehavior: finalClickBehavior,
        });
        
        setSelectProductSheetOpen(false);
        setProductAssignmentHotspotId(null);
        selectHotspot(target.id);
      }
    }
    setNewProductSheetOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product & { currency?: string }) => {
    // Defensive logging
    console.log("[Studio] Saving hotspot productUrl:", updatedProduct.link);
    
    setProducts({ ...products, [updatedProduct.id]: updatedProduct });
    
    // Sync changes to all hotspots using this product
    hotspots.forEach((h) => {
      if (h.productId === updatedProduct.id) {
        updateHotspot({
          id: h.id,
          productTitle: updatedProduct.title,
          productDescription: updatedProduct.description ?? null,
          productUrl: updatedProduct.link,
          productImageUrl: updatedProduct.thumbnail ?? null,
          productPrice: updatedProduct.price ?? null,
          productCurrency: updatedProduct.currency ?? h.productCurrency ?? "USD",
          productPromoCode: updatedProduct.promoCode ?? null,
        });
      }
    });
    
    toast.success(t("product.updated"));
  };

  const handleRemoveProductFromHotspot = () => {
    if (!productAssignmentHotspotId) return;
    
    updateHotspot({
      id: productAssignmentHotspotId,
      productId: null,
      productTitle: undefined,
      productUrl: undefined,
      productImageUrl: undefined,
      productPrice: undefined,
      productCurrency: undefined,
      productPromoCode: undefined,
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
      // Switching to preview: close panels, clear selection
      selectHotspot(null);
      setHotspotDrawerOpen(false);
      setVideoCTASheetOpen(false);
    }
    setEditorMode(editorMode === "edit" ? "preview" : "edit");
  };

  // Handle play/pause - ties interaction mode to playback state
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        // Starting playback → Enter TIME-NAVIGATION mode
        videoRef.current.play();
        setInteractionMode("time-navigation");
        // Deselect any hotspot, hide toolbar
        selectHotspot(null);
        setShowToolbar(false);
      } else {
        // Pausing → Return to HOTSPOT-FOCUS mode
        videoRef.current.pause();
        setInteractionMode("hotspot-focus");
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // ESC key handler to pause video and close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Pause video if playing
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setInteractionMode("hotspot-focus");
          return;
        }
        // Close panels
        if (selectProductSheetOpen) setSelectProductSheetOpen(false);
        if (layoutBehaviorSheetOpen) setLayoutBehaviorSheetOpen(false);
        if (newProductSheetOpen) setNewProductSheetOpen(false);
        if (videoCTASheetOpen) setVideoCTASheetOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectProductSheetOpen, layoutBehaviorSheetOpen, newProductSheetOpen, videoCTASheetOpen]);

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

  // Note: handlePlayPause and handleSeek are defined above (lines 737-760)

  // FTUX computed states (WelcomeOverlay removed - entry screen IS the FTUX)
  // Show placement hint when ready for next hotspot creation
  // Conditions: video loaded, not loading, edit mode, no hotspot selected, no sheets open, not dragging
  const showPlacementHint = videoSrc 
    && !hotspotsLoading 
    && editorMode === "edit" 
    && !selectedHotspotId 
    && !selectProductSheetOpen 
    && !layoutBehaviorSheetOpen 
    && !newProductSheetOpen 
    && !hotspotDrawerOpen
    && !isDeferringToolbar;
  
  // Determine which hint text to show
  const isFirstHotspot = hotspots.length === 0;
  const showProductSheetHint = !ftuxComplete && ftuxStep === "productSelect";

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-[100dvh] bg-white flex flex-col overflow-hidden">
        <MobileHeader
          videoTitle={videoTitle}
          onTitleChange={setVideoTitle}
          onReplaceVideo={() => setShowReplaceVideoDialog(true)}
          onExport={handleExport}
          hasVideo={!!videoSrc}
          onDeleteVideo={() => setShowReplaceVideoDialog(true)}
          onOpenVideoGallery={handleOpenVideoGallery}
          onFinalize={() => setSlugSheetOpen(true)}
          isExporting={isExporting}
          renderStatus={currentVideoRenderStatus}
          canFinalize={canFinalize}
          showFinalize={showFinalizeButton}
        />

        {/* Slug Edit Sheet */}
        {currentVideoId && (
          <SlugEditSheet
            open={slugSheetOpen}
            onOpenChange={setSlugSheetOpen}
            videoId={currentVideoId}
            videoTitle={videoTitle}
            productName={firstProductName}
          />
        )}

        {/* Main content area - accounts for header with safe area and bottom controls */}
        {/* CRITICAL: overflow-hidden + min-h-0 prevents nested scrolling in flex layout */}
        <main 
          className="flex-1 flex items-center justify-center px-2 overflow-hidden min-h-0"
          style={{
            paddingTop: 'calc(56px + env(safe-area-inset-top, 0px) + 8px)',
            paddingBottom: videoSrc ? 'calc(140px + env(safe-area-inset-bottom, 0px) + 8px)' : 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Show upload zone if no video selected (entry screen) */}
          {!videoSrc ? (
            <div className="flex flex-col items-center w-full max-w-xl mx-auto px-4">
              {/* Motivational headline - THIS IS THE FTUX */}
              <div className="text-center mb-8">
                <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-2">
                  {t("entry.headline")}
                </h1>
                <p className="text-[16px] text-muted-foreground mb-4">
                  {t("entry.subline")}
                </p>
                {/* Micro-trust line - small, subtle */}
                <p className="text-[13px] text-muted-foreground/70">
                  {t("entry.microTrust")}
                </p>
              </div>
              
              <VideoUploadZone
                onVideoLoad={handleVideoLoad}
                onUploadComplete={handleUploadComplete}
                onOpenVideoGallery={handleOpenVideoGallery}
              />
            </div>
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
              showPlacementHint={!!showPlacementHint}
              isFirstHotspot={isFirstHotspot}
              onHotspotDragEnd={handleHotspotDragEnd}
              isDeferringToolbar={isDeferringToolbar}
              hotspotsLoading={hotspotsLoading}
              isTimeNavigationMode={isTimeNavigationMode}
              onPlayPause={handlePlayPause}
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

        {/* Export Section - REMOVED on mobile per UX spec: "Bottom bar is the ONLY control surface" */}
        {/* VideoExportSection disabled to prevent extra document height causing vertical scroll */}

        {/* Mobile bottom controls - simplified: only Hotspots + CTA buttons */}
        {videoSrc && (
          <MobileBottomControls
            onOpenHotspotDrawer={() => setHotspotDrawerOpen(true)}
            onOpenCTASettings={() => setVideoCTASheetOpen(true)}
            hotspotCount={hotspots.length}
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

        {/* FTUX: Entry screen IS the welcome experience - no overlay needed */}

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
              showPlacementHint={!!showPlacementHint && isTimeNavigationMode}
              onHotspotDragEnd={handleHotspotDragEnd}
              isDeferringToolbar={isDeferringToolbar}
              hotspotsLoading={hotspotsLoading}
              isTimeNavigationMode={isTimeNavigationMode}
              onPlayPause={handlePlayPause}
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

      {/* FTUX: Entry screen IS the welcome experience - no overlay needed */}

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
