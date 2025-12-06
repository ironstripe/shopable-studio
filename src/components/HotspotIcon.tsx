import { HotspotStyle } from "@/types/video";

interface HotspotIconProps {
  style: HotspotStyle;
  countdown: number;
  ctaLabel: string;
  isSelected?: boolean;
  scale?: number;
  price?: string;
  source?: "video" | "layout-preview" | "unknown";
}

const HotspotIcon = ({ style, countdown, ctaLabel, isSelected, scale = 1, price, source = "unknown" }: HotspotIconProps) => {
  console.log('[HotspotIcon]', source, 'style:', style);
  
  // TEMP DEBUG: Show the style name directly inside the hotspot
  // so the user can SEE which style React thinks is active.
  if (source === "video") {
    return (
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 12,
          fontFamily: "monospace",
          fontWeight: 600,
          // Give each style a totally different solid background:
          backgroundColor:
            style === "ecommerce-line-compact-price-tag"
              ? "#ff9800" // Light Card = ORANGE block
              : style === "ecommerce-line-cta-pill-focus"
              ? "#4caf50" // Sale Boost = GREEN block
              : style === "ecommerce-line-label-strip"
              ? "#2196f3" // Minimal = BLUE block
              : "#9e9e9e", // Any other style = GREY
          color: "#000",
        }}
      >
        VIDEO: {style}
      </div>
    );
  }

  // For layout-preview keep a simple debug variant:
  return (
    <div
      style={{
        padding: "4px 6px",
        borderRadius: 6,
        fontSize: 10,
        fontFamily: "monospace",
        backgroundColor: "#eeeeee",
        color: "#333",
      }}
    >
      PREVIEW: {style}
    </div>
  );
};

export default HotspotIcon;
