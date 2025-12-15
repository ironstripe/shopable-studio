import { API_BASE_URL } from "./api-config";
import { Hotspot, HotspotStyle, CardStyle, ClickBehavior, CountdownStyle, CountdownPosition } from "@/types/video";
import { getFamilyFromStyle } from "@/types/templates";

// DTO types matching backend API
export interface HotspotDto {
  id: string;
  videoId: string;
  timeStartMs: number;
  timeEndMs: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  templateFamily?: string;
  style?: string;
  cardStyle?: string;
  countdownEnabled?: boolean;
  countdownStyle?: "light" | "bold" | null;
  countdownPosition?: "above" | "below" | "corner" | null;
  productId?: string | null;
  productTitle?: string | null;
  productUrl?: string | null;
  productImageUrl?: string | null;
  productPrice?: string | null;
  productCurrency?: string | null;
  ctaLabel?: string;
  clickBehavior?: string;
  scale?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateHotspotPayload = Omit<HotspotDto, "id" | "createdAt" | "updatedAt">;
export type UpdateHotspotPayload = Partial<CreateHotspotPayload>;

// ========== API Functions ==========

export async function listHotspots(videoId: string): Promise<HotspotDto[]> {
  const encodedVideoId = encodeURIComponent(videoId);
  const url = `${API_BASE_URL}/videos/${encodedVideoId}/hotspots`;
  console.log('[hotspot-api] GET request:', url);
  
  try {
    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[hotspot-api] GET failed:', res.status, errorText);
      throw new Error(`Failed to load hotspots (${res.status})`);
    }
    return res.json();
  } catch (error) {
    console.error('[hotspot-api] GET error:', error);
    throw error;
  }
}

export async function createHotspot(
  videoId: string,
  payload: CreateHotspotPayload
): Promise<HotspotDto> {
  const encodedVideoId = encodeURIComponent(videoId);
  const url = `${API_BASE_URL}/videos/${encodedVideoId}/hotspots`;
  console.log('[hotspot-api] POST request:', { url, payload });
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[hotspot-api] POST failed:', res.status, errorText);
      throw new Error(`Failed to create hotspot (${res.status}): ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error('[hotspot-api] POST error:', error);
    throw error;
  }
}

export async function updateHotspot(
  videoId: string,
  hotspotId: string,
  payload: UpdateHotspotPayload
): Promise<HotspotDto> {
  const encodedVideoId = encodeURIComponent(videoId);
  const encodedHotspotId = encodeURIComponent(hotspotId);
  const url = `${API_BASE_URL}/videos/${encodedVideoId}/hotspots/${encodedHotspotId}`;
  console.log('[hotspot-api] PUT request:', { url, payload });
  
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[hotspot-api] PUT failed:', res.status, errorText);
      throw new Error(`Failed to update hotspot (${res.status}): ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error('[hotspot-api] PUT error:', error);
    throw error;
  }
}

