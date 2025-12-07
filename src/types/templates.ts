import { HotspotStyle } from "./video";

// Template family identifiers - extend this type for new families
export type TemplateFamilyId = "ecommerce" | "luxury" | "seasonal";

// Category for grouping families (for future use)
export type TemplateFamilyCategory = "default" | "seasonal" | "creator" | "brand";

// Style option within a family
export interface StyleOption {
  id: HotspotStyle;
  label: string;
}

// Complete template family configuration
export interface TemplateFamily {
  id: TemplateFamilyId;
  name: string;
  subtitle: string;
  category: TemplateFamilyCategory;
  mainStyle: HotspotStyle;
  styles: StyleOption[];
  defaultCtaLabel: string;
}

// Single source of truth for all template families
// Add new families by extending this array
export const TEMPLATE_FAMILIES: TemplateFamily[] = [
  {
    id: "ecommerce",
    name: "E-Commerce",
    subtitle: "Clean cards for classic shop setups",
    category: "default",
    mainStyle: "ecommerce-light-card",
    styles: [
      { id: "ecommerce-light-card", label: "Light Card" },
      { id: "ecommerce-sale-boost", label: "Sale Boost" },
      { id: "ecommerce-minimal", label: "Minimal" },
    ],
    defaultCtaLabel: "Shop Now",
  },
  {
    id: "luxury",
    name: "Luxury",
    subtitle: "Ultra-clean, subtle, premium brands",
    category: "default",
    mainStyle: "luxury-fine-line",
    styles: [
      { id: "luxury-fine-line", label: "Fine Line" },
      { id: "luxury-elegance-card", label: "Elegance Card" },
      { id: "luxury-dot", label: "Luxury Dot" },
    ],
    defaultCtaLabel: "Discover",
  },
  {
    id: "seasonal",
    name: "Seasonal",
    subtitle: "Special event templates (Valentine, Easter, BF)",
    category: "seasonal",
    mainStyle: "seasonal-valentine",
    styles: [
      { id: "seasonal-valentine", label: "Valentine" },
      { id: "seasonal-easter", label: "Easter" },
      { id: "seasonal-black-friday", label: "Black Friday" },
    ],
    defaultCtaLabel: "Get the Deal",
  },
];

// Helper: Find family by ID
export const getFamilyById = (id: TemplateFamilyId): TemplateFamily | undefined =>
  TEMPLATE_FAMILIES.find((f) => f.id === id);

// Helper: Get family ID from hotspot style string
export const getFamilyFromStyle = (style: HotspotStyle): TemplateFamilyId => {
  if (style.startsWith("ecommerce")) return "ecommerce";
  if (style.startsWith("luxury")) return "luxury";
  if (style.startsWith("seasonal")) return "seasonal";
  return "ecommerce";
};

// Helper: Get all family IDs
export const getAllFamilyIds = (): TemplateFamilyId[] =>
  TEMPLATE_FAMILIES.map((f) => f.id);
