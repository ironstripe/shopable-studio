import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash IP address for privacy (salted SHA-256)
async function hashIP(ip: string): Promise<string> {
  const salt = Deno.env.get("IP_HASH_SALT") || "shopable-default-salt";
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Extract kuerzel and slug from query params
    const kuerzel = url.searchParams.get("kuerzel");
    const slug = url.searchParams.get("slug");

    if (!kuerzel || !slug) {
      console.error("[shortlink-redirect] Missing params:", { kuerzel, slug });
      return new Response("Invalid shortlink - missing kuerzel or slug", { 
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("[shortlink-redirect] Looking up:", { kuerzel, slug });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up creator by kuerzel
    const { data: creator, error: creatorError } = await supabaseAdmin
      .from("creators")
      .select("id")
      .eq("creator_kuerzel", kuerzel)
      .maybeSingle();

    if (creatorError) {
      console.error("[shortlink-redirect] Creator lookup error:", creatorError);
      return new Response("Error looking up creator", { 
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!creator) {
      console.warn("[shortlink-redirect] Creator not found:", kuerzel);
      return new Response("Creator not found", { 
        status: 404,
        headers: corsHeaders,
      });
    }

    // Look up video by creator_id and custom_slug
    const { data: video, error: videoError } = await supabaseAdmin
      .from("videos")
      .select("id, file_url, rendered_video_key")
      .eq("creator_id", creator.id)
      .eq("custom_slug", slug)
      .maybeSingle();

    if (videoError) {
      console.error("[shortlink-redirect] Video lookup error:", videoError);
      return new Response("Error looking up video", { 
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!video) {
      console.warn("[shortlink-redirect] Video not found:", { creatorId: creator.id, slug });
      return new Response("Video not found", { 
        status: 404,
        headers: corsHeaders,
      });
    }

    // Hash IP for privacy
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    const ipHash = await hashIP(clientIP);
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;

    // Log shortlink_clicked event
    const { error: eventError } = await supabaseAdmin.from("events").insert({
      event_name: "shortlink_clicked",
      creator_id: creator.id,
      video_id: video.id,
      event_source: "public",
      properties: { creatorKuerzel: kuerzel, customSlug: slug },
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    if (eventError) {
      // Log but don't fail the redirect
      console.error("[shortlink-redirect] Event insert failed:", eventError);
    } else {
      console.log("[shortlink-redirect] Event logged:", { creatorId: creator.id, videoId: video.id });
    }

    // Determine redirect URL
    // For now, redirect to a video viewer page (can be customized later)
    const redirectUrl = video.file_url || 
                        `https://app.shopable.one/watch/${video.id}`;

    console.log("[shortlink-redirect] Redirecting to:", redirectUrl);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": redirectUrl,
      },
    });
  } catch (error) {
    console.error("[shortlink-redirect] Error:", error);
    return new Response("Internal server error", { 
      status: 500,
      headers: corsHeaders,
    });
  }
});