export async function deleteHotspot(
  videoId: string,
  hotspotId: string
): Promise<void> {
  const encodedVideoId = encodeURIComponent(videoId);
  const encodedHotspotId = encodeURIComponent(hotspotId);
  const url = `${API_BASE_URL}/videos/${encodedVideoId}/hotspots/${encodedHotspotId}`;
  console.log('[hotspot-api] DELETE request:', url);
  
  try {
    const res = await fetch(url, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[hotspot-api] DELETE failed:', res.status, errorText);
      throw new Error(`Failed to delete hotspot (${res.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('[hotspot-api] DELETE error:', error);
    throw error;
  }
}

// ========== DTO <-> Hotspot Mappers ==========

/**
 * Convert backend HotspotDto to frontend Hotspot type
 * Backend uses milliseconds, frontend uses seconds
 */
export function mapDtoToHotspot(dto: HotspotDto): Hotspot {
  return {
    id: dto.id,
    backendId: dto.id, // Set backendId so updates work after reload
    timeStart: dto.timeStartMs / 1000,
    timeEnd: dto.timeEndMs / 1000,
    x: dto.x,
    y: dto.y,
    productId: dto.productId ?? null,
    productTitle: dto.productTitle ?? undefined,
    productUrl: dto.productUrl ?? undefined,
    productImageUrl: dto.productImageUrl ?? undefined,
    productPrice: dto.productPrice ?? undefined,
    productCurrency: dto.productCurrency ?? undefined,
    style: (dto.style as HotspotStyle) || "ecommerce-light-card",
    cardStyle: (dto.cardStyle as CardStyle) || (dto.style as CardStyle) || "ecommerce-light-card",
    ctaLabel: dto.ctaLabel || "Shop Now",
    scale: dto.scale ?? 1,
    clickBehavior: (dto.clickBehavior as ClickBehavior) || "show-card",
    countdown: dto.countdownEnabled
      ? {
          active: true,
          mode: "evergreen",
          style: (dto.countdownStyle as CountdownStyle) || "light",
          position: (dto.countdownPosition as CountdownPosition) || "below",
        }
      : undefined,
    revision: 0,
  };
}

/**
 * Convert frontend Hotspot to backend CreateHotspotPayload
 * Frontend uses seconds, backend uses milliseconds
 */
export function mapHotspotToPayload(
  hotspot: Hotspot,
  videoId: string
): CreateHotspotPayload {
  return {
    videoId,
    timeStartMs: Math.round(hotspot.timeStart * 1000),
    timeEndMs: Math.round(hotspot.timeEnd * 1000),
    x: hotspot.x,
    y: hotspot.y,
    style: hotspot.style,
    cardStyle: hotspot.cardStyle,
    templateFamily: getFamilyFromStyle(hotspot.style),
    countdownEnabled: hotspot.countdown?.active ?? false,
    countdownStyle: hotspot.countdown?.style ?? null,
    countdownPosition: hotspot.countdown?.position ?? null,
    productId: hotspot.productId,
    productTitle: hotspot.productTitle ?? null,
    productUrl: hotspot.productUrl ?? null,
    productImageUrl: hotspot.productImageUrl ?? null,
    productPrice: hotspot.productPrice ?? null,
    productCurrency: hotspot.productCurrency ?? null,
    ctaLabel: hotspot.ctaLabel,
    clickBehavior: hotspot.clickBehavior,
    scale: hotspot.scale,
  };
}

/**
 * Convert partial Hotspot updates to backend UpdateHotspotPayload
 */
export function mapHotspotUpdateToPayload(
  update: Partial<Hotspot>
): UpdateHotspotPayload {
  const payload: UpdateHotspotPayload = {};

  if (update.timeStart !== undefined) {
    payload.timeStartMs = Math.round(update.timeStart * 1000);
  }
  if (update.timeEnd !== undefined) {
    payload.timeEndMs = Math.round(update.timeEnd * 1000);
  }
  if (update.x !== undefined) {
    payload.x = update.x;
  }
  if (update.y !== undefined) {
    payload.y = update.y;
  }
  if (update.style !== undefined) {
    payload.style = update.style;
    payload.templateFamily = getFamilyFromStyle(update.style);
  }
  if (update.cardStyle !== undefined) {
    payload.cardStyle = update.cardStyle;
  }
  if (update.productId !== undefined) {
    payload.productId = update.productId;
  }
  if (update.productTitle !== undefined) {
    payload.productTitle = update.productTitle;
  }
  if (update.productUrl !== undefined) {
    payload.productUrl = update.productUrl;
  }
  if (update.productImageUrl !== undefined) {
    payload.productImageUrl = update.productImageUrl;
  }
  if (update.productPrice !== undefined) {
    payload.productPrice = update.productPrice;
  }
  if (update.productCurrency !== undefined) {
    payload.productCurrency = update.productCurrency;
  }
  if (update.ctaLabel !== undefined) {
    payload.ctaLabel = update.ctaLabel;
  }
  if (update.clickBehavior !== undefined) {
    payload.clickBehavior = update.clickBehavior;
  }
  if (update.scale !== undefined) {
    payload.scale = update.scale;
  }
  if (update.countdown !== undefined) {
    payload.countdownEnabled = update.countdown?.active ?? false;
    payload.countdownStyle = update.countdown?.style ?? null;
    payload.countdownPosition = update.countdown?.position ?? null;
  }

  return payload;
}

/**
 * Convert a FULL Hotspot object to backend payload for complete updates.
 * Use this when you want to ensure ALL fields are persisted, not just changed ones.
 */
export function mapFullHotspotToUpdatePayload(
  hotspot: Hotspot
): UpdateHotspotPayload {
  return {
    timeStartMs: Math.round(hotspot.timeStart * 1000),
    timeEndMs: Math.round(hotspot.timeEnd * 1000),
    x: hotspot.x,
    y: hotspot.y,
    style: hotspot.style,
    cardStyle: hotspot.cardStyle,
    templateFamily: getFamilyFromStyle(hotspot.style),
    countdownEnabled: hotspot.countdown?.active ?? false,
    countdownStyle: hotspot.countdown?.style ?? null,
    countdownPosition: hotspot.countdown?.position ?? null,
    productId: hotspot.productId,
    productTitle: hotspot.productTitle ?? null,
    productUrl: hotspot.productUrl ?? null,
    productImageUrl: hotspot.productImageUrl ?? null,
    productPrice: hotspot.productPrice ?? null,
    productCurrency: hotspot.productCurrency ?? null,
    ctaLabel: hotspot.ctaLabel,
    clickBehavior: hotspot.clickBehavior,
    scale: hotspot.scale,
  };
}
