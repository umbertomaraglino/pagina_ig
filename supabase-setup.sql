-- ================================================================
-- IGPAGE – Supabase Setup SQL  (versione definitiva)
-- Copia tutto e incolla nel SQL Editor di Supabase → Run
-- ================================================================


-- ----------------------------------------------------------------
-- 1. TABELLE
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username         TEXT        NOT NULL DEFAULT 'myprofile',
  avatar_url       TEXT,
  bio              TEXT        DEFAULT '',
  posts_count      INTEGER     NOT NULL DEFAULT 0,
  followers_count  INTEGER     NOT NULL DEFAULT 0,
  following_count  INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url   TEXT        NOT NULL,
  caption     TEXT        DEFAULT '',
  likes_count INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author     TEXT        NOT NULL DEFAULT 'me',
  text       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highlights (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT        NOT NULL,
  cover_image_url  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highlight_stories (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID        NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
  image_url    TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- 2. PERMESSI AL RUOLO ANONIMO
-- ----------------------------------------------------------------

GRANT USAGE  ON SCHEMA public TO anon;
GRANT ALL ON profiles          TO anon;
GRANT ALL ON posts             TO anon;
GRANT ALL ON comments          TO anon;
GRANT ALL ON highlights        TO anon;
GRANT ALL ON highlight_stories TO anon;


-- ----------------------------------------------------------------
-- 3. RLS ABILITATO + POLICY APERTA (app privata senza login)
--    "USING (true)" = chiunque può leggere/scrivere/cancellare
-- ----------------------------------------------------------------

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights        ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlight_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_profiles"          ON profiles;
DROP POLICY IF EXISTS "open_posts"             ON posts;
DROP POLICY IF EXISTS "open_comments"          ON comments;
DROP POLICY IF EXISTS "open_highlights"        ON highlights;
DROP POLICY IF EXISTS "open_highlight_stories" ON highlight_stories;

CREATE POLICY "open_profiles"
  ON profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "open_posts"
  ON posts FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "open_comments"
  ON comments FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "open_highlights"
  ON highlights FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "open_highlight_stories"
  ON highlight_stories FOR ALL
  USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------
-- 4. PROFILO INIZIALE
-- ----------------------------------------------------------------

INSERT INTO profiles (username, bio, followers_count, following_count)
VALUES ('il_tuo_username', 'La tua bio qui ✨🌸', 0, 0)
ON CONFLICT DO NOTHING;


-- ----------------------------------------------------------------
-- 5. STORAGE BUCKETS (se non li hai già creati dalla Dashboard)
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',    'avatars',    true),
  ('posts',      'posts',      true),
  ('highlights', 'highlights', true)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- 6. POLICY STORAGE – permessi pubblici per upload/download
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "ig_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "ig_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "ig_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "ig_storage_delete" ON storage.objects;

CREATE POLICY "ig_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'posts', 'highlights'));

CREATE POLICY "ig_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('avatars', 'posts', 'highlights'));

CREATE POLICY "ig_storage_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('avatars', 'posts', 'highlights'));

CREATE POLICY "ig_storage_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('avatars', 'posts', 'highlights'));
