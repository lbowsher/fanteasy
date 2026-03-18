-- NCAA Rankings tables

-- Per-user player rankings
CREATE TABLE user_ncaa_rankings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rank_position integer NOT NULL,
  season_year integer NOT NULL DEFAULT 2026,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, player_id, season_year)
);
ALTER TABLE user_ncaa_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rankings" ON user_ncaa_rankings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Per-user expected games per team
CREATE TABLE user_ncaa_team_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  expected_games integer NOT NULL DEFAULT 1,
  season_year integer NOT NULL DEFAULT 2026,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, team_name, season_year)
);
ALTER TABLE user_ncaa_team_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own team settings" ON user_ncaa_team_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shared team metadata (seed, region)
CREATE TABLE ncaa_team_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name text NOT NULL,
  seed integer,
  region text,
  season_year integer NOT NULL DEFAULT 2026,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_name, season_year)
);
ALTER TABLE ncaa_team_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON ncaa_team_info FOR SELECT USING (true);
