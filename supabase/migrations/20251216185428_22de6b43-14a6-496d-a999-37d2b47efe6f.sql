-- Add explicit state column to videos table
ALTER TABLE videos 
ADD COLUMN state text NOT NULL DEFAULT 'draft'
CHECK (state IN ('draft', 'editing', 'ready_to_post', 'posted'));

-- Migrate existing data based on slug_finalized
UPDATE videos SET state = 'ready_to_post' WHERE slug_finalized = true;
UPDATE videos SET state = 'draft' WHERE slug_finalized = false OR slug_finalized IS NULL;