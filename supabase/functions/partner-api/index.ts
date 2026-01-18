import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// Partner Platform API MVP v1
// Single router for all partner endpoints
// =====================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Public player URL configuration
const PUBLIC_PLAYER_BASE_URL = Deno.env.get("PUBLIC_PLAYER_BASE_URL") 
  || "https://shopable-hotspot-player.lovable.app";
const PUBLIC_PLAYER_PATH_TEMPLATE = Deno.env.get("PUBLIC_PLAYER_PATH_TEMPLATE") 
  || "/v/{videoId}";

function buildPublicUrl(videoId: string): string {
  return PUBLIC_PLAYER_BASE_URL + PUBLIC_PLAYER_PATH_TEMPLATE.replace("{videoId}", videoId);
}

// Type definitions for new tables (not yet in auto-generated types)
interface PartnerApiKey {
  id: string;
  partner_id: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface PartnerVideo {
  id: string;
  partner_id: string;
  source: string;
  external_url: string | null;  // Optional - partner may not have stable CDN URL
  external_id: string;          // Required - partner's stable video identifier
  status: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface PartnerHotspot {
  id: string;
  video_id: string;
  partner_id: string;
  x: number;
  y: number;
  t_start: number;
  t_end: number;
  type: string;
  payload: Record<string, unknown>;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

interface PartnerPublishedRevision {
  id: string;
  video_id: string;
  partner_id: string;
  version: number;
  state: string;
  public_url: string;
  tiny_url: string | null;
  manifest_json: Record<string, unknown>;
  created_at: string;
}

interface PartnerIdempotencyKey {
  id: string;
  partner_id: string;
  endpoint: string;
  idempotency_key: string;
  response_status: number;
  response_body: unknown;
  created_at: string;
  expires_at: string;
}

// CORS configuration
const ALLOWED_ORIGINS = [
  "https://ryl.zone",
  "https://www.ryl.zone",
  "https://shopable-spotlight.lovable.app",
  "https://shopable.one",
  "http://localhost:3000",
  "http://localhost:5173",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow *.ryl.zone subdomains
  if (/^https:\/\/.*\.ryl\.zone$/.test(origin)) return true;
  // Allow Lovable preview domains
  if (/^https:\/\/.*\.lovable\.app$/.test(origin)) return true;
  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, idempotency-key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

// Error response helper
interface ApiError {
  error: string;
  details?: unknown[];
}

function errorResponse(
  status: number,
  error: string,
  details?: unknown[],
  corsHeaders?: Record<string, string>
): Response {
  const body: ApiError = { error };
  if (details) body.details = details;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// Hash API key using SHA-256
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate ETag from content
async function generateETag(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 8);
  return `"${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}"`;
}

// Authentication context
interface AuthContext {
  partnerId: string;
  scopes: string[];
}

// Create untyped Supabase client for new tables
function createUntypedClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Authenticate request and return partner context
async function authenticate(req: Request): Promise<AuthContext | null> {
  // Try Authorization: Bearer <key> first, then x-api-key header
  let apiKey: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.replace("Bearer ", "");
  }
  if (!apiKey) {
    apiKey = req.headers.get("x-api-key");
  }

  if (!apiKey) {
    return null;
  }

  const keyHash = await hashApiKey(apiKey);
  const supabase = createUntypedClient();

  const { data, error } = await supabase
    .from("partner_api_keys")
    .select("partner_id, scopes, is_active")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  const record = data as PartnerApiKey;
  if (!record.is_active) {
    return null;
  }

  // Update last_used_at asynchronously (fire and forget)
  supabase
    .from("partner_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash)
    .then(() => {});

  return {
    partnerId: record.partner_id,
    scopes: record.scopes || [],
  };
}

// Check if auth context has required scope
function hasScope(auth: AuthContext, requiredScope: string): boolean {
  return auth.scopes.includes(requiredScope);
}

// Idempotency handling
async function checkIdempotency(
  partnerId: string,
  endpoint: string,
  idempotencyKey: string
): Promise<{ status: number; body: unknown } | null> {
  const supabase = createUntypedClient();
  
  const { data } = await supabase
    .from("partner_idempotency_keys")
    .select("response_status, response_body, expires_at")
    .eq("partner_id", partnerId)
    .eq("endpoint", endpoint)
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (!data) return null;

  const record = data as PartnerIdempotencyKey;
  if (new Date(record.expires_at) > new Date()) {
    return { status: record.response_status, body: record.response_body };
  }

  // Clean up expired entry
  await supabase
    .from("partner_idempotency_keys")
    .delete()
    .eq("partner_id", partnerId)
    .eq("endpoint", endpoint)
    .eq("idempotency_key", idempotencyKey);

  return null;
}

async function storeIdempotency(
  partnerId: string,
  endpoint: string,
  idempotencyKey: string,
  status: number,
  body: unknown
): Promise<void> {
  const supabase = createUntypedClient();
  
  await supabase.from("partner_idempotency_keys").upsert({
    partner_id: partnerId,
    endpoint,
    idempotency_key: idempotencyKey,
    response_status: status,
    response_body: body,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}

// Validation helpers
interface ValidationError {
  field: string;
  message: string;
}

function validateHotspot(data: {
  x?: number;
  y?: number;
  t_start?: number;
  t_end?: number;
  type?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.x !== undefined && (data.x < 0 || data.x > 1)) {
    errors.push({ field: "x", message: "must be between 0 and 1" });
  }
  if (data.y !== undefined && (data.y < 0 || data.y > 1)) {
    errors.push({ field: "y", message: "must be between 0 and 1" });
  }
  if (data.t_start !== undefined && data.t_start < 0) {
    errors.push({ field: "t_start", message: "must be >= 0" });
  }
  if (data.t_end !== undefined && data.t_start !== undefined && data.t_end <= data.t_start) {
    errors.push({ field: "t_end", message: "must be greater than t_start" });
  }
  if (data.type !== undefined && !["link", "product", "custom"].includes(data.type)) {
    errors.push({ field: "type", message: "must be one of: link, product, custom" });
  }

  return errors;
}

// Route handlers
async function handleHealth(corsHeaders: Record<string, string>): Promise<Response> {
  return jsonResponse({ ok: true, timestamp: new Date().toISOString() }, 200, corsHeaders);
}

// Videos
async function handleCreateVideo(
  req: Request,
  auth: AuthContext,
  corsHeaders: Record<string, string>,
  idempotencyKey: string | null
): Promise<Response> {
  if (!hasScope(auth, "videos:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: videos:write" }], corsHeaders);
  }

  const endpoint = "POST /v1/videos";

  // Check idempotency
  if (idempotencyKey) {
    const cached = await checkIdempotency(auth.partnerId, endpoint, idempotencyKey);
    if (cached) {
      return jsonResponse(cached.body, cached.status, corsHeaders);
    }
  }

  let body: { source?: string; external_url?: string; title?: string; external_id?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", [{ field: "body", message: "Invalid JSON" }], corsHeaders);
  }

  const errors: ValidationError[] = [];
  if (!body.external_id) {
    errors.push({ field: "external_id", message: "is required" });
  }
  if (body.source && body.source !== "external_url") {
    errors.push({ field: "source", message: "must be 'external_url'" });
  }

  if (errors.length > 0) {
    return errorResponse(400, "VALIDATION_ERROR", errors, corsHeaders);
  }

  const supabase = createUntypedClient();
  const { data, error } = await supabase
    .from("partner_videos")
    .insert({
      partner_id: auth.partnerId,
      source: "external_url",
      external_url: body.external_url || null,  // Optional
      external_id: body.external_id,            // Required
      title: body.title || null,
      status: "ready",
    })
    .select("id, status")
    .single();

  if (error) {
    console.error("Create video error:", error);
    if (error.code === "23505") {
      return errorResponse(409, "CONFLICT", [{ message: "Video with this external_id already exists" }], corsHeaders);
    }
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const record = data as PartnerVideo;
  const responseBody = { video_id: record.id, status: record.status };

  if (idempotencyKey) {
    await storeIdempotency(auth.partnerId, endpoint, idempotencyKey, 201, responseBody);
  }

  return jsonResponse(responseBody, 201, corsHeaders);
}

async function handleGetVideo(
  videoId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (!hasScope(auth, "videos:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: videos:write" }], corsHeaders);
  }

  const supabase = createUntypedClient();
  const { data, error } = await supabase
    .from("partner_videos")
    .select("*")
    .eq("id", videoId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (error || !data) {
    return errorResponse(404, "NOT_FOUND", undefined, corsHeaders);
  }

  const record = data as PartnerVideo;
  return jsonResponse(
    {
      video_id: record.id,
      partner_id: record.partner_id,
      source: record.source,
      external_url: record.external_url,
      external_id: record.external_id,
      status: record.status,
      title: record.title,
      created_at: record.created_at,
      updated_at: record.updated_at,
    },
    200,
    corsHeaders
  );
}

async function handleListVideos(
  url: URL,
  auth: AuthContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (!hasScope(auth, "videos:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: videos:write" }], corsHeaders);
  }

  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  const supabase = createUntypedClient();
  let query = supabase
    .from("partner_videos")
    .select("*")
    .eq("partner_id", auth.partnerId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("List videos error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const records = (data || []) as PartnerVideo[];
  const hasMore = records.length > limit;
  const videos = records.slice(0, limit).map((v) => ({
    video_id: v.id,
    external_id: v.external_id,
    external_url: v.external_url,
    status: v.status,
    title: v.title,
    created_at: v.created_at,
  }));

  const nextCursor = hasMore && videos.length > 0 ? videos[videos.length - 1].created_at : null;

  return jsonResponse({ videos, next_cursor: nextCursor }, 200, corsHeaders);
}

// Hotspots
async function handleCreateHotspot(
  req: Request,
  videoId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>,
  idempotencyKey: string | null
): Promise<Response> {
  if (!hasScope(auth, "hotspots:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: hotspots:write" }], corsHeaders);
  }

  const endpoint = `POST /v1/videos/${videoId}/hotspots`;

  if (idempotencyKey) {
    const cached = await checkIdempotency(auth.partnerId, endpoint, idempotencyKey);
    if (cached) {
      return jsonResponse(cached.body, cached.status, corsHeaders);
    }
  }

  const supabase = createUntypedClient();

  // Verify video exists and belongs to partner
  const { data: video } = await supabase
    .from("partner_videos")
    .select("id")
    .eq("id", videoId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!video) {
    return errorResponse(404, "NOT_FOUND", [{ message: "Video not found" }], corsHeaders);
  }

  let body: {
    x: number;
    y: number;
    t_start: number;
    t_end: number;
    type?: string;
    payload?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", [{ field: "body", message: "Invalid JSON" }], corsHeaders);
  }

  const errors = validateHotspot(body);
  if (body.x === undefined) errors.push({ field: "x", message: "is required" });
  if (body.y === undefined) errors.push({ field: "y", message: "is required" });
  if (body.t_start === undefined) errors.push({ field: "t_start", message: "is required" });
  if (body.t_end === undefined) errors.push({ field: "t_end", message: "is required" });

  if (errors.length > 0) {
    return errorResponse(400, "VALIDATION_ERROR", errors, corsHeaders);
  }

  const { data, error } = await supabase
    .from("partner_hotspots")
    .insert({
      video_id: videoId,
      partner_id: auth.partnerId,
      x: body.x,
      y: body.y,
      t_start: body.t_start,
      t_end: body.t_end,
      type: body.type || "link",
      payload: body.payload || {},
      is_draft: true,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Create hotspot error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const record = data as PartnerHotspot;
  const responseBody = {
    hotspot_id: record.id,
    video_id: record.video_id,
    x: record.x,
    y: record.y,
    t_start: record.t_start,
    t_end: record.t_end,
    type: record.type,
    payload: record.payload,
    is_draft: record.is_draft,
    created_at: record.created_at,
  };

  if (idempotencyKey) {
    await storeIdempotency(auth.partnerId, endpoint, idempotencyKey, 201, responseBody);
  }

  return jsonResponse(responseBody, 201, corsHeaders);
}

async function handleListHotspots(
  videoId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (!hasScope(auth, "hotspots:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: hotspots:write" }], corsHeaders);
  }

  const supabase = createUntypedClient();

  // Verify video belongs to partner
  const { data: video } = await supabase
    .from("partner_videos")
    .select("id")
    .eq("id", videoId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!video) {
    return errorResponse(404, "NOT_FOUND", [{ message: "Video not found" }], corsHeaders);
  }

  // Always return draft hotspots only
  // Published hotspots are served via /v1/runtime/videos/:id/manifest
  const { data, error } = await supabase
    .from("partner_hotspots")
    .select("*")
    .eq("video_id", videoId)
    .eq("partner_id", auth.partnerId)
    .eq("is_draft", true)
    .order("t_start", { ascending: true });

  if (error) {
    console.error("List hotspots error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const records = (data || []) as PartnerHotspot[];
  const hotspots = records.map((h) => ({
    hotspot_id: h.id,
    video_id: h.video_id,
    x: h.x,
    y: h.y,
    t_start: h.t_start,
    t_end: h.t_end,
    type: h.type,
    payload: h.payload,
    is_draft: h.is_draft,
    created_at: h.created_at,
    updated_at: h.updated_at,
  }));

  return jsonResponse({ hotspots }, 200, corsHeaders);
}

async function handleUpdateHotspot(
  req: Request,
  hotspotId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>,
  idempotencyKey: string | null
): Promise<Response> {
  if (!hasScope(auth, "hotspots:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: hotspots:write" }], corsHeaders);
  }

  const endpoint = `PATCH /v1/hotspots/${hotspotId}`;

  if (idempotencyKey) {
    const cached = await checkIdempotency(auth.partnerId, endpoint, idempotencyKey);
    if (cached) {
      return jsonResponse(cached.body, cached.status, corsHeaders);
    }
  }

  const supabase = createUntypedClient();

  // Verify hotspot exists and belongs to partner
  const { data: existingData } = await supabase
    .from("partner_hotspots")
    .select("*")
    .eq("id", hotspotId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!existingData) {
    return errorResponse(404, "NOT_FOUND", undefined, corsHeaders);
  }

  const existing = existingData as PartnerHotspot;
  if (!existing.is_draft) {
    return errorResponse(400, "VALIDATION_ERROR", [{ message: "Cannot update published hotspot" }], corsHeaders);
  }

  let body: Partial<{
    x: number;
    y: number;
    t_start: number;
    t_end: number;
    type: string;
    payload: Record<string, unknown>;
  }>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", [{ field: "body", message: "Invalid JSON" }], corsHeaders);
  }

  const errors = validateHotspot({
    ...body,
    t_start: body.t_start ?? existing.t_start,
    t_end: body.t_end ?? existing.t_end,
  });

  if (errors.length > 0) {
    return errorResponse(400, "VALIDATION_ERROR", errors, corsHeaders);
  }

  const updates: Record<string, unknown> = {};
  if (body.x !== undefined) updates.x = body.x;
  if (body.y !== undefined) updates.y = body.y;
  if (body.t_start !== undefined) updates.t_start = body.t_start;
  if (body.t_end !== undefined) updates.t_end = body.t_end;
  if (body.type !== undefined) updates.type = body.type;
  if (body.payload !== undefined) updates.payload = body.payload;

  const { data, error } = await supabase
    .from("partner_hotspots")
    .update(updates)
    .eq("id", hotspotId)
    .eq("partner_id", auth.partnerId)
    .select("*")
    .single();

  if (error) {
    console.error("Update hotspot error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const record = data as PartnerHotspot;
  const responseBody = {
    hotspot_id: record.id,
    video_id: record.video_id,
    x: record.x,
    y: record.y,
    t_start: record.t_start,
    t_end: record.t_end,
    type: record.type,
    payload: record.payload,
    is_draft: record.is_draft,
    updated_at: record.updated_at,
  };

  if (idempotencyKey) {
    await storeIdempotency(auth.partnerId, endpoint, idempotencyKey, 200, responseBody);
  }

  return jsonResponse(responseBody, 200, corsHeaders);
}

async function handleDeleteHotspot(
  hotspotId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>,
  idempotencyKey: string | null
): Promise<Response> {
  if (!hasScope(auth, "hotspots:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: hotspots:write" }], corsHeaders);
  }

  const endpoint = `DELETE /v1/hotspots/${hotspotId}`;

  if (idempotencyKey) {
    const cached = await checkIdempotency(auth.partnerId, endpoint, idempotencyKey);
    if (cached) {
      return new Response(null, { status: cached.status, headers: corsHeaders });
    }
  }

  const supabase = createUntypedClient();

  // Verify hotspot exists and is draft
  const { data: existingData } = await supabase
    .from("partner_hotspots")
    .select("is_draft")
    .eq("id", hotspotId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!existingData) {
    return errorResponse(404, "NOT_FOUND", undefined, corsHeaders);
  }

  const existing = existingData as PartnerHotspot;
  if (!existing.is_draft) {
    return errorResponse(400, "VALIDATION_ERROR", [{ message: "Cannot delete published hotspot" }], corsHeaders);
  }

  const { error } = await supabase
    .from("partner_hotspots")
    .delete()
    .eq("id", hotspotId)
    .eq("partner_id", auth.partnerId);

  if (error) {
    console.error("Delete hotspot error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  if (idempotencyKey) {
    await storeIdempotency(auth.partnerId, endpoint, idempotencyKey, 204, null);
  }

  return new Response(null, { status: 204, headers: corsHeaders });
}

// Publishing
async function handlePublish(
  videoId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>,
  idempotencyKey: string | null
): Promise<Response> {
  if (!hasScope(auth, "publish:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: publish:write" }], corsHeaders);
  }

