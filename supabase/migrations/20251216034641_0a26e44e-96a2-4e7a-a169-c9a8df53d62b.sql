-- Create creators table for multi-tenant support
CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  creator_handle TEXT NOT NULL UNIQUE,
  creator_kuerzel TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on creators
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Creator can read their own profile
CREATE POLICY "Users can view their own creator profile"
ON public.creators FOR SELECT
USING (auth.uid() = user_id);

-- Creator can update their own profile
CREATE POLICY "Users can update their own creator profile"
ON public.creators FOR UPDATE
USING (auth.uid() = user_id);

-- Creator can insert their own profile (on signup)
CREATE POLICY "Users can create their own creator profile"
ON public.creators FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create videos table (replacing external API)
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  original_video_key TEXT,
  rendered_video_key TEXT,
  render_status TEXT DEFAULT 'NONE',
  custom_slug TEXT,
  slug_finalized BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Creator can only see their own videos
CREATE POLICY "Creators can view their own videos"
ON public.videos FOR SELECT
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator can insert their own videos
CREATE POLICY "Creators can create their own videos"
ON public.videos FOR INSERT
WITH CHECK (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator can update their own videos
CREATE POLICY "Creators can update their own videos"
ON public.videos FOR UPDATE
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Creator can delete their own videos
CREATE POLICY "Creators can delete their own videos"
ON public.videos FOR DELETE
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Create hotspots table
CREATE TABLE public.hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  x DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  y DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  scale DOUBLE PRECISION DEFAULT 1.0,
  time_start_ms INTEGER NOT NULL DEFAULT 0,
  time_end_ms INTEGER NOT NULL DEFAULT 3000,
  style TEXT DEFAULT 'badge-bubble-small',
  card_style TEXT,
  template_family TEXT,
  countdown_enabled BOOLEAN DEFAULT false,
  countdown_style TEXT,
  countdown_position TEXT,
  product_id TEXT,
  product_title TEXT,
  product_url TEXT,
  product_image_url TEXT,
  product_price TEXT,
  product_currency TEXT DEFAULT 'USD',
  product_description TEXT,
  product_promo_code TEXT,
  cta_label TEXT,
  click_behavior TEXT DEFAULT 'card-then-shop',
  toolbar_offset_x DOUBLE PRECISION DEFAULT 0,
  toolbar_offset_y DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hotspots
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;

-- Hotspot access is scoped through video ownership
CREATE POLICY "Users can view hotspots for their videos"
ON public.hotspots FOR SELECT
USING (video_id IN (
  SELECT v.id FROM public.videos v
  JOIN public.creators c ON v.creator_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Users can create hotspots for their videos"
ON public.hotspots FOR INSERT
WITH CHECK (video_id IN (
  SELECT v.id FROM public.videos v
  JOIN public.creators c ON v.creator_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Users can update hotspots for their videos"
ON public.hotspots FOR UPDATE
USING (video_id IN (
  SELECT v.id FROM public.videos v
  JOIN public.creators c ON v.creator_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Users can delete hotspots for their videos"
ON public.hotspots FOR DELETE
USING (video_id IN (
  SELECT v.id FROM public.videos v
  JOIN public.creators c ON v.creator_id = c.id
  WHERE c.user_id = auth.uid()
));

-- Unique constraint for slug per creator (not global)
CREATE UNIQUE INDEX idx_videos_creator_slug ON public.videos(creator_id, custom_slug) WHERE custom_slug IS NOT NULL;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotspots_updated_at
BEFORE UPDATE ON public.hotspots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();