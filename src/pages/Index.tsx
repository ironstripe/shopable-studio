import { useState, useRef } from "react";
import { Hotspot, Product, VideoProject } from "@/types/video";
import VideoPlayer from "@/components/VideoPlayer";
import PropertiesPanel from "@/components/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import shopableLogo from "@/assets/shopable-logo.png";

const Index = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo products
  const [products] = useState<Record<string, Product>>({
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
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      timeStart: time,
      timeEnd: time + 3,
      x,
      y,
      productId: Object.keys(products)[0],
    };
    setHotspots([...hotspots, newHotspot]);
    setSelectedHotspot(newHotspot);
    toast.success("Hotspot added");
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
    toast.success("Hotspot deleted");
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
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <img src={shopableLogo} alt="Shopable" className="h-10" />
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
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer
              videoSrc={videoSrc}
              hotspots={hotspots}
              products={products}
              onAddHotspot={handleAddHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </div>
          <div>
            <PropertiesPanel
              selectedHotspot={selectedHotspot}
              products={products}
              onUpdateHotspot={handleUpdateHotspot}
              onDeleteHotspot={handleDeleteHotspot}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