  const endpoint = `POST /v1/videos/${videoId}/publish`;

  if (idempotencyKey) {
    const cached = await checkIdempotency(auth.partnerId, endpoint, idempotencyKey);
    if (cached) {
      return jsonResponse(cached.body, cached.status, corsHeaders);
    }
  }

  const supabase = createUntypedClient();

  // Verify video exists and belongs to partner
  const { data: videoData } = await supabase
    .from("partner_videos")
    .select("*")
    .eq("id", videoId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!videoData) {
    return errorResponse(404, "NOT_FOUND", [{ message: "Video not found" }], corsHeaders);
  }

  const video = videoData as PartnerVideo;

  // Get current draft hotspots
  const { data: hotspotsData } = await supabase
    .from("partner_hotspots")
    .select("*")
    .eq("video_id", videoId)
    .eq("partner_id", auth.partnerId)
    .eq("is_draft", true)
    .order("t_start", { ascending: true });

  const hotspots = (hotspotsData || []) as PartnerHotspot[];

  // Get latest version
  const { data: latestRevisionData } = await supabase
    .from("partner_published_revisions")
    .select("version")
    .eq("video_id", videoId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const latestRevision = latestRevisionData as PartnerPublishedRevision | null;
  const newVersion = (latestRevision?.version || 0) + 1;
  const publicUrl = buildPublicUrl(videoId);

  // Create manifest snapshot
  const manifestJson = {
    video_id: videoId,
    partner_id: auth.partnerId,
    version: newVersion,
    updated_at: new Date().toISOString(),
    video: {
      external_url: video.external_url,
      external_id: video.external_id,
      title: video.title,
    },
    hotspots: hotspots.map((h) => ({
      id: h.id,
      x: h.x,
      y: h.y,
      t_start: h.t_start,
      t_end: h.t_end,
      type: h.type,
      payload: h.payload,
    })),
    config: {
      pingEnabled: true,
    },
  };

  // Create published revision
  const { data: revisionData, error } = await supabase
    .from("partner_published_revisions")
    .insert({
      video_id: videoId,
      partner_id: auth.partnerId,
      version: newVersion,
      state: "published",
      public_url: publicUrl,
      manifest_json: manifestJson,
    })
    .select("id, version, public_url")
    .single();

  if (error) {
    console.error("Publish error:", error);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }

  const revision = revisionData as PartnerPublishedRevision;
  const responseBody = {
    publish_id: revision.id,
    version: revision.version,
    public_url: revision.public_url,
  };

  if (idempotencyKey) {
    await storeIdempotency(auth.partnerId, endpoint, idempotencyKey, 201, responseBody);
  }

  return jsonResponse(responseBody, 201, corsHeaders);
}

async function handleGetPublishStatus(
  videoId: string,
  auth: AuthContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (!hasScope(auth, "publish:write")) {
    return errorResponse(403, "FORBIDDEN", [{ message: "Missing scope: publish:write" }], corsHeaders);
  }

  const supabase = createUntypedClient();

  // Verify video belongs to partner
  const { data: video } = await supabase
    .from("partner_videos")
    .select("id")
    .eq("id", videoId)
    .eq("partner_id", auth.partnerId)
    .single();

  if (!video) {
    return errorResponse(404, "NOT_FOUND", [{ message: "Video not found" }], corsHeaders);
  }

  const { data: revisionData } = await supabase
    .from("partner_published_revisions")
    .select("*")
    .eq("video_id", videoId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (!revisionData) {
    return jsonResponse({ published: false }, 200, corsHeaders);
  }

  const revision = revisionData as PartnerPublishedRevision;
  return jsonResponse(
    {
      published: true,
      publish_id: revision.id,
      version: revision.version,
      public_url: revision.public_url,
      created_at: revision.created_at,
    },
    200,
    corsHeaders
  );
}

// =====================================================
// Runtime endpoints - PUBLIC ACCESS (no auth required)
// =====================================================

// Public runtime resolve - no auth required
async function handleRuntimeResolvePublic(
  url: URL,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // TODO: Rate limiting placeholder - add before production
  // Consider implementing token bucket or sliding window rate limiting
  // Example: 100 requests per minute per IP
  
  const partner = url.searchParams.get("partner");
  const externalId = url.searchParams.get("external_id");

  if (!partner || !externalId) {
    return errorResponse(400, "VALIDATION_ERROR", [{ message: "partner and external_id are required" }], corsHeaders);
  }

  const supabase = createUntypedClient();
  const { data: videoData } = await supabase
    .from("partner_videos")
    .select("id")
    .eq("partner_id", partner)
    .eq("external_id", externalId)
    .single();

  if (!videoData) {
    return errorResponse(404, "MAPPING_NOT_FOUND", undefined, corsHeaders);
  }

  const video = videoData as PartnerVideo;

  // Get latest published version
  const { data: revisionData } = await supabase
    .from("partner_published_revisions")
    .select("version")
    .eq("video_id", video.id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const revision = revisionData as PartnerPublishedRevision | null;
  const baseUrl = `${SUPABASE_URL}/functions/v1/partner-api`;

  return jsonResponse(
    {
      video_id: video.id,
      latest_version: revision?.version || null,
      public_manifest_url: revision ? `${baseUrl}/v1/runtime/videos/${video.id}/manifest` : null,
    },
    200,
    { ...corsHeaders, "Cache-Control": "public, max-age=60" }
  );
}

// Public manifest endpoint - no auth required
async function handleRuntimeManifestPublic(
  req: Request,
  videoId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // TODO: Rate limiting placeholder - add before production
  // Consider implementing token bucket or sliding window rate limiting
  // Example: 100 requests per minute per IP
  
  const supabase = createUntypedClient();

  // Get latest published revision (no partner filter - any published video)
  const { data: revisionData } = await supabase
    .from("partner_published_revisions")
    .select("*")
    .eq("video_id", videoId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (!revisionData) {
    return errorResponse(404, "NOT_FOUND", [{ message: "No published version found" }], corsHeaders);
  }

  const revision = revisionData as PartnerPublishedRevision;
  const manifestContent = JSON.stringify(revision.manifest_json);
  const etag = await generateETag(manifestContent);

  // Check If-None-Match header
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: { ...corsHeaders, ETag: etag },
    });
  }

  return jsonResponse(revision.manifest_json, 200, {
    ...corsHeaders,
    "Cache-Control": "public, max-age=60",
    ETag: etag,
  });
}

// Legacy authenticated runtime handlers - kept for backward compatibility
// but primary access should be via public endpoints above

// Main router
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Extract path after /partner-api
  const pathMatch = url.pathname.match(/\/partner-api(.*)$/);
  const path = pathMatch ? pathMatch[1] : url.pathname;
  const method = req.method;

