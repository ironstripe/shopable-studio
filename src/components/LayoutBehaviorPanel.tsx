import { useState, useEffect } from "react";
import { Hotspot, HotspotStyle, HotspotType, HotspotVariant, ClickBehavior, CardStyle, RetailCardVariant, FineLineCardVariant, LuxuryCardVariant, ECommerceCardVariant, EditorialCardVariant } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, AlertCircle } from "lucide-react";
import { usePanelResize } from "@/hooks/use-panel-resize";
import { usePanelDrag } from "@/hooks/use-panel-drag";
import { ResizeEdges } from "@/components/ResizeEdges";

interface LayoutBehaviorPanelProps {
  hotspot: Hotspot;
  videoDuration?: number;
  onUpdateHotspot: (hotspot: Hotspot) => void;
  onClose: () => void;
}

// Migration map for old styles to new unified variants
const migrateOldStyle = (style: string): HotspotStyle => {
  const migrationMap: Record<string, HotspotStyle> = {
    "icon-only-filled": "icon-only-small",
    "icon-only-outline": "icon-only-light",
    "icon-only-glow": "icon-only-strong",
    "icon-cta-pill-standard": "icon-cta-pill-small",
    "icon-cta-pill-compact": "icon-cta-pill-light",
    // Badge Bubble old variants migration
    "badge-bubble-small": "badge-bubble-classic",
    "badge-bubble-large": "badge-bubble-classic",
    "badge-bubble-light": "badge-bubble-outline",
    "badge-bubble-light-shadow": "badge-bubble-outline",
    "badge-bubble-strong": "badge-bubble-classic",
    "badge-bubble-strong-shadow": "badge-bubble-classic",
    // Fine Line (minimal-dot) old variants migration to new creative styles
    "minimal-dot-small": "minimal-dot-pure-line",
    "minimal-dot-large": "minimal-dot-soft-glass",
    "minimal-dot-light": "minimal-dot-editorial-slim",
    "minimal-dot-strong": "minimal-dot-micro-dot",
    "minimal-dot-default": "minimal-dot-pure-line",
    "minimal-dot-pulse": "minimal-dot-micro-dot",
    // Luxury Line old variants migration to new refined designs
    "luxury-line-serif-minimal": "luxury-line-serif-whisper",
    "luxury-line-floating-label": "luxury-line-glass-veil",
    "luxury-line-ultra-dot": "luxury-line-dot-reveal",
    // Editorial Line old variants migration
    "editorial-line-caption-box": "editorial-line-caption-frame",
    "editorial-line-editorial-marker": "editorial-line-dash-marker",
    // E-Commerce Line old variants migration
    "ecommerce-line-price-tag-compact": "ecommerce-line-compact-price-tag",
    "ecommerce-line-product-label-extended": "ecommerce-line-product-card-lite",
    "ecommerce-line-ecom-meta-strip": "ecommerce-line-label-strip",
  };
  return (migrationMap[style] || style) as HotspotStyle;
};

// Helper to extract type from combined style
const getTypeFromStyle = (style: HotspotStyle): HotspotType => {
  if (style.startsWith("icon-only")) return "icon-only";
  if (style.startsWith("icon-cta-pill")) return "icon-cta-pill";
  if (style.startsWith("badge-bubble")) return "badge-bubble";
  if (style.startsWith("luxury-line")) return "luxury-line";
  if (style.startsWith("ecommerce-line")) return "ecommerce-line";
  if (style.startsWith("editorial-line")) return "editorial-line";
  return "minimal-dot";
};

// Helper to extract variant from combined style
const getVariantFromStyle = (style: HotspotStyle): string => {
  if (style.startsWith("luxury-line-")) {
    // Return the specific luxury variant name
    return style.replace("luxury-line-", "");
  }
  if (style.startsWith("ecommerce-line-")) {
    // Return the specific ecommerce variant name
    return style.replace("ecommerce-line-", "");
  }
  if (style.startsWith("editorial-line-")) {
    // Return the specific editorial variant name
    return style.replace("editorial-line-", "");
  }
  const parts = style.split("-");
  const variant = parts[parts.length - 1];
  return variant;
};

