-- Add unique constraint for idempotent video resolution
ALTER TABLE partner_videos 
ADD CONSTRAINT partner_videos_partner_external_unique 
UNIQUE (partner_id, external_id);