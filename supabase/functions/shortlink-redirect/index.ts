import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

// Validation patterns (don't leak rules to users)
const KUERZEL_REGEX = /^[a-zA-Z0-9_-]{1,20}$/;
const SLUG_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

// Rate limiting (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000; // 1 minute

// Outcome types for logging
type Outcome = "redirect" | "not_found" | "unavailable" | "invalid" | "error" | "rate_limited";
type FallbackType = "not_found" | "unavailable" | "error";

const FALLBACK_COPY = {
  not_found: {
    en: { title: "Link not found", body: "This Shopable link doesn't exist or has been changed." },
    de: { title: "Link nicht gefunden", body: "Dieser Shopable Link existiert nicht oder wurde geändert." },
  },
  unavailable: {
    en: { title: "This video is no longer available", body: "The creator removed this Shopable link or it has expired." },
    de: { title: "Dieses Video ist nicht mehr verfügbar", body: "Der Creator hat diesen Shopable Link entfernt oder er ist abgelaufen." },
  },
  error: {
    en: { title: "Something went wrong", body: "Please try again in a moment." },
    de: { title: "Da ist etwas schiefgelaufen", body: "Bitte versuche es in einem Moment erneut." },
  },
};

function detectLanguage(req: Request): "en" | "de" {
  const acceptLang = req.headers.get("accept-language") || "";
  return acceptLang.toLowerCase().includes("de") ? "de" : "en";
}

function renderFallbackPage(type: FallbackType, lang: "en" | "de"): Response {
  const copy = FALLBACK_COPY[type][lang];
  const ctaText = lang === "de" ? "Zu Shopable" : "Go to Shopable";
  
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.title} - Shopable</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FAFAFA;
      color: #111827;
      padding: 24px;
    }
    .container { text-align: center; max-width: 400px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
    p { font-size: 16px; color: #6B7280; margin-bottom: 24px; line-height: 1.5; }
    a { 
      display: inline-block;
      padding: 12px 24px;
      background: #0E76FD;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
    }
    a:hover { background: #0B5FCC; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${copy.title}</h1>
    <p>${copy.body}</p>
    <a href="https://shopable.one">${ctaText}</a>
  </div>
</body>
</html>`;

  const statusCode = type === "error" ? 500 : type === "unavailable" ? 410 : 404;
  return new Response(html, {
    status: statusCode,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function validateInput(kuerzel: string | null, slug: string | null): boolean {
  if (!kuerzel || !slug) return false;
  if (!KUERZEL_REGEX.test(kuerzel)) return false;
  if (!SLUG_REGEX.test(slug)) return false;
  return true;
}

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

async function hashIP(ip: string): Promise<string> {
  const salt = Deno.env.get("IP_HASH_SALT") || "shopable-default-salt";
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function logRequest(
  kuerzel: string | null,
  slug: string | null,
  outcome: Outcome,
  error?: unknown
) {
  const logData: Record<string, string> = {
    timestamp: new Date().toISOString(),
    service: "shortlink-redirect",
    creatorKuerzel: kuerzel || "missing",
    customSlug: slug || "missing",
    outcome,
  };
  if (error) {
    logData.errorMessage = String(error);
  }
  console.log(JSON.stringify(logData));
}

function buildSafeRedirectUrl(videoId: string, creatorKuerzel: string): string {
  // Only redirect to our own domain - prevent open redirect attacks
  return `https://shopable.one/${encodeURIComponent(creatorKuerzel)}?vid=${encodeURIComponent(videoId)}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const lang = detectLanguage(req);
  const url = new URL(req.url);
  const kuerzel = url.searchParams.get("kuerzel");
  const slug = url.searchParams.get("slug");

  // Get IP hash for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";
  let ipHash: string;
  
  try {
    ipHash = await hashIP(clientIP);
  } catch {
    ipHash = "hash-error";
  }

  // Check rate limit
  if (!checkRateLimit(ipHash)) {
    logRequest(kuerzel, slug, "rate_limited");
    return new Response("Too many requests", { 
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // Validate input (return generic "not found" to avoid leaking validation rules)
  if (!validateInput(kuerzel, slug)) {
    logRequest(kuerzel, slug, "invalid");
    return renderFallbackPage("not_found", lang);
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Lookup creator by kuerzel
    const { data: creator, error: creatorError } = await supabaseAdmin
      .from("creators")
      .select("id")
      .eq("creator_kuerzel", kuerzel)
      .maybeSingle();

    if (creatorError) {
      console.error("[shortlink-redirect] Creator lookup error:", creatorError);
      logRequest(kuerzel, slug, "error", creatorError);
      return renderFallbackPage("error", lang);
    }

    if (!creator) {
      logRequest(kuerzel, slug, "not_found");
      return renderFallbackPage("not_found", lang);
    }

    // Lookup video by creator_id and custom_slug
    const { data: video, error: videoError } = await supabaseAdmin
      .from("videos")
      .select("id, file_url, rendered_video_key, state")
      .eq("creator_id", creator.id)
      .eq("custom_slug", slug)
      .maybeSingle();

    if (videoError) {
      console.error("[shortlink-redirect] Video lookup error:", videoError);
      logRequest(kuerzel, slug, "error", videoError);
      return renderFallbackPage("error", lang);
    }

    if (!video) {
      logRequest(kuerzel, slug, "not_found");
      return renderFallbackPage("not_found", lang);
    }

    // Check video state - only redirect if publishable
    const isPublishable = video.state === "ready_to_post" || video.state === "posted";
    if (!isPublishable) {
      logRequest(kuerzel, slug, "unavailable");
      return renderFallbackPage("unavailable", lang);
    }

    // Log shortlink_clicked event (before redirect)
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;
    
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
    }

    // Build safe redirect URL (open redirect protection)
    const redirectUrl = buildSafeRedirectUrl(video.id, kuerzel!);
    
    logRequest(kuerzel, slug, "redirect");

    return new Response(null, {
      status: 302,
      headers: { "Location": redirectUrl },
    });
  } catch (error) {
    console.error("[shortlink-redirect] Unexpected error:", error);
    logRequest(kuerzel, slug, "error", error);
    return renderFallbackPage("error", lang);
  }
});