const LayoutBehaviorPanel = ({
  hotspot,
  videoDuration = 60,
  onUpdateHotspot,
  onClose,
}: LayoutBehaviorPanelProps) => {
  // Migrate old style if needed
  const migratedStyle = migrateOldStyle(hotspot.style);
  
  const [selectedType, setSelectedType] = useState<HotspotType>(getTypeFromStyle(migratedStyle));
  const [selectedVariant, setSelectedVariant] = useState<string>(getVariantFromStyle(migratedStyle));
  const [ctaLabel, setCtaLabel] = useState(hotspot.ctaLabel);
  const [clickBehavior, setClickBehavior] = useState<ClickBehavior>(hotspot.clickBehavior);
  const [cardStyle, setCardStyle] = useState<CardStyle>(hotspot.cardStyle || "retail-compact");
  const [startTime, setStartTime] = useState(hotspot.timeStart.toFixed(1));
  const [duration, setDuration] = useState((hotspot.timeEnd - hotspot.timeStart).toFixed(1));

  const { width, height, rightEdgeProps, bottomEdgeProps, cornerProps } = usePanelResize({
    minWidth: 300,
    maxWidth: 520,
    minHeight: 300,
    maxHeight: 650,
    defaultWidth: 360,
    defaultHeight: 500,
  });

  const { offset, dragHandleProps } = usePanelDrag();

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Validation errors
  const [errors, setErrors] = useState<{ start?: string; duration?: string }>({});

  // Build full style string from type + variant
  const getFullStyle = (type: HotspotType, variant: string): HotspotStyle => {
    return `${type}-${variant}` as HotspotStyle;
  };

  const currentStyle = getFullStyle(selectedType, selectedVariant);

  const handleTypeChange = (type: HotspotType) => {
    setSelectedType(type);
    // Auto-select appropriate default variant and card style when switching families
    if (type === "badge-bubble") {
      setSelectedVariant("classic");
      setCardStyle("retail-compact");
    } else if (type === "minimal-dot") {
      setSelectedVariant("pure-line");
      setCardStyle("fineline-text-underline");
    } else if (type === "luxury-line") {
      setSelectedVariant("serif-whisper");
      setCardStyle("luxury-minimal");
    } else if (type === "ecommerce-line") {
      setSelectedVariant("compact-price-tag");
      setCardStyle("ecommerce-grid");
    } else if (type === "editorial-line") {
      setSelectedVariant("headline-tag");
      setCardStyle("editorial-article");
    } else {
      setSelectedVariant("small");
      setCardStyle("retail-compact");
    }
  };

  const validateInputs = () => {
    const start = parseFloat(startTime);
    const dur = parseFloat(duration);
    const newErrors: { start?: string; duration?: string } = {};

    if (isNaN(start) || start < 0) {
      newErrors.start = "Start must be ≥ 0";
    }
    if (isNaN(dur) || dur <= 0) {
      newErrors.duration = "Duration must be > 0";
    }
    if (!isNaN(start) && !isNaN(dur) && start + dur > videoDuration) {
      newErrors.duration = "Exceeds video length";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    const start = parseFloat(startTime);
    const dur = parseFloat(duration);

    onUpdateHotspot({
      ...hotspot,
      style: currentStyle,
      ctaLabel,
      clickBehavior,
      cardStyle,
      timeStart: start,
      timeEnd: start + dur,
    });
    onClose();
  };

  // Hotspot families
  const styleFamilies = [
    {
      id: "badge-bubble" as HotspotType,
      label: "Badge bubble",
      description: "Broader bubble with number and CTA, good for prominent calls.",
    },
    {
      id: "minimal-dot" as HotspotType,
      label: "Fine Line",
      description: "Ultra-clean, subtle hotspots for premium / luxury brands.",
    },
    {
      id: "luxury-line" as HotspotType,
      label: "Luxury Line",
      description: "Elegant, typography-focused hotspots for high-end luxury brands.",
    },
    {
      id: "ecommerce-line" as HotspotType,
      label: "E-Commerce Line",
      description: "Conversion-focused, clean hotspots for retail and product videos.",
    },
    {
      id: "editorial-line" as HotspotType,
      label: "Editorial Line",
      description: "Magazine-inspired, typographic hotspots with cinematic motion.",
    }
  ];

  // Render larger preview for family cards
  const renderFamilyPreview = (family: HotspotType) => {
    if (family === "badge-bubble") {
      return (
        <div className="bg-[#FF6A00] rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <span className="text-white text-sm font-bold">3</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white text-sm font-medium">Shop</span>
        </div>
      );
    }
    if (family === "minimal-dot") {
      return (
        <div className="flex items-center gap-2 border border-white/70 rounded px-3 py-1.5 bg-[#2A2A2A]">
          <span className="text-white text-sm font-light">3</span>
          <div className="w-[0.5px] h-4 bg-white/50" />
          <span className="text-white text-xs font-light tracking-wide">Shop</span>
        </div>
      );
    }
    if (family === "luxury-line") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-3 py-2 flex flex-col items-start gap-0.5">
          <span className="font-spectral text-sm font-light text-[#F7F5EF] tracking-wide">
            1. Product Name
          </span>
          <div className="w-20 h-[0.5px] bg-[#F7F5EF]/60" />
        </div>
      );
    }
    // ecommerce-line
    if (family === "ecommerce-line") {
      return (
        <div className="bg-white border border-[#E0E0E0] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <span className="text-[#111111] text-sm font-medium">3</span>
          <span className="text-[#9CA3AF] text-sm">·</span>
          <span className="text-[#111111] text-sm font-medium">349.–</span>
          <span className="text-[#3B82F6] text-sm">→</span>
        </div>
      );
    }
    // editorial-line
    return (
      <div className="bg-[#1A1A1A] rounded-lg px-3 py-2 flex flex-col items-start gap-0.5">
        <span className="font-playfair text-sm font-light text-white tracking-wide">
          Product Name
        </span>
        <div className="w-16 h-[0.5px] bg-white/70" />
      </div>
    );
  };

  // Get friendly family name for variant label
  const getFamilyDisplayName = (type: HotspotType): string => {
    const family = styleFamilies.find(f => f.id === type);
    return family?.label || type;
  };

  // Badge Bubble specific variants
  const badgeBubbleVariants = [
    { 
      value: "classic", 
      label: "Classic Bubble",
      description: "Solid filled, modern universal style"
    },
    { 
      value: "outline", 
      label: "Outline Bubble",
      description: "Minimal outline, lightweight feel"
    },
    { 
      value: "ghost", 
      label: "Ghost Bubble",
      description: "Semi-transparent with blur effect"
    },
    { 
      value: "accent-split", 
      label: "Accent Split",
      description: "Two-part with prominent CTA"
    }
  ];

  // Fine Line specific variants (creative style-based)
  const fineLineVariants = [
    { 
      value: "pure-line", 
      label: "Pure Line",
      description: "Ultra-thin outline, clean minimal style"
    },
    { 
      value: "soft-glass", 
      label: "Soft Glass Line",
      description: "Semi-transparent with subtle blur"
    },
    { 
      value: "editorial-slim", 
      label: "Editorial Slim Tag",
      description: "Magazine-style with thin borders"
    },
    { 
      value: "micro-dot", 
      label: "Micro Dot Label",
      description: "Dot indicator with text label"
    }
  ];

  // Luxury Line specific variants
  const luxuryLineVariants = [
    { 
      value: "serif-whisper", 
      label: "Serif Whisper Tag",
      description: "Thin serif with ultra-thin underline"
    },
    { 
      value: "gold-accent", 
      label: "Gold Accent Line",
      description: "Soft gold number with champagne underline"
    },
    { 
      value: "glass-veil", 
      label: "Glass Veil Label",
      description: "Translucent background with blur"
    },
    { 
      value: "dot-reveal", 
      label: "Minimal Dot Reveal",
      description: "Tiny dot with hover text reveal"
    }
  ];

  // E-Commerce Line specific variants
  const ecommerceLineVariants = [
    { 
      value: "compact-price-tag", 
      label: "Compact Price Tag",
      description: "Number + price + arrow in clean tag"
    },
    { 
      value: "label-strip", 
      label: "Label Strip",
      description: "Flat horizontal strip, marketplace style"
    },
    { 
      value: "cta-pill-focus", 
      label: "CTA Pill Focus",
      description: "Circle hotspot + prominent CTA pill"
    },
    { 
      value: "product-card-lite", 
      label: "Product Card Lite",
      description: "Minimal product block with card styling"
    }
  ];

  // Editorial Line specific variants
  const editorialLineVariants = [
    { 
      value: "headline-tag", 
      label: "Headline Tag",
      description: "Bold serif with thin underline and arrow"
    },
    { 
      value: "vertical-label", 
      label: "Vertical Label",
      description: "Vertical lettering with artistic flair"
    },
    { 
      value: "caption-frame", 
      label: "Caption Frame",
      description: "Thin rectangular frame with padding"
    },
    { 
      value: "dash-marker", 
      label: "Dash Marker",
      description: "Em-dash followed by product name"
    }
  ];

  // Get preview for Badge Bubble variants
  const getBadgeBubbleVariantPreview = (variant: string) => {
    if (variant === "classic") {
      return (
        <div className="flex items-center gap-1.5 bg-[#FF6A00] rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <span className="text-white font-medium text-[10px]">3</span>
          <span className="text-white/60 text-[10px]">•</span>
          <span className="text-white font-medium text-[9px]">Shop</span>
        </div>
      );
    }
    
    if (variant === "outline") {
      return (
        <div className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-[#FF6A00] rounded-full px-3 py-1.5">
          <span className="text-[#FF6A00] font-medium text-[10px]">3</span>
          <span className="text-[#FF6A00]/60 text-[10px]">•</span>
          <span className="text-[#FF6A00] font-medium text-[9px]">Shop</span>
        </div>
      );
    }
    
    if (variant === "ghost") {
      return (
        <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-[6px] rounded-full px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <span className="text-white font-medium text-[10px]">3</span>
          <span className="text-white/60 text-[10px]">•</span>
          <span className="text-white font-medium text-[9px]">Shop</span>
        </div>
      );
    }
    
    // accent-split
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-[#FF6A00] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center">
          <span className="text-white font-bold text-[9px]">3</span>
        </div>
        <div className="bg-[#FF6A00] rounded-full px-2 py-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <span className="text-white font-medium text-[8px]">Shop</span>
        </div>
      </div>
    );
  };

  // Get preview for E-Commerce Line variants
  const getEcommerceLineVariantPreview = (variant: string) => {
    if (variant === "compact-price-tag") {
      return (
        <div className="bg-white border border-[#E0E0E0] rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
          <span className="text-[#111111] text-[10px] font-medium">3</span>
          <span className="text-[#9CA3AF] text-[10px]">·</span>
          <span className="text-[#111111] text-[10px] font-medium">349.–</span>
          <span className="text-[#3B82F6] text-[10px]">→</span>
        </div>
      );
    }
    
    if (variant === "label-strip") {
      return (
        <div className="bg-[#F5F5F5] rounded px-2.5 py-1 flex items-center justify-between gap-4 min-w-[80px]">
          <span className="text-[#111111] text-[10px] font-medium">Product</span>
          <span className="text-[#6B7280] text-[10px]">349.–</span>
        </div>
      );
    }
    
    if (variant === "cta-pill-focus") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] flex items-center justify-center">
            <span className="text-[#111111] text-[8px] font-medium">3</span>
          </div>
          <div className="bg-[#3B82F6] rounded-full px-2.5 py-0.5">
            <span className="text-white text-[9px] font-medium">Shop</span>
          </div>
        </div>
      );
    }
    
    // product-card-lite
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-lg px-2.5 py-1.5">
        <span className="text-[#111111] text-[10px] font-medium">Product</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[#6B7280] text-[9px]">349.–</span>
          <span className="text-[#3B82F6] text-[9px]">→</span>
        </div>
      </div>
    );
  };

  // Get preview for Luxury Line variants
  const getLuxuryLineVariantPreview = (variant: string) => {
    if (variant === "serif-whisper") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex flex-col items-start gap-0.5">
          <span className="font-spectral text-[10px] font-light text-[#F7F5EF] tracking-wide">
            1. Product
          </span>
          <div className="w-12 h-[0.5px] bg-[#F7F5EF]/60" />
        </div>
      );
    }
    
    if (variant === "gold-accent") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1">
            <span className="font-spectral text-[10px] font-light text-[#D6C29A]">1.</span>
            <span className="font-spectral text-[10px] font-light text-white tracking-wide">Product</span>
          </div>
          <div className="w-12 h-[0.5px] bg-[#C9B58F]" />
        </div>
      );
    }
    
    if (variant === "glass-veil") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2">
          <div className="bg-white/10 backdrop-blur-[6px] border border-white/20 rounded px-2 py-1">
            <span className="text-[10px] font-light text-white">Product</span>
          </div>
        </div>
      );
    }
    
    // dot-reveal
    return (
      <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex items-center gap-1.5">
        <div className="w-[2px] h-[2px] rounded-full bg-[#F7F5EF]" />
        <span className="text-[9px] font-light text-white/60">Shop</span>
      </div>
    );
  };

  // Unified variants with dynamic previews
  const getVariantPreview = (family: HotspotType, variant: string) => {
    const baseScale = variant === "small" ? 0.9 : variant === "large" ? 1.15 : 1;
    const borderWeight = variant === "light" ? "border" : variant === "strong" ? "border-2" : "border-2";
    const shadowIntensity = variant === "light" ? "shadow-sm" : variant === "strong" ? "shadow-lg" : "shadow-md";

    if (family === "icon-only") {
      return (
        <div className="flex items-center justify-center" style={{ transform: `scale(${baseScale})` }}>
          <div className={`w-8 h-8 rounded-full bg-[#FF6A00] ${borderWeight} border-white ${shadowIntensity} flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">3</span>
          </div>
        </div>
      );
    }

    if (family === "icon-cta-pill") {
      return (
        <div className="flex items-center gap-1.5" style={{ transform: `scale(${baseScale})` }}>
          <div className={`w-6 h-6 rounded-full bg-[#FF6A00] ${borderWeight} border-white ${shadowIntensity} flex items-center justify-center`}>
            <span className="text-white text-[10px] font-bold">3</span>
          </div>
          <div className={`bg-[#FF6A00] ${borderWeight} border-white rounded-full px-2 py-0.5 ${shadowIntensity}`}>
            <span className="text-white text-[9px] font-medium">Shop</span>
          </div>
        </div>
      );
    }

    if (family === "badge-bubble") {
      const borderColor = variant === "light" ? "border-black/40" : "border-black";
      return (
        <div className="flex items-center justify-center" style={{ transform: `scale(${baseScale})` }}>
          <div className={`bg-[#FF6A00] ${borderWeight} ${borderColor} rounded-full px-3 py-1 ${shadowIntensity} flex items-center gap-1.5`}>
            <span className="text-white text-[10px] font-bold">3</span>
            <span className="text-white/60 text-[10px]">•</span>
            <span className="text-white text-[10px] font-medium">Shop</span>
          </div>
        </div>
      );
    }

    // minimal-dot (Fine Line) - with semi-transparent backgrounds
    const bgOpacity = variant === "light" ? "bg-black/20" : variant === "strong" ? "bg-black/45" : variant === "large" ? "bg-black/35" : "bg-black/30";
    const blur = variant === "strong" ? "" : "backdrop-blur-sm";
    return (
      <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2">
        <div className={`flex items-center gap-1.5 ${bgOpacity} ${blur} rounded-full px-2.5 py-1`} style={{ transform: `scale(${baseScale})` }}>
          <span className="text-white text-[11px] font-medium">3</span>
          <span className="text-white/50 text-[11px]">•</span>
          <span className="text-white text-[11px]">Shop</span>
        </div>
      </div>
    );
  };

  const unifiedVariants: Array<{ value: string; label: string; description: string }> = [
    { value: "small", label: "Small", description: "Compact size (default)" },
    { value: "large", label: "Large", description: "Larger footprint for visibility" },
    { value: "light", label: "Light", description: "Thinner border, soft shadow" },
    { value: "strong", label: "Strong", description: "Higher contrast, stronger border" },
  ];

  // Get preview for Fine Line variants
  const getFineLineVariantPreview = (variant: string) => {
    if (variant === "pure-line") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex items-center gap-1.5 border border-white/70">
          <span className="text-white text-[10px] font-light">3</span>
          <div className="w-[0.5px] h-3 bg-white/50" />
          <span className="text-white text-[9px] font-light tracking-wide">Shop</span>
        </div>
      );
    }
    
    if (variant === "soft-glass") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-[3px] border border-white/30 rounded px-2 py-1">
            <span className="text-white text-[10px] font-light">3</span>
            <span className="text-white/50 text-[10px]">•</span>
            <span className="text-white text-[9px] font-light">Shop</span>
          </div>
        </div>
      );
    }
    
    if (variant === "editorial-slim") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
          <div className="w-12 h-[0.5px] bg-white/60" />
          <div className="flex items-center gap-1 px-1.5 py-0.5">
            <span className="text-white text-[8px] font-light align-super">3</span>
            <span className="text-white text-[9px] font-light tracking-wider">SHOP</span>
          </div>
          <div className="w-12 h-[0.5px] bg-white/60" />
        </div>
      );
    }
    
    // micro-dot
    return (
      <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex items-center justify-center gap-1.5">
        <div className="w-[4px] h-[4px] rounded-full bg-white opacity-60" />
        <span className="text-white text-[9px] font-light">Shop</span>
      </div>
    );
  };

  // Get preview for Editorial Line variants
  const getEditorialLineVariantPreview = (variant: string) => {
    if (variant === "headline-tag") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2 flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1">
            <span className="font-playfair text-[11px] font-normal text-white tracking-wide">
              Product
            </span>
            <span className="text-white/60 text-[10px]">→</span>
          </div>
          <div className="w-10 h-[0.5px] bg-white/80" />
        </div>
      );
    }
    
    if (variant === "vertical-label") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2 flex flex-col items-center gap-1">
          <div className="flex flex-col items-center text-[9px] font-playfair font-light text-white tracking-wider leading-tight">
            <span>S</span><span>H</span><span>O</span><span>P</span>
          </div>
          <div className="w-4 h-[0.5px] bg-white/70" />
          <span className="text-[8px] text-white/60">View →</span>
        </div>
      );
    }
    
    if (variant === "caption-frame") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg px-2 py-1.5">
          <div className="border border-white/70 rounded px-2.5 py-1.5">
            <span className="font-spectral text-[9px] font-light text-white">Product</span>
            <span className="text-white/60 text-[8px] ml-1">349.–</span>
          </div>
        </div>
      );
    }
    
    // dash-marker
    return (
      <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2 flex items-center gap-1.5">
        <span className="font-spectral text-[10px] font-light text-white tracking-wide">— Product</span>
        <span className="text-white/50 text-[9px]">More</span>
      </div>
    );
  };

  // Determine which variants to show based on selected family
  const currentVariants = 
    selectedType === "badge-bubble" ? badgeBubbleVariants :
    selectedType === "minimal-dot" ? fineLineVariants :
    selectedType === "luxury-line" ? luxuryLineVariants : 
    selectedType === "ecommerce-line" ? ecommerceLineVariants : 
    selectedType === "editorial-line" ? editorialLineVariants :
    unifiedVariants;

  // Product Card Preview Renderers - Unique visuals for each variant
  const getRetailCardPreview = (variant: string) => {
    if (variant === "retail-compact") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-1.5 w-full shadow-sm">
          <div className="flex gap-1.5 mb-1">
            <div className="w-5 h-5 rounded bg-[#E5E7EB]" />
            <div className="flex-1">
              <div className="h-1.5 w-10 bg-[#374151] rounded-full mb-0.5" />
              <div className="h-1.5 w-6 bg-[#3B82F6] rounded-full" />
            </div>
          </div>
          <div className="h-3 w-full bg-[#3B82F6] rounded" />
        </div>
      );
    }
    if (variant === "retail-split") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-1.5 w-full shadow-sm">
          <div className="h-4 w-full bg-[#E5E7EB] rounded mb-1" />
          <div className="h-1.5 w-12 bg-[#374151] rounded-full mb-1" />
          <div className="h-[0.5px] w-full bg-[#E0E0E0] mb-1" />
          <div className="flex items-center justify-between">
            <div className="h-2 w-5 bg-[#3B82F6] rounded-full" />
            <div className="h-2.5 w-8 bg-[#3B82F6] rounded" />
          </div>
        </div>
      );
    }
    if (variant === "retail-media") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-1.5 w-full shadow-sm">
          <div className="flex gap-1.5">
            <div className="w-8 h-8 rounded bg-[#E5E7EB]" />
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-1.5 w-8 bg-[#374151] rounded-full" />
              <div className="h-1.5 w-5 bg-[#3B82F6] rounded-full" />
              <div className="h-2 w-10 bg-[#3B82F6] rounded self-start" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-1.5 w-full shadow-sm text-center">
        <div className="w-5 h-5 rounded bg-[#E5E7EB] mx-auto mb-1" />
        <div className="h-1 w-10 bg-[#9CA3AF] rounded-full mx-auto mb-1" />
        <div className="h-3 w-8 bg-[#3B82F6] rounded-full mx-auto mb-1" />
        <div className="h-2 w-12 bg-[#3B82F6] rounded mx-auto" />
      </div>
    );
  };

  const getFineLineCardPreview = (variant: string) => {
    if (variant === "fineline-text-underline") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg p-2 w-full text-center">
          <div className="h-1.5 w-12 bg-white/90 rounded-full mx-auto mb-1" />
          <div className="h-[0.5px] w-8 bg-white/60 mx-auto mb-1" />
          <div className="h-1 w-6 bg-white/50 rounded-full mx-auto" />
        </div>
      );
    }
    if (variant === "fineline-text-baseline") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg p-2 w-full">
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-1.5 w-10 bg-white/90 rounded-full" />
            <div className="h-1.5 w-5 bg-white/60 rounded-full" />
          </div>
          <div className="flex items-center gap-0.5 justify-end">
            <div className="h-1 w-4 bg-white/50 rounded-full" />
            <div className="text-white/50 text-[6px]">→</div>
          </div>
        </div>
      );
    }
    if (variant === "fineline-subtle-caption") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg p-2 w-full text-center">
          <div className="h-1 w-14 bg-white/90 rounded-full mx-auto mb-1" />
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="flex-1 border-b border-dotted border-white/30" />
            <div className="h-1 w-4 bg-white/60 rounded-full" />
            <div className="flex-1 border-b border-dotted border-white/30" />
          </div>
        </div>
      );
    }
    return (
      <div className="bg-[#2A2A2A] rounded-lg p-2 w-full">
        <div className="flex gap-1.5">
          <div className="w-5 h-5 rounded bg-white/20" />
          <div className="flex-1">
            <div className="h-1.5 w-8 bg-white/90 rounded-full mb-0.5" />
            <div className="h-1 w-4 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  const getLuxuryCardPreview = (variant: string) => {
    if (variant === "luxury-minimal") {
      return (
        <div className="bg-white/95 rounded-lg p-2 w-full text-center shadow-sm">
          <div className="h-1.5 w-12 bg-[#1a1a1a] rounded-full mx-auto mb-1.5" />
          <div className="h-1 w-5 bg-[#666] rounded-full mx-auto mb-1.5" />
          <div className="h-2 w-14 border border-[#ccc] rounded-full mx-auto" />
        </div>
      );
    }
    if (variant === "luxury-image-focus") {
      return (
        <div className="bg-white/95 rounded-lg overflow-hidden w-full shadow-sm">
          <div className="h-6 w-full bg-gradient-to-br from-[#f0f0f0] to-[#e5e5e5]" />
          <div className="p-1.5">
            <div className="h-1.5 w-10 bg-[#1a1a1a] rounded-full mb-1" />
            <div className="h-1 w-5 bg-[#666] rounded-full" />
          </div>
        </div>
      );
    }
    if (variant === "luxury-split") {
      return (
        <div className="bg-white/95 rounded-lg p-2 w-full shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="h-1.5 w-10 bg-[#1a1a1a] rounded-full mb-1" />
              <div className="h-[0.5px] w-full bg-[#e0e0e0]" />
            </div>
            <div className="flex flex-col items-end">
              <div className="h-2 w-6 bg-[#1a1a1a] rounded-full mb-1" />
              <div className="h-1.5 w-8 border border-[#ccc] rounded-full" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white/95 rounded-lg p-2 w-full text-center shadow-sm">
        <div className="h-1 w-10 bg-[#999] rounded-full mx-auto mb-1" />
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className="w-3 h-[0.5px] bg-[#ccc]" />
          <div className="h-3 w-7 bg-[#1a1a1a] rounded-full" />
          <div className="w-3 h-[0.5px] bg-[#ccc]" />
        </div>
        <div className="h-1 w-8 bg-[#666] rounded-full mx-auto" />
      </div>
    );
  };

  const getEcommerceCardPreview = (variant: string) => {
    if (variant === "ecommerce-grid") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] overflow-hidden w-full shadow-sm">
          <div className="h-7 w-full bg-[#F5F5F5]" />
          <div className="p-1.5">
            <div className="h-1.5 w-10 bg-[#111] rounded-full mb-1" />
            <div className="h-2 w-6 bg-[#F97316] rounded-full mb-1" />
            <div className="h-2.5 w-full bg-[#3B82F6] rounded" />
          </div>
        </div>
      );
    }
    if (variant === "ecommerce-badge") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-2 w-full shadow-sm">
          <div className="flex gap-1.5 mb-1.5">
            <div className="h-4 w-6 bg-[#3B82F6] rounded flex items-center justify-center">
              <span className="text-white text-[6px] font-bold">$349</span>
            </div>
            <div className="flex-1">
              <div className="h-1.5 w-10 bg-[#111] rounded-full" />
            </div>
          </div>
          <div className="h-2 w-8 bg-[#3B82F6] rounded" />
        </div>
      );
    }
    if (variant === "ecommerce-retail-promo") {
      return (
        <div className="bg-white rounded-lg border border-[#E0E0E0] overflow-hidden w-full shadow-sm">
          <div className="h-2 w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] flex items-center justify-center">
            <span className="text-white text-[5px] font-bold">SALE -20%</span>
          </div>
          <div className="h-5 w-full bg-[#F5F5F5]" />
          <div className="p-1.5">
            <div className="h-1.5 w-10 bg-[#111] rounded-full mb-1" />
            <div className="flex gap-1 mb-1">
              <div className="h-1 w-4 bg-[#9CA3AF] rounded-full line-through" />
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-2 w-full shadow-sm">
        <div className="flex items-center mb-1.5">
          <div className="h-4 w-8 bg-[#3B82F6] rounded-l flex items-center justify-center">
            <span className="text-white text-[7px] font-bold">$349</span>
          </div>
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#3B82F6]" />
        </div>
        <div className="h-1.5 w-10 bg-[#111] rounded-full mb-1" />
        <div className="text-[#3B82F6] text-[8px]">→</div>
      </div>
    );
  };

  const getEditorialCardPreview = (variant: string) => {
    if (variant === "editorial-article") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg p-2 w-full">
          <div className="h-[0.5px] w-full bg-white/50 mb-1.5" />
          <div className="h-2 w-12 bg-white/90 rounded-full mb-1" />
          <div className="h-1 w-full bg-white/40 rounded-full mb-1" />
          <div className="h-[0.5px] w-full bg-white/50 mb-1" />
          <div className="flex items-center gap-0.5 justify-end">
            <div className="h-1 w-6 bg-white/60 rounded-full" />
            <div className="text-white/60 text-[6px]">→</div>
          </div>
        </div>
      );
    }
    if (variant === "editorial-caption") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden w-full">
          <div className="h-6 w-full bg-[#333]" />
          <div className="p-1.5">
            <div className="h-1.5 w-10 bg-white/90 rounded-full mb-1" />
            <div className="flex items-center gap-1">
              <div className="h-1 w-4 bg-white/50 rounded-full" />
              <span className="text-white/40 text-[5px]">·</span>
              <div className="text-white/50 text-[6px]">→</div>
            </div>
          </div>
        </div>
      );
    }
    if (variant === "editorial-quote") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg p-2 w-full">
          <div className="text-white/30 text-[14px] leading-none">"</div>
          <div className="h-1.5 w-14 bg-white/90 rounded-full ml-2 mb-1" />
          <div className="text-white/30 text-[14px] leading-none text-right">"</div>
          <div className="h-1 w-5 bg-white/60 rounded-full ml-auto" />
        </div>
      );
    }
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-2 w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="h-1.5 w-10 bg-white/90 rounded-full" />
          <div className="h-1.5 w-5 bg-white/60 rounded-full" />
        </div>
        <div className="flex items-center gap-0.5 justify-end">
          <div className="h-1 w-4 bg-white/50 rounded-full" />
          <div className="text-white/50 text-[6px]">→</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E1E4E8] overflow-hidden flex flex-col"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header - Drag Handle */}
      <div 
        className="px-4 py-3 border-b border-[#E1E4E8]"
        {...dragHandleProps}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[#111827]">Layout & Behavior</h3>
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <p className="text-xs text-[#6B7280]">
          Step 1: Choose a hotspot family. Step 2: Pick a style.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        
        {/* 1) HOTSPOT FAMILY Section - Large horizontal cards */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Hotspot Family
          </Label>
          <div className="space-y-3">
            {styleFamilies.map((family) => {
              const isSelected = selectedType === family.id;
              return (
                <button
                  key={family.id}
                  onClick={() => handleTypeChange(family.id)}
                  className={`
                    relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                    hover:border-[#3B82F6]/50 hover:bg-blue-50/30
                    ${isSelected 
                      ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                      : 'border-[#E1E4E8] bg-white'}
                  `}
                >
                  {/* Checkmark indicator */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Preview on left */}
                  <div className="flex-shrink-0 ml-6">
                    {renderFamilyPreview(family.id)}
                  </div>
                  
                  {/* Title and description on right */}
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827] text-sm mb-1">
                      {family.label}
                    </div>
                    <div className="text-xs text-[#6B7280] leading-snug">
                      {family.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2) STYLE VARIANTS Section - Conditional rendering */}
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              Style Variants
            </Label>
            <div className="text-xs text-[#6B7280] mt-1">
              {getFamilyDisplayName(selectedType)} styles
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {currentVariants.map((variant) => (
              <button
                key={variant.value}
                onClick={() => setSelectedVariant(variant.value)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${selectedVariant === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="flex items-center justify-center h-9">
                  {selectedType === "badge-bubble"
                    ? getBadgeBubbleVariantPreview(variant.value)
                    : selectedType === "minimal-dot"
                    ? getFineLineVariantPreview(variant.value)
                    : selectedType === "luxury-line" 
                    ? getLuxuryLineVariantPreview(variant.value)
                    : selectedType === "ecommerce-line"
                    ? getEcommerceLineVariantPreview(variant.value)
                    : selectedType === "editorial-line"
                    ? getEditorialLineVariantPreview(variant.value)
                    : getVariantPreview(selectedType, variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">
                    {variant.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3) PRODUCT CARD STYLE Section - Family-dependent card variants */}
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              Product Card Style
            </Label>
            <div className="text-xs text-[#6B7280] mt-1">
              {selectedType === "badge-bubble" && "Retail card layouts"}
              {selectedType === "minimal-dot" && "Fine Line card layouts"}
              {selectedType === "luxury-line" && "Luxury card layouts"}
              {selectedType === "ecommerce-line" && "E-Commerce card layouts"}
              {selectedType === "editorial-line" && "Editorial card layouts"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {/* Badge Bubble → Retail Cards */}
            {selectedType === "badge-bubble" && [
              { value: "retail-compact", label: "Retail Compact", desc: "Title + Price inline" },
              { value: "retail-split", label: "Retail Split", desc: "Two-row layout" },
              { value: "retail-media", label: "Retail Media", desc: "With thumbnail" },
              { value: "retail-price-focus", label: "Retail Price Focus", desc: "Large centered price" },
            ].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setCardStyle(variant.value as RetailCardVariant)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${cardStyle === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="h-12 flex items-center justify-center w-full">
                  {getRetailCardPreview(variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{variant.desc}</div>
                </div>
              </button>
            ))}

            {/* Fine Line → Fine Line Cards */}
            {selectedType === "minimal-dot" && [
              { value: "fineline-text-underline", label: "Text Underline", desc: "Minimal with subtle underline" },
              { value: "fineline-text-baseline", label: "Text Baseline", desc: "Clean baseline typography" },
              { value: "fineline-subtle-caption", label: "Subtle Caption", desc: "Small caption style" },
              { value: "fineline-micro-line", label: "Micro Line Card", desc: "Ultra-minimal line design" },
            ].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setCardStyle(variant.value as FineLineCardVariant)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${cardStyle === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="h-12 flex items-center justify-center w-full">
                  {getFineLineCardPreview(variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{variant.desc}</div>
                </div>
              </button>
            ))}

            {/* Luxury Line → Luxury Cards */}
            {selectedType === "luxury-line" && [
              { value: "luxury-minimal", label: "Luxury Minimal Card", desc: "Clean elegant minimal" },
              { value: "luxury-image-focus", label: "Luxury Image Focus", desc: "Image-dominant layout" },
              { value: "luxury-split", label: "Luxury Split Card", desc: "Two-part elegant layout" },
              { value: "luxury-price-highlight", label: "Luxury Price Highlight", desc: "Price-focused luxury style" },
            ].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setCardStyle(variant.value as LuxuryCardVariant)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${cardStyle === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="h-12 flex items-center justify-center w-full">
                  {getLuxuryCardPreview(variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{variant.desc}</div>
                </div>
              </button>
            ))}

            {/* E-Commerce Line → E-Commerce Cards */}
            {selectedType === "ecommerce-line" && [
              { value: "ecommerce-grid", label: "Grid Card", desc: "Grid-style product layout" },
              { value: "ecommerce-badge", label: "Badge Card", desc: "Badge-style compact card" },
              { value: "ecommerce-price-tag", label: "Price Tag Card", desc: "Price tag design" },
              { value: "ecommerce-retail-promo", label: "Retail Promo Card", desc: "Promotional style" },
            ].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setCardStyle(variant.value as ECommerceCardVariant)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${cardStyle === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="h-12 flex items-center justify-center w-full">
                  {getEcommerceCardPreview(variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{variant.desc}</div>
                </div>
              </button>
            ))}

            {/* Editorial Line → Editorial Cards */}
            {selectedType === "editorial-line" && [
              { value: "editorial-article", label: "Article Card", desc: "Magazine article style" },
              { value: "editorial-caption", label: "Caption Card", desc: "Photo caption style" },
              { value: "editorial-quote", label: "Quote Card", desc: "Pull quote style" },
              { value: "editorial-minimal-info", label: "Minimal Info Card", desc: "Minimal information display" },
            ].map((variant) => (
              <button
                key={variant.value}
                onClick={() => setCardStyle(variant.value as EditorialCardVariant)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${cardStyle === variant.value 
                    ? 'border-[#3B82F6] bg-[#EFF6FF]' 
                    : 'border-[#E1E4E8] bg-white hover:border-[#D1D5DB]'}
                `}
              >
                <div className="h-12 flex items-center justify-center w-full">
                  {getEditorialCardPreview(variant.value)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#374151]">{variant.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{variant.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4) CTA LABEL Section - For Badge bubble, E-Commerce Line, and Editorial Line */}
        {(selectedType === "badge-bubble" || selectedType === "ecommerce-line" || selectedType === "editorial-line") && (
          <div className="space-y-2">
            <Label htmlFor="cta-input" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              CTA Label
            </Label>
            <Input
              id="cta-input"
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g., Shop, Buy now, More info"
              className="h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
        )}

        {/* 5) CLICK BEHAVIOR Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Click Behavior
          </Label>
          <RadioGroup value={clickBehavior} onValueChange={(val) => setClickBehavior(val as ClickBehavior)}>
            <div className="space-y-3">
              {/* Show Product Card */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="show-card" id="show-card" className="mt-0.5" />
                <label htmlFor="show-card" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Show Product Card</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    User first sees the preview card overlay. Clicking inside the card opens the product URL.
                  </div>
                </label>
              </div>

              {/* Direct Link */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="direct-link" id="direct-link" className="mt-0.5" />
                <label htmlFor="direct-link" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">Direct Link</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Clicking the hotspot goes directly to the product URL without showing the card.
                  </div>
                </label>
              </div>

              {/* No Action */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no-action" id="no-action" className="mt-0.5" />
                <label htmlFor="no-action" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium text-[#374151]">No Action</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Hotspot is visual only. Useful for storytelling.
                  </div>
                </label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* 6) TIMING Section */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Timing
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs text-[#6B7280]">
                Start Time (s)
              </Label>
              <Input
                id="start-time"
                type="number"
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors({ ...errors, start: undefined });
                }}
                className={`h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] ${
                  errors.start ? 'border-[#EF4444]' : ''
                }`}
              />
              {errors.start && (
                <div className="flex items-center gap-1 text-[#EF4444] text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.start}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs text-[#6B7280]">
                Duration (s)
              </Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setErrors({ ...errors, duration: undefined });
                }}
                className={`h-9 text-sm text-[#111827] bg-white border-[#E1E4E8] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] ${
                  errors.duration ? 'border-[#EF4444]' : ''
                }`}
              />
              {errors.duration && (
                <div className="flex items-center gap-1 text-[#EF4444] text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.duration}</span>
                </div>
              )}
            </div>
          </div>
          {/* Read-only End Time display */}
          <div className="text-xs text-[#6B7280] pt-1">
            End Time: {(parseFloat(startTime) + parseFloat(duration)).toFixed(1)}s
          </div>
        </div>

      </div>

      {/* Footer - Also a Drag Handle */}
      <div 
        className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E1E4E8]"
        {...dragHandleProps}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-[#6B7280] hover:text-[#374151]"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-[#0E76FD] hover:bg-[#0E76FD]/90 text-white"
        >
          Save
        </Button>
      </div>

      {/* Resize Edges */}
      <ResizeEdges 
        rightEdgeProps={rightEdgeProps}
        bottomEdgeProps={bottomEdgeProps}
        cornerProps={cornerProps}
      />
    </div>
  );
};

export default LayoutBehaviorPanel;