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
  last_played TEXT[] DEFAULT '{}', -- Array of timestamp strings
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

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Artists indexes
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Songs indexes
CREATE INDEX IF NOT EXISTS idx_songs_custom_id ON songs(custom_song_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_last_played ON songs USING GIN(last_played);

-- Interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_entity ON interactions(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);

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

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE tablename IN ('artists', 'songs', 'interactions')
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

-- Show indexes
SELECT 
  indexname,
  tablename,
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('artists', 'songs', 'interactions')
ORDER BY tablename, indexname;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Your database is now ready for the Carnaval Radio application.
-- You can test the connection by running your /api/songs endpoint.