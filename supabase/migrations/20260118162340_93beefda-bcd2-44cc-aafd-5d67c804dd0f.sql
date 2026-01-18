-- Make external_url optional (partner may not have stable CDN URL)
ALTER TABLE public.partner_videos 
  ALTER COLUMN external_url DROP NOT NULL;