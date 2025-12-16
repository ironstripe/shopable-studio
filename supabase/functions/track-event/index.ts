import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackEventRequest {
  eventName: string;
  creatorId: string;
  videoId?: string;
  eventSource?: "studio" | "public";
  properties?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TrackEventRequest = await req.json();
    const { eventName, creatorId, videoId, eventSource, properties, ipHash, userAgent } = body;

    // Validate required fields
    if (!eventName || !creatorId) {
      console.error("[track-event] Missing required fields:", { eventName, creatorId });
      return new Response(JSON.stringify({ error: "eventName and creatorId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for inserting (bypasses RLS for public events)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseAdmin.from("events").insert({
      event_name: eventName,
      creator_id: creatorId,
      video_id: videoId || null,
      event_source: eventSource || "studio",
      properties: properties || {},
      ip_hash: ipHash || null,
      user_agent: userAgent || null,
    });

    if (error) {
      // Handle unique constraint violation (idempotency) gracefully
      if (error.code === "23505") {
        console.log("[track-event] Event already exists (idempotent):", eventName, videoId);
        return new Response(JSON.stringify({ success: true, deduplicated: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("[track-event] Insert failed:", error);
      throw error;
    }

    console.log("[track-event] Recorded:", eventName, { creatorId, videoId });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[track-event] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to track event" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
