import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const JWT_SECRET = Deno.env.get("SHOPABLE_JWT_SECRET")!;
const STUDIO_BASE_URL = Deno.env.get("PUBLIC_PLAYER_BASE_URL") || "https://shopable-spotlight.lovable.app";

// Partner ID for ryl.zone
const RYL_PARTNER_ID = "ryl.zone";

// HTML templates for error pages
function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Error - Shopable Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #ff6b6b;
    }
    p {
      color: #a0a0a0;
      line-height: 1.6;
    }
    .retry-link {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #4f46e5;
      color: #fff;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: background 0.2s;
    }
    .retry-link:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔒</div>
    <h1>Link Expired or Invalid</h1>
    <p>${message}</p>
    <a href="https://ryl.zone" class="retry-link">Return to Ryl</a>
  </div>
</body>
</html>`;
}

// Base64URL decode helper
function base64UrlDecode(str: string): Uint8Array {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Verify JWT with HS256
async function verifyJWT(token: string, secret: string): Promise<{ valid: boolean; payload?: JwtPayload; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header
    const headerJson = new TextDecoder().decode(base64UrlDecode(headerB64));
    const header = JSON.parse(headerJson);
    
    if (header.alg !== 'HS256') {
      return { valid: false, error: "Unsupported algorithm" };
    }

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    // Recompute signature and compare
    const expectedSignature = await crypto.subtle.sign("HMAC", key, signatureInput);
    const expectedBytes = new Uint8Array(expectedSignature);
    
    // Compare signatures
    const isValid = signature.length === expectedBytes.length && 
      signature.every((byte, i) => byte === expectedBytes[i]);

    if (!isValid) {
      return { valid: false, error: "Invalid signature" };
    }

    // Decode payload
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as JwtPayload;

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("JWT verification error:", err);
    return { valid: false, error: "Token verification failed" };
  }
}

// JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  source: string;
  video_id: string;
  iat: number;
  exp: number;
}

// Generate creator handle from email
function generateCreatorHandle(email: string): string {
  const localPart = email.split('@')[0];
  // Clean up the handle - alphanumeric and underscores only
  return localPart.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 20);
}

// Generate creator kuerzel from email
function generateCreatorKuerzel(email: string): string {
  const localPart = email.split('@')[0];
  // Take first 2 characters and uppercase
  return localPart.slice(0, 2).toUpperCase();
}

// Generate a secure random password
function generateSecurePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Only handle /deeplink/editor
  if (path !== "/deeplink/editor" && path !== "/deeplink/editor/") {
    return new Response("Not Found", { status: 404 });
  }

  // Only GET method
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Parse query parameters
  const token = url.searchParams.get("token");
  const source = url.searchParams.get("source");

  // Validate required parameters
  if (!token) {
    return new Response(errorPage("Missing authentication token. Please try again from Ryl."), {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  if (!source || source !== "ryl") {
    return new Response(errorPage("Invalid access source. This link is not valid."), {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  // Verify JWT
  const { valid, payload, error } = await verifyJWT(token, JWT_SECRET);

  if (!valid || !payload) {
    console.error("JWT validation failed:", error);
    return new Response(errorPage(error || "The link has expired or is invalid. Please request a new link from Ryl."), {
      status: 401,
      headers: { "Content-Type": "text/html" }
    });
  }

  // Validate payload claims
  if (payload.source !== "ryl") {
    return new Response(errorPage("Invalid token source. Access denied."), {
      status: 403,
      headers: { "Content-Type": "text/html" }
    });
  }

  if (payload.role !== "producer") {
    return new Response(errorPage("Unauthorized role. Only producers can access the editor."), {
      status: 403,
      headers: { "Content-Type": "text/html" }
    });
  }

  if (!payload.email || !payload.video_id) {
    return new Response(errorPage("Incomplete token data. Please request a new link."), {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  // Create Supabase admin client
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Find or create user
    let userId: string;
    
    // Check if user exists by email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(errorPage("System error. Please try again later."), {
        status: 500,
        headers: { "Content-Type": "text/html" }
      });
    }

    const existingUser = existingUsers.users.find(u => u.email === payload.email);

    if (existingUser) {
      userId = existingUser.id;
      console.log("Found existing user:", userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: generateSecurePassword(),
        email_confirm: true,
        user_metadata: {
          source: "ryl",
          role: "producer",
          ryl_user_id: payload.sub
        }
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(errorPage("Failed to create account. Please try again."), {
          status: 500,
          headers: { "Content-Type": "text/html" }
        });
      }

      userId = newUser.user.id;
      console.log("Created new user:", userId);

      // Create creator profile
      const creatorHandle = generateCreatorHandle(payload.email);
      const creatorKuerzel = generateCreatorKuerzel(payload.email);

      const { error: creatorError } = await supabaseAdmin
        .from("creators")
        .insert({
          user_id: userId,
          email: payload.email,
          creator_handle: creatorHandle,
          creator_kuerzel: creatorKuerzel
        });

      if (creatorError) {
        // If creator already exists (race condition), that's fine
        if (!creatorError.message.includes("duplicate")) {
          console.error("Error creating creator profile:", creatorError);
        }
      }
    }

    // Step 2: Resolve or create video (idempotent)
    let internalVideoId: string;

    // Check if video already exists
    const { data: existingVideo, error: videoQueryError } = await supabaseAdmin
      .from("partner_videos")
      .select("id")
      .eq("partner_id", RYL_PARTNER_ID)
      .eq("external_id", payload.video_id)
      .maybeSingle();

    if (videoQueryError) {
      console.error("Error querying video:", videoQueryError);
      return new Response(errorPage("Failed to load video. Please try again."), {
        status: 500,
        headers: { "Content-Type": "text/html" }
      });
    }

    if (existingVideo) {
      internalVideoId = existingVideo.id;
      console.log("Found existing video:", internalVideoId);
    } else {
      // Create new video
      const { data: newVideo, error: createVideoError } = await supabaseAdmin
        .from("partner_videos")
        .insert({
          partner_id: RYL_PARTNER_ID,
          external_id: payload.video_id,
          source: "external_url",
          title: "Imported from Ryl",
          status: "ready"
        })
        .select("id")
        .single();

      if (createVideoError) {
        // Check if it's a duplicate key error (race condition - another request created it)
        if (createVideoError.message.includes("duplicate") || createVideoError.code === "23505") {
          // Fetch the video that was just created
          const { data: racedVideo } = await supabaseAdmin
            .from("partner_videos")
            .select("id")
            .eq("partner_id", RYL_PARTNER_ID)
            .eq("external_id", payload.video_id)
            .single();

          if (racedVideo) {
            internalVideoId = racedVideo.id;
            console.log("Found video after race condition:", internalVideoId);
          } else {
            return new Response(errorPage("Failed to create video. Please try again."), {
              status: 500,
              headers: { "Content-Type": "text/html" }
            });
          }
        } else {
          console.error("Error creating video:", createVideoError);
          return new Response(errorPage("Failed to create video. Please try again."), {
            status: 500,
            headers: { "Content-Type": "text/html" }
          });
        }
      } else {
        internalVideoId = newVideo.id;
        console.log("Created new video:", internalVideoId);
      }
    }

    // Step 3: Generate session tokens for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: payload.email,
      options: {
        redirectTo: `${STUDIO_BASE_URL}/sso-callback`
      }
    });

    if (sessionError || !sessionData) {
      console.error("Error generating session link:", sessionError);
      return new Response(errorPage("Failed to create session. Please try again."), {
        status: 500,
        headers: { "Content-Type": "text/html" }
      });
    }

    // Extract token from the magic link
    // The magic link format is: {redirectTo}#access_token=...&refresh_token=...&...
    // But generateLink returns a hashed_token we can use
    
    // Actually, we need to use a different approach - generate a direct session
    // Use the magic link URL and append our video_id
    const magicLinkUrl = new URL(sessionData.properties.hashed_token 
      ? `${SUPABASE_URL}/auth/v1/verify?token=${sessionData.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${STUDIO_BASE_URL}/sso-callback?video_id=${internalVideoId}`)}`
      : sessionData.properties.action_link || "");

    // If we have an action_link, modify it to include video_id
    if (sessionData.properties.action_link) {
      const actionUrl = new URL(sessionData.properties.action_link);
      const redirectTo = actionUrl.searchParams.get("redirect_to");
      if (redirectTo) {
        const newRedirect = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}video_id=${internalVideoId}`;
        actionUrl.searchParams.set("redirect_to", newRedirect);
        
        console.log("Redirecting to magic link:", actionUrl.toString());
        
        return new Response(null, {
          status: 302,
          headers: {
            "Location": actionUrl.toString()
          }
        });
      }
    }

    // Fallback: Direct redirect with video_id in query
    const fallbackUrl = `${STUDIO_BASE_URL}/sso-callback?video_id=${internalVideoId}&pending_auth=true&email=${encodeURIComponent(payload.email)}`;
    
    console.log("Fallback redirect to:", fallbackUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": fallbackUrl
      }
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(errorPage("An unexpected error occurred. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html" }
    });
  }
});
