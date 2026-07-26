CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  child_name TEXT NOT NULL,
  child_age TEXT,
  program TEXT,
  home_address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert" ON submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "auth_select" ON submissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_update" ON submissions
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "auth_delete" ON submissions
  FOR DELETE TO authenticated
  USING (true);
