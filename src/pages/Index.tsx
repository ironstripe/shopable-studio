import { useState, useRef } from "react";
import { Hotspot, Product, VideoProject } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import PropertiesPanel from "@/components/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Upload, Download, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import shopableLogo from "@/assets/shopable-logo.png";

const Index = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeToolbarHotspotId, setActiveToolbarHotspotId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo products
  const [products, setProducts] = useState<Record<string, Product>>({
    bose_headphones: {
      id: "bose_headphones",
      title: "Bose QuietComfort Ultra",
      price: "349.–",
      link: "https://www.galaxus.ch/en/s1/product/bose-quietcomfort-ultra-over-ear-bluetooth-headphones-38839067",
    },
    sony_camera: {
      id: "sony_camera",
      title: "Sony Alpha 7 IV",
      price: "2499.–",
      link: "https://example.com/sony",
    },
    apple_watch: {
      id: "apple_watch",
      title: "Apple Watch Series 9",
      price: "449.–",
      link: "https://example.com/apple-watch",
    },
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      toast.success("Video uploaded successfully");
    } else {
      toast.error("Please select a valid video file");
    }
  };

  const handleAddHotspot = (x: number, y: number, time: number) => {
    const productKeys = Object.keys(products);
    if (productKeys.length === 0) {
      toast.error("Please add at least one product before creating hotspots");
      return;
    }

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      timeStart: time,
      timeEnd: time + 3,
      x,
      y,
      productId: productKeys[0],
      style: "smart-badge",
      ctaLabel: "Kaufen",
    };
    setHotspots([...hotspots, newHotspot]);
    setActiveToolbarHotspotId(newHotspot.id);
    setSelectedHotspot(null);
    toast.success("Hotspot created! Click Edit to configure.");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2">
          <img src={shopableLogo} alt="Shopable" className="w-[140px] h-auto" />
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
            <Button
              onClick={handleExport}
              disabled={!videoSrc}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 pt-20">
        <VideoPlayer
          videoSrc={videoSrc}
          hotspots={hotspots}
          products={products}
          selectedHotspot={selectedHotspot}
          activeToolbarHotspotId={activeToolbarHotspotId}
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
          onAddHotspot={handleAddHotspot}
          onEditHotspot={setSelectedHotspot}
          onDeleteHotspot={handleDeleteHotspot}
          onHotspotSelect={handleHotspotSelect}
          onUpdateHotspotPosition={handleUpdateHotspotPosition}
        />
      </main>

      {/* Properties Sidebar */}
      <PropertiesPanel
        selectedHotspot={selectedHotspot}
        products={products}
        onUpdateHotspot={handleUpdateHotspot}
        onDeleteHotspot={handleDeleteHotspot}
        onUpdateProducts={setProducts}
        onClose={() => setSelectedHotspot(null)}
      />
    </div>
  );
};

export default Index;
