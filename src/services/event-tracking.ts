import { supabase } from "@/integrations/supabase/client";

type EventName = 
  | "video_created"
  | "video_published"
  | "hotspots_completed"
  | "slug_confirmed"
  | "caption_generated"
  | "caption_copied"
  | "bio_link_copied"
  | "shop_link_copied"
  | "landing_page_opened"
  | "shortlink_clicked";

interface TrackEventParams {
  eventName: EventName;
  creatorId: string;
  videoId?: string;
  properties?: Record<string, unknown>;
}

// Client-side deduplication (10-second window for copy events)
const recentEvents = new Map<string, number>();

/**
 * Track an event for internal analytics.
 * Fire-and-forget: errors are logged but don't block user actions.
 */
export async function trackEvent({ eventName, creatorId, videoId, properties }: TrackEventParams): Promise<void> {
  // Deduplication for copy events (10-second window per video)
  if (eventName === "caption_copied" || eventName === "bio_link_copied") {
    const key = `${eventName}:${videoId || "no-video"}`;
    const lastFired = recentEvents.get(key);
    if (lastFired && Date.now() - lastFired < 10000) {
      console.log("[trackEvent] Deduplicated:", eventName);
      return;
    }
    recentEvents.set(key, Date.now());
  }

  try {
    const { error } = await supabase.functions.invoke("track-event", {
      body: {
        eventName,
        creatorId,
        videoId,
        eventSource: "studio",
        properties,
      },
    });

    if (error) {
      console.error("[trackEvent] Failed:", eventName, error);
    } else {
      console.log("[trackEvent] Recorded:", eventName, { videoId });
    }
  } catch (err) {
    // Fire and forget - don't block user actions
    console.error("[trackEvent] Error:", eventName, err);
  }
}
