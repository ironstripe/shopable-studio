-- =====================================================
-- Partner Platform API MVP v1 - Database Schema
-- =====================================================

-- 1. Partner API Keys (hashed keys for authentication)
CREATE TABLE public.partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['videos:write', 'hotspots:write', 'publish:write', 'runtime:read'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  CONSTRAINT unique_partner_api_key_hash UNIQUE (key_hash)
);

CREATE INDEX idx_partner_api_keys_hash ON public.partner_api_keys(key_hash);
CREATE INDEX idx_partner_api_keys_partner ON public.partner_api_keys(partner_id);

-- Enable RLS (service role access for edge functions)
ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_api_keys" 
  ON public.partner_api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Partner Videos (external URL references)
CREATE TABLE public.partner_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'external_url',
  external_url TEXT NOT NULL,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_partner_video_external_id UNIQUE (partner_id, external_id)
);

CREATE INDEX idx_partner_videos_partner ON public.partner_videos(partner_id);
CREATE INDEX idx_partner_videos_external ON public.partner_videos(partner_id, external_id);

ALTER TABLE public.partner_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_videos" 
  ON public.partner_videos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_partner_videos_updated_at
  BEFORE UPDATE ON public.partner_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Partner Hotspots (draft hotspots)
CREATE TABLE public.partner_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.partner_videos(id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL CHECK (x >= 0 AND x <= 1),
  y DOUBLE PRECISION NOT NULL CHECK (y >= 0 AND y <= 1),
  t_start DOUBLE PRECISION NOT NULL CHECK (t_start >= 0),
  t_end DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL DEFAULT 'link',
  payload JSONB NOT NULL DEFAULT '{}',
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_hotspot_time_range CHECK (t_end > t_start)
);

CREATE INDEX idx_partner_hotspots_video ON public.partner_hotspots(video_id);
CREATE INDEX idx_partner_hotspots_partner ON public.partner_hotspots(partner_id);

ALTER TABLE public.partner_hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_hotspots" 
  ON public.partner_hotspots
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_partner_hotspots_updated_at
  BEFORE UPDATE ON public.partner_hotspots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Partner Published Revisions (immutable snapshots)
CREATE TABLE public.partner_published_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.partner_videos(id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'published',
  public_url TEXT NOT NULL,
  tiny_url TEXT,
  manifest_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_partner_video_version UNIQUE (video_id, version)
);

CREATE INDEX idx_partner_revisions_video ON public.partner_published_revisions(video_id);
CREATE INDEX idx_partner_revisions_latest ON public.partner_published_revisions(video_id, version DESC);

ALTER TABLE public.partner_published_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_published_revisions" 
  ON public.partner_published_revisions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Partner Idempotency Keys (for idempotent operations)
CREATE TABLE public.partner_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  
  CONSTRAINT unique_partner_idempotency UNIQUE (partner_id, endpoint, idempotency_key)
);

CREATE INDEX idx_idempotency_lookup ON public.partner_idempotency_keys(partner_id, endpoint, idempotency_key);
CREATE INDEX idx_idempotency_expires ON public.partner_idempotency_keys(expires_at);