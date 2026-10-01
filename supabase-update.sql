-- ================================================================
-- IGPAGE – Aggiornamento schema (carosello + musica + filtri)
-- Esegui nel SQL Editor di Supabase → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS post_images (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url  TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT ALL ON post_images TO anon;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_post_images" ON post_images;
CREATE POLICY "open_post_images" ON post_images FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_title  TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_artist TEXT;

ALTER TABLE highlight_stories ADD COLUMN IF NOT EXISTS music_title       TEXT;
ALTER TABLE highlight_stories ADD COLUMN IF NOT EXISTS music_artist      TEXT;
ALTER TABLE highlight_stories ADD COLUMN IF NOT EXISTS music_preview_url TEXT;
ALTER TABLE highlight_stories ADD COLUMN IF NOT EXISTS music_artwork_url TEXT;
ALTER TABLE highlight_stories ADD COLUMN IF NOT EXISTS filter_name       TEXT DEFAULT 'normal';

ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_preview_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS music_artwork_url TEXT;
