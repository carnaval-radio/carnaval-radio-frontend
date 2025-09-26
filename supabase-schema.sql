-- Carnaval Radio Database Schema Setup
-- Run this entire file in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_song_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL, -- Can reference songs.id or artists.id
  entity_type TEXT NOT NULL CHECK (entity_type IN ('song', 'artist')),
  type TEXT NOT NULL CHECK (type IN ('like', 'vote', 'comment', 'lyrics')),
  user_id TEXT NOT NULL, -- Stored as text for flexibility
  content TEXT, -- Optional content for comments/lyrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Play times table (every play event)
CREATE TABLE IF NOT EXISTS play_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Play times indexes
CREATE INDEX idx_play_times_played_at ON play_times(played_at DESC);

-- Artists indexes
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Songs indexes
CREATE INDEX IF NOT EXISTS idx_songs_custom_id ON songs(custom_song_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);


-- Interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_entity ON interactions(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);

-- Ensure one like per device per song
CREATE UNIQUE INDEX IF NOT EXISTS ux_interactions_user_entity_type
ON interactions(user_id, entity_id, type);

-- ============================================
-- 3. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to songs table
DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;
CREATE TRIGGER update_songs_updated_at 
    BEFORE UPDATE ON songs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to artists table
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at 
    BEFORE UPDATE ON artists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_times ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Artists are publicly readable" ON artists;
DROP POLICY IF EXISTS "Songs are publicly readable" ON songs;
DROP POLICY IF EXISTS "Interactions are publicly readable" ON interactions;
DROP POLICY IF EXISTS "Allow public insert artists" ON artists;
DROP POLICY IF EXISTS "Allow public upsert songs" ON songs;
DROP POLICY IF EXISTS "Allow public update songs" ON songs;
DROP POLICY IF EXISTS "Allow public insert interactions" ON interactions;

-- Artists policies
CREATE POLICY "Artists are publicly readable" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow public insert artists" ON artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update artists" ON artists FOR UPDATE USING (true);

-- Songs policies
CREATE POLICY "Songs are publicly readable" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update songs" ON songs FOR UPDATE USING (true);

-- Interactions policies
CREATE POLICY "Interactions are publicly readable" ON interactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert interactions" ON interactions FOR INSERT WITH CHECK (true);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Play times are publicly readable" ON play_times;
DROP POLICY IF EXISTS "Allow public insert play_times" ON play_times;

-- Publicly readable
CREATE POLICY "Play times are publicly readable" ON play_times
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert play_times" ON play_times
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE tablename IN ('artists', 'songs', 'interactions', 'play_times')
ORDER BY tablename;

-- Check table structures
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'artists'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'songs'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'interactions'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'play_times'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname,
  tablename,
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('artists', 'songs', 'interactions', 'play_times')
ORDER BY tablename, indexname;

-- 1) Optional analytics columns on interactions
ALTER TABLE public.interactions
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2) Helpful composite indexes for common queries

-- Lookup a user's likes or enforce unique like per user+song+type
-- First, remove any duplicates to allow the unique index to be created safely
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, entity_id, type
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.interactions
  WHERE entity_type = 'song' AND type = 'like'
)
DELETE FROM public.interactions i
USING ranked r
WHERE i.id = r.id AND r.rn > 1;

-- Unique: one like per device/user per entity and type
CREATE UNIQUE INDEX IF NOT EXISTS ux_interactions_user_entity_type
  ON public.interactions (user_id, entity_id, type);

-- Fast filters by entity type and interaction type (e.g., count likes per song)
CREATE INDEX IF NOT EXISTS idx_interactions_entityType_type
  ON public.interactions (entity_type, type);

-- Fast lookup for a user's favorites of a given type (optional but useful)
CREATE INDEX IF NOT EXISTS idx_interactions_entityType_type_user
  ON public.interactions (entity_type, type, user_id);

-- If you routinely fetch counts per song, this can help aggregations
CREATE INDEX IF NOT EXISTS idx_interactions_type_entity
  ON public.interactions (type, entity_id);

-- 3) Existing indexes (keep if already present)
-- These are safe and will be skipped if they exist
CREATE INDEX IF NOT EXISTS idx_interactions_entity ON public.interactions (entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.interactions (type);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON public.interactions (user_id);

-- 4) Optional: keep your tables up to date for planner stats
ANALYZE public.interactions;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Your database is now ready for the Carnaval Radio application.
-- You can test the connection by running your /api/songs endpoint.