-- ═══════════════════════════════════════════════════════════
-- PRODIGY KINDERGARTEN — Supabase Setup
-- ═══════════════════════════════════════════════════════════
-- Run this SQL in Supabase Dashboard > SQL Editor
-- Project: wldmsvedbnzyyoaaiyvo
-- ═══════════════════════════════════════════════════════════

-- 1. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  child_name TEXT NOT NULL,
  child_age TEXT,
  program TEXT,
  visit_date TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 3. Allow ANYONE to submit a form (public insert)
CREATE POLICY "public_insert" ON submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Only authenticated admins can VIEW submissions
CREATE POLICY "auth_select" ON submissions
  FOR SELECT TO authenticated
  USING (true);

-- 5. Only authenticated admins can UPDATE status
CREATE POLICY "auth_update" ON submissions
  FOR UPDATE TO authenticated
  USING (true);

-- 6. Only authenticated admins can DELETE
CREATE POLICY "auth_delete" ON submissions
  FOR DELETE TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════════
-- AFTER running this SQL, go to:
-- Supabase Dashboard > Authentication > Users > Add User
-- Add: your-email@prodigy.com with your chosen password
-- ═══════════════════════════════════════════════════════════
