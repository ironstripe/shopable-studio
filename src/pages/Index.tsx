import { useState, useRef } from "react";
import { Hotspot, Product, VideoProject } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import HotspotSidebar from "@/components/HotspotSidebar";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import shopableLogo from "@/assets/shopable-logo.png";

const Index = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeToolbarHotspotId, setActiveToolbarHotspotId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("Untitled Video");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [shouldAutoOpenProductPanel, setShouldAutoOpenProductPanel] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleVideoLoad = (src: string) => {
    setVideoSrc(src);
    
    // Extract filename from video source
    const filename = src.split('/').pop()?.split('.')[0] || "Untitled Video";
    setVideoTitle(filename);
    
    toast.success("Video loaded successfully");
  };

  const handleAddHotspot = (x: number, y: number, time: number) => {
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      timeStart: time,
      timeEnd: time + 3,
      x,
      y,
      productId: null, // No product assigned yet
      style: "badge-bubble-small",
      ctaLabel: "Kaufen",
      scale: 1,
      clickBehavior: "show-card",
    };
    setHotspots([...hotspots, newHotspot]);
    setActiveToolbarHotspotId(newHotspot.id);
    setSelectedHotspot(newHotspot);
    toast.success("Hotspot created!");
  };

  const handleHotspotSelect = (hotspotId: string) => {
    setActiveToolbarHotspotId(hotspotId);
    setSelectedHotspot(null);
  };

  const handleUpdateHotspot = (updatedHotspot: Hotspot) => {
    setHotspots(
      hotspots.map((h) => (h.id === updatedHotspot.id ? updatedHotspot : h))
    );
    setSelectedHotspot(updatedHotspot);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    setHotspots(hotspots.filter((h) => h.id !== hotspotId));
    setSelectedHotspot(null);
    setActiveToolbarHotspotId(null);
    toast.success("Hotspot deleted");
  };

  const handleUpdateHotspotPosition = (hotspotId: string, x: number, y: number) => {
    setHotspots(
      hotspots.map((h) => (h.id === hotspotId ? { ...h, x, y } : h))
    );
    // Also update selectedHotspot if it's the one being dragged
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot({ ...selectedHotspot, x, y });
    }
  };

  const handleUpdateHotspotScale = (hotspotId: string, scale: number) => {
    setHotspots(
      hotspots.map((h) => (h.id === hotspotId ? { ...h, scale } : h))
    );
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot({ ...selectedHotspot, scale });
    }
  };

  const handleSelectFromList = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setActiveToolbarHotspotId(hotspot.id);
    
    if (videoRef.current) {
      const seekTime = Math.max(0, hotspot.timeStart - 0.5);
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts({
      ...products,
      [updatedProduct.id]: updatedProduct,
    });
    toast.success("Product updated");
  };

  const handleCreateProduct = (newProduct: Omit<Product, "id">) => {
    const id = `product-${Date.now()}`;
    setProducts({
      ...products,
      [id]: { ...newProduct, id },
    });
    toast.success("Product created");
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
        })),
      products,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopable-project.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project exported successfully");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between h-full px-6 lg:px-8">
          
          {/* LEFT: Logo (unchanged) + Project Name */}
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
                  if (e.key === "Enter") {
                    setIsEditingTitle(false);
                  }
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
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            )}
          </div>

          {/* CENTER: Reserved for status (empty for now) */}
          <div className="hidden md:flex items-center justify-center flex-1" />

          {/* RIGHT: Export button (chip-style) */}
          <div className="flex items-center gap-2">
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

      {/* Main Content - Horizontal Flex Layout */}
      <main className="flex w-full pt-[56px] min-h-screen">
        {/* Video Area - Flexible */}
        <div className="flex-1 min-w-0 flex justify-center items-start p-6">
          <VideoPlayer
            videoSrc={videoSrc}
            hotspots={hotspots}
            products={products}
            selectedHotspot={selectedHotspot}
            activeToolbarHotspotId={activeToolbarHotspotId}
            isPreviewMode={isPreviewMode}
            onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
            onAddHotspot={handleAddHotspot}
            onUpdateHotspot={handleUpdateHotspot}
            onDeleteHotspot={handleDeleteHotspot}
            onHotspotSelect={handleHotspotSelect}
            onUpdateHotspotPosition={handleUpdateHotspotPosition}
            onUpdateHotspotScale={handleUpdateHotspotScale}
            onUpdateProduct={handleUpdateProduct}
            onCreateProduct={handleCreateProduct}
            onVideoRef={(ref) => (videoRef.current = ref)}
            onVideoLoad={handleVideoLoad}
            shouldAutoOpenProductPanel={shouldAutoOpenProductPanel}
          />
        </div>

        {/* Sidebar - Fixed Width (only show when video is loaded) */}
        {videoSrc && (
          <HotspotSidebar
            hotspots={hotspots}
            products={products}
            selectedHotspotId={selectedHotspot?.id || null}
            onSelectHotspot={handleSelectFromList}
            onOpenProductPanel={(hotspot) => {
              setSelectedHotspot(hotspot);
              setActiveToolbarHotspotId(hotspot.id);
              setShouldAutoOpenProductPanel(true);
              // Reset after a brief moment to prevent re-opening
              setTimeout(() => setShouldAutoOpenProductPanel(false), 100);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
