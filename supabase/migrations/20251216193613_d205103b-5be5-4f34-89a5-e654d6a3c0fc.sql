-- Create events table for internal tracking
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  creator_id uuid NOT NULL,
  video_id uuid,
  event_name text NOT NULL,
  event_source text NOT NULL DEFAULT 'studio' CHECK (event_source IN ('studio', 'public')),
  properties jsonb DEFAULT '{}',
  ip_hash text,
  user_agent text
);

-- Indexes for efficient querying
CREATE INDEX idx_events_video_id ON public.events(video_id);
CREATE INDEX idx_events_creator_id ON public.events(creator_id);
CREATE INDEX idx_events_name ON public.events(event_name);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);

-- Unique constraint for idempotency on certain events (one per video)
CREATE UNIQUE INDEX idx_events_one_per_video 
ON public.events (video_id, event_name) 
WHERE event_name IN ('caption_generated', 'slug_confirmed', 'hotspots_completed');

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Creators can view their own events
CREATE POLICY "Creators can view their own events" ON public.events
  FOR SELECT USING (creator_id IN (
    SELECT id FROM public.creators WHERE user_id = auth.uid()
  ));

-- RLS Policy: Allow authenticated inserts for studio events
CREATE POLICY "Authenticated users can insert studio events" ON public.events
  FOR INSERT WITH CHECK (creator_id IN (
    SELECT id FROM public.creators WHERE user_id = auth.uid()
  ));