  console.log(`[partner-api] ${method} ${path}`);

  // Health check (no auth required)
  if (path === "/v1/health" && method === "GET") {
    return handleHealth(corsHeaders);
  }

  // Runtime endpoints - PUBLIC ACCESS (no auth required)
  // These are used by partner web players for overlay playback
  // TODO: Rate limiting placeholder - implement before production
  if (path === "/v1/runtime/resolve" && method === "GET") {
    return handleRuntimeResolvePublic(url, corsHeaders);
  }

  const manifestMatch = path.match(/^\/v1\/runtime\/videos\/([a-f0-9-]+)\/manifest$/);
  if (manifestMatch && method === "GET") {
    return handleRuntimeManifestPublic(req, manifestMatch[1], corsHeaders);
  }

  // All other endpoints require authentication
  const auth = await authenticate(req);
  if (!auth) {
    return errorResponse(401, "UNAUTHORIZED", undefined, corsHeaders);
  }

  console.log(`[partner-api] Authenticated: partner_id=${auth.partnerId}`);

  const idempotencyKey = req.headers.get("idempotency-key");

  // Route matching
  try {
    // Videos
    if (path === "/v1/videos" && method === "POST") {
      return handleCreateVideo(req, auth, corsHeaders, idempotencyKey);
    }

    if (path === "/v1/videos" && method === "GET") {
      return handleListVideos(url, auth, corsHeaders);
    }

    const videoIdMatch = path.match(/^\/v1\/videos\/([a-f0-9-]+)$/);
    if (videoIdMatch && method === "GET") {
      return handleGetVideo(videoIdMatch[1], auth, corsHeaders);
    }

    // Hotspots on video
    const videoHotspotsMatch = path.match(/^\/v1\/videos\/([a-f0-9-]+)\/hotspots$/);
    if (videoHotspotsMatch) {
      if (method === "POST") {
        return handleCreateHotspot(req, videoHotspotsMatch[1], auth, corsHeaders, idempotencyKey);
      }
      if (method === "GET") {
        return handleListHotspots(videoHotspotsMatch[1], auth, corsHeaders);
      }
    }

    // Hotspot by ID
    const hotspotIdMatch = path.match(/^\/v1\/hotspots\/([a-f0-9-]+)$/);
    if (hotspotIdMatch) {
      if (method === "PATCH") {
        return handleUpdateHotspot(req, hotspotIdMatch[1], auth, corsHeaders, idempotencyKey);
      }
      if (method === "DELETE") {
        return handleDeleteHotspot(hotspotIdMatch[1], auth, corsHeaders, idempotencyKey);
      }
    }

    // Publish
    const publishMatch = path.match(/^\/v1\/videos\/([a-f0-9-]+)\/publish$/);
    if (publishMatch) {
      if (method === "POST") {
        return handlePublish(publishMatch[1], auth, corsHeaders, idempotencyKey);
      }
      if (method === "GET") {
        return handleGetPublishStatus(publishMatch[1], auth, corsHeaders);
      }
    }

    // Runtime endpoints are now handled before auth check (public access)

    // 404 for unknown routes
    return errorResponse(404, "NOT_FOUND", [{ message: `Unknown endpoint: ${method} ${path}` }], corsHeaders);
  } catch (err) {
    console.error("[partner-api] Unhandled error:", err);
    return errorResponse(500, "INTERNAL_ERROR", undefined, corsHeaders);
  }
});
