-- Выполнить в Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE tracker_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  data JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Разрешить доступ через anon key
ALTER TABLE tracker_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON tracker_data
  FOR ALL USING (true) WITH CHECK (true);

-- Начальные данные
INSERT INTO tracker_data (category, data) VALUES
  ('weights', '[]'),
  ('activities', '[]'),
  ('sleep', '[]'),
  ('water', '[]'),
  ('measurements', '[]'),
  ('procedures', '[]'),
  ('compliance', '[]'),
  ('mealWeek', '0'),
  ('settings', '{"goalWeight": 65, "startWeight": 99.05}');
