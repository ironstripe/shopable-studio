import { useState, useRef, useEffect } from "react";
import { Hotspot, Product, VideoProject, VideoCTA, EditorMode } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import HotspotSidebar from "@/components/HotspotSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomControls from "@/components/MobileBottomControls";
import HotspotDrawer from "@/components/HotspotDrawer";
import AddHotspotFAB from "@/components/AddHotspotFAB";
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
import { Download, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFTUX } from "@/hooks/use-ftux";
import { useHotspots } from "@/hooks/use-hotspots";
import { clampPositionToSafeZone, SafeZonePreset } from "@/utils/safe-zone";
import shopableLogo from "@/assets/shopable-logo.png";

const Index = () => {
  const isMobile = useIsMobile();
  const { step: ftuxStep, isComplete: ftuxComplete, advanceStep, completeFTUX } = useFTUX();
  
  // Active safe zone preset
  const activeSafeZonePreset: SafeZonePreset = 'vertical_social';
  
  // Centralized hotspot management via hook
  const {
    hotspots,
    selectedHotspotId,
    selectedHotspot, // Derived, always fresh!
    addHotspot: addHotspotCore,
    updateHotspot,
    deleteHotspot: deleteHotspotCore,
    selectHotspot,
    clearHotspots,
    updateHotspotPosition,
    updateHotspotScale,
    setHotspots,
  } = useHotspots([], { safeZonePreset: activeSafeZonePreset });
  
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

  const handleVideoLoad = (src: string) => {
    setVideoSrc(src);
    const filename = src.split('/').pop()?.split('.')[0] || "Untitled Video";
    setVideoTitle(filename);
    toast.success("Video loaded successfully");
    
    // FTUX: Advance to videoLoaded step
    if (!ftuxComplete && ftuxStep === "emptyEditor") {
      advanceStep("videoLoaded");
    }
  };

  const handleAddHotspot = (x: number, y: number, time: number) => {
    const { x: safeX, y: safeY, wasConstrained } = clampPositionToSafeZone(x, y, 1, activeSafeZonePreset);
    
    if (wasConstrained) {
      toast.info("Hotspot snapped to safe area. Reserved zones are used by platform UI.", {
        duration: 3000,
      });
    }

    // Use centralized addHotspot from hook (it handles safe zone clamping internally)
    const newHotspot = addHotspotCore(safeX, safeY, time);
    
    // Defer toolbar and panel opening - allow drag first
    setIsDeferringToolbar(true);
    setPendingPanelHotspotId(newHotspot.id);
    
    toast.success("Hotspot created!");
  };

  const handleHotspotSelect = (hotspotId: string) => {
    selectHotspot(hotspotId);
  };

  // Called when drag ends - show toolbar and open panel now that finger is lifted
  const handleHotspotDragEnd = (hotspotId: string) => {
    // End deferring state - now show toolbar
    setIsDeferringToolbar(false);
    selectHotspot(hotspotId);
    
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

  const handleUpdateHotspot = (updatedHotspot: Hotspot) => {
    updateHotspot(updatedHotspot);
    console.log('[Index.handleUpdateHotspot] Updated:', {
      id: updatedHotspot.id,
      style: updatedHotspot.style,
    });
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    deleteHotspotCore(hotspotId);
    toast.success("Hotspot deleted");
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

  const handleAssignProduct = (productId: string, overrideClickBehavior?: import("@/types/video").ClickBehavior) => {
    if (!productAssignmentHotspotId) return;
    
    const product = products[productId];
    const clickBehavior = overrideClickBehavior || product?.defaultClickBehavior;
    const targetHotspotId = productAssignmentHotspotId;
    
    // Use centralized updateHotspot
    updateHotspot({
      id: targetHotspotId,
      productId,
      ...(clickBehavior && { clickBehavior }),
    });
    
    setSelectProductSheetOpen(false);
    setProductAssignmentHotspotId(null);
    toast.success("Product assigned to hotspot");
    
    // FTUX: Show preview hint and then export hint
    if (!ftuxComplete && ftuxStep === "productSelect" && !shownPreviewHint) {
      advanceStep("postProduct");
      setShownPreviewHint(true);
      setTimeout(() => {
        toast("Switch to Preview to see your final video.", {
          duration: 4000,
          icon: "👀",
        });
      }, 500);
      
      // Then show export hint
      setTimeout(() => {
        if (!shownExportHint) {
          setShownExportHint(true);
          advanceStep("exportHint");
          toast("You can now export your Shopable video.", {
            duration: 4000,
            icon: "🎉",
          });
          // Mark FTUX complete after export hint
          setTimeout(() => {
            completeFTUX();
          }, 4000);
        }
      }, 5000);
    }
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
    toast.success("Product updated");
  };

  const handleCreateProduct = (newProduct: Omit<Product, "id">): string => {
    const id = `product-${Date.now()}`;
    setProducts({ ...products, [id]: { ...newProduct, id } });
    toast.success("Product created");
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

  const handleReplaceVideo = () => {
    // Clear all video-related state
    setVideoSrc(null);
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
    setVideoTitle("Untitled Video");
    setEditorMode("edit");
    setShouldAutoOpenProductPanel(false);
    setShowReplaceVideoDialog(false);
    toast.success("Video removed. Upload a new video to continue.");
  };

  const handleExport = () => {
    const project: VideoProject = {
      videoSrc: videoSrc || "",
      hotspots: hotspots.map((h) => ({
        timeStart: h.timeStart,
        timeEnd: h.timeEnd,
        x: h.x,
        y: h.y,
        productId: h.productId,
        id: h.id,
        style: h.style,
        ctaLabel: h.ctaLabel,
        scale: h.scale,
        clickBehavior: h.clickBehavior,
        cardStyle: h.cardStyle,
      })),
      products,
      videoCTA,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopable-project.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project exported successfully");
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

  const handleEnterPlacementMode = () => {
    // FTUX: Advance to hotspotPlacement step when FAB is tapped
    if (!ftuxComplete && ftuxStep === "videoLoaded") {
      advanceStep("hotspotPlacement");
    }
    toast.info("Tap on the video to place a hotspot");
  };

  // FTUX: Handle welcome overlay close
  const handleWelcomeClose = () => {
    advanceStep("emptyEditor");
  };

  // FTUX computed states
  const showWelcomeOverlay = !ftuxComplete && ftuxStep === "welcome";
  const showFABHint = !ftuxComplete && ftuxStep === "videoLoaded" && videoSrc && editorMode === "edit";
  const showPlacementHint = !ftuxComplete && ftuxStep === "hotspotPlacement" && videoSrc && editorMode === "edit";
  const showProductSheetHint = !ftuxComplete && ftuxStep === "productSelect";

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileHeader
          videoTitle={videoTitle}
          onTitleChange={setVideoTitle}
          onReplaceVideo={() => setShowReplaceVideoDialog(true)}
          onExport={handleExport}
          hasVideo={!!videoSrc}
          onDeleteVideo={() => setShowReplaceVideoDialog(true)}
        />

        {/* Main content area - accounts for header with safe area and bottom controls */}
        <main 
          className="flex-1 flex items-center justify-center px-2"
          style={{
            paddingTop: 'calc(56px + env(safe-area-inset-top, 0px) + 8px)',
            paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px) + 8px)',
          }}
        >
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
            shouldAutoOpenProductPanel={shouldAutoOpenProductPanel}
            highlightedHotspotId={highlightedHotspotId}
            videoCTA={videoCTA}
            onUpdateVideoCTA={setVideoCTA}
            showSafeZones={editorMode === "edit"}
            isMobile={true}
            showPlacementHint={showPlacementHint}
            onPlacementHintDismiss={() => advanceStep("productSelect")}
            onHotspotDragEnd={handleHotspotDragEnd}
            isDeferringToolbar={isDeferringToolbar}
          />
        </main>

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
          />
        )}

        {/* Add Hotspot FAB - Edit mode only */}
        {videoSrc && editorMode === "edit" && (
          <AddHotspotFAB
            onClick={handleEnterPlacementMode}
            showHint={showFABHint}
            onHintDismiss={() => advanceStep("hotspotPlacement")}
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
          onSelectProduct={handleAssignProduct}
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
              disabled={!videoSrc}
              className={cn(
                "inline-flex items-center h-8 px-4 text-[13px] font-medium rounded-full",
                "bg-white border border-[rgba(0,0,0,0.08)] text-[#111827]",
                "hover:bg-[rgba(59,130,246,0.06)] hover:border-[rgba(59,130,246,0.3)]",
                "transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Main Content */}
      <main className="flex w-full pt-[56px] min-h-screen">
        <div className="flex-1 min-w-0 flex justify-center items-start p-6">
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
            shouldAutoOpenProductPanel={shouldAutoOpenProductPanel}
            highlightedHotspotId={highlightedHotspotId}
            videoCTA={videoCTA}
            onUpdateVideoCTA={setVideoCTA}
            showSafeZones={editorMode === "edit"}
            isMobile={false}
            showPlacementHint={showPlacementHint}
            onPlacementHintDismiss={() => advanceStep("productSelect")}
            onHotspotDragEnd={handleHotspotDragEnd}
            isDeferringToolbar={isDeferringToolbar}
          />
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
          onSelectProduct={handleAssignProduct}
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
    </div>
  );
};

export default Index;
