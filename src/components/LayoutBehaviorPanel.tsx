import { useState } from "react";
import { Hotspot, HotspotStyle, HotspotType, HotspotVariant, ClickBehavior } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, AlertCircle } from "lucide-react";
import { usePanelResize } from "@/hooks/use-panel-resize";
import { ResizeHandle } from "@/components/ResizeHandle";

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
  const [startTime, setStartTime] = useState(hotspot.timeStart.toFixed(1));
  const [duration, setDuration] = useState((hotspot.timeEnd - hotspot.timeStart).toFixed(1));

  const { width, height, resizeHandleProps } = usePanelResize({
    minWidth: 300,
    maxWidth: 520,
    minHeight: 300,
    maxHeight: 650,
    defaultWidth: 360,
    defaultHeight: 500,
  });

  // Validation errors
  const [errors, setErrors] = useState<{ start?: string; duration?: string }>({});

  // Build full style string from type + variant
  const getFullStyle = (type: HotspotType, variant: string): HotspotStyle => {
    return `${type}-${variant}` as HotspotStyle;
  };

  const currentStyle = getFullStyle(selectedType, selectedVariant);

  const handleTypeChange = (type: HotspotType) => {
    setSelectedType(type);
    // Auto-select appropriate default variant when switching families
    if (type === "badge-bubble") {
      setSelectedVariant("classic");
    } else if (type === "minimal-dot") {
      setSelectedVariant("pure-line");
    } else if (type === "luxury-line") {
      setSelectedVariant("serif-minimal");
    } else if (type === "ecommerce-line") {
      setSelectedVariant("price-tag-compact");
    } else if (type === "editorial-line") {
      setSelectedVariant("headline-tag");
    } else {
      setSelectedVariant("small");
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
        <div className="bg-[#FF6A00] border-2 border-black rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <span className="text-white text-sm font-bold">3</span>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white text-sm font-medium">Shop</span>
        </div>
      );
    }
    if (family === "minimal-dot") {
      return (
        <div className="flex items-center gap-2 text-[#FF6A00]/80 text-base">
          <span className="font-medium">3</span>
          <span className="opacity-50">•</span>
          <span>Shop</span>
        </div>
      );
    }
    if (family === "luxury-line") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-3 py-2 flex flex-col items-start gap-0.5">
          <span className="font-spectral text-sm font-light text-white tracking-wide">
            1. Product Name
          </span>
          <div className="w-16 h-[1px] bg-[#E8DCC0]" />
        </div>
      );
    }
    // ecommerce-line
    if (family === "ecommerce-line") {
      return (
        <div className="bg-white border border-[#E0E0E0] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <span className="text-[#111111] text-sm font-medium">3</span>
          <span className="text-[#6B7280] text-sm">·</span>
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
      value: "serif-minimal", 
      label: "Luxury Serif Minimal",
      description: "Editorial style with thin underline"
    },
    { 
      value: "gold-accent", 
      label: "Luxury Gold Accent",
      description: "Gold number and champagne underline"
    },
    { 
      value: "floating-label", 
      label: "Minimal Floating Label",
      description: "Translucent background label"
    },
    { 
      value: "ultra-dot", 
      label: "Ultra Minimal Dot",
      description: "Tiny dot with hover reveal"
    }
  ];

  // E-Commerce Line specific variants
  const ecommerceLineVariants = [
    { 
      value: "price-tag-compact", 
      label: "Price Tag Compact",
      description: "Number, price, and mini-CTA"
    },
    { 
      value: "product-label-extended", 
      label: "Product Label Extended",
      description: "Two-line with name and price"
    },
    { 
      value: "cta-pill-focus", 
      label: "CTA Pill Focus",
      description: "Circle hotspot + CTA pill"
    },
    { 
      value: "ecom-meta-strip", 
      label: "E-Com Meta Strip",
      description: "Flat horizontal strip"
    }
  ];

  // Editorial Line specific variants
  const editorialLineVariants = [
    { 
      value: "headline-tag", 
      label: "Headline Tag",
      description: "Horizontal label with thin underline"
    },
    { 
      value: "vertical-label", 
      label: "Vertical Label",
      description: "Vertical lettering with artistic flair"
    },
    { 
      value: "caption-box", 
      label: "Caption Box",
      description: "Magazine caption with minimal border"
    },
    { 
      value: "editorial-marker", 
      label: "Editorial Marker",
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
    if (variant === "price-tag-compact") {
      return (
        <div className="bg-white border border-[#E0E0E0] rounded-lg px-2 py-1 flex items-center gap-1.5">
          <span className="text-[#111111] text-[10px] font-medium">3</span>
          <span className="text-[#9CA3AF] text-[10px]">·</span>
          <span className="text-[#111111] text-[10px] font-medium">349.–</span>
          <span className="text-[#3B82F6] text-[10px]">→</span>
        </div>
      );
    }
    
    if (variant === "product-label-extended") {
      return (
        <div className="bg-white border border-[#E0E0E0] rounded-lg px-2 py-1.5 flex flex-col items-start">
          <span className="text-[#111111] text-[9px] font-medium leading-tight">Product</span>
          <div className="flex items-center gap-1">
            <span className="text-[#6B7280] text-[9px]">349.–</span>
            <span className="text-[#6B7280] text-[9px]">·</span>
            <span className="text-[#3B82F6] text-[9px] font-medium">Shop →</span>
          </div>
        </div>
      );
    }
    
    if (variant === "cta-pill-focus") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] flex items-center justify-center">
            <span className="text-[#111111] text-[8px] font-medium">3</span>
          </div>
          <div className="bg-[#3B82F6] rounded-full px-2 py-0.5">
            <span className="text-white text-[9px] font-medium">Shop</span>
          </div>
        </div>
      );
    }
    
    // ecom-meta-strip
    return (
      <div className="bg-[#F5F5F5] border border-[#EAEAEA] rounded px-2 py-1 flex items-center justify-between gap-3">
        <span className="text-[#111111] text-[9px] font-medium">Product</span>
        <span className="text-[#6B7280] text-[9px]">349.–</span>
      </div>
    );
  };

  // Get preview for Luxury Line variants
  const getLuxuryLineVariantPreview = (variant: string) => {
    if (variant === "serif-minimal") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
          <span className="font-spectral text-[10px] font-light text-white/90 tracking-wide">
            1. Product
          </span>
          <div className="w-10 h-[1px] bg-white/60" />
        </div>
      );
    }
    
    if (variant === "gold-accent") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1">
            <span className="font-spectral text-[10px] font-light text-[#E8DCC0]">1.</span>
            <span className="font-spectral text-[10px] font-light text-white tracking-wide">Product</span>
          </div>
          <div className="w-10 h-[1px] bg-[#D4C7A1]" />
        </div>
      );
    }
    
    if (variant === "floating-label") {
      return (
        <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2">
          <div className="bg-black/40 rounded px-2 py-1">
            <span className="font-inter-thin text-[10px] font-extralight text-white">Product</span>
          </div>
        </div>
      );
    }
    
    // ultra-dot
    return (
      <div className="bg-[#2A2A2A] rounded-lg px-2.5 py-2 flex items-center justify-center gap-1.5">
        <div className="w-[3px] h-[3px] rounded-full bg-white" />
        <span className="font-inter-thin text-[9px] font-extralight text-white/60">Shop</span>
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
        <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
          <span className="font-playfair text-[10px] font-light text-white tracking-wide">
            Product
          </span>
          <div className="w-10 h-[0.5px] bg-white/70" />
        </div>
      );
    }
    
    if (variant === "vertical-label") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2 flex items-center gap-1">
          <div className="flex flex-col items-center text-[9px] font-playfair font-light text-white tracking-wider leading-tight">
            <span>S</span>
            <span>H</span>
            <span>O</span>
            <span>P</span>
          </div>
          <div className="w-[0.5px] h-6 bg-white/60" />
        </div>
      );
    }
    
    if (variant === "caption-box") {
      return (
        <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2">
          <div className="border border-white/60 rounded px-2 py-1">
            <span className="font-spectral text-[9px] font-light text-white">Product</span>
          </div>
        </div>
      );
    }
    
    // editorial-marker
    return (
      <div className="bg-[#1A1A1A] rounded-lg px-2.5 py-2">
        <span className="font-spectral text-[10px] font-light text-white tracking-wide">— Product</span>
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

  return (
    <div
      className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E1E4E8] overflow-hidden flex flex-col"
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E1E4E8]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[#111827]">Layout & Behavior</h3>
          <button
            onClick={onClose}
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

        {/* 3) CTA LABEL Section - For Badge bubble, E-Commerce Line, and Editorial Line */}
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

        {/* 4) CLICK BEHAVIOR Section */}
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

        {/* 5) TIMING Section */}
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

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E1E4E8]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#374151]"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-[#0E76FD] hover:bg-[#0E76FD]/90 text-white"
        >
          Save
        </Button>
      </div>

      {/* Resize Handle */}
      <ResizeHandle {...resizeHandleProps} />
    </div>
  );
};

export default LayoutBehaviorPanel;