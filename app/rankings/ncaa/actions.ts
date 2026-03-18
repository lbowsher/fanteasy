'use server';

import { createClient } from '@/app/utils/supabase/server';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function savePlayerRankings(
  rankings: { player_id: string; rank_position: number }[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const rows = rankings.map((r) => ({
    user_id: user.id,
    player_id: r.player_id,
    rank_position: r.rank_position,
    season_year: 2026,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('user_ncaa_rankings')
    .upsert(rows, { onConflict: 'user_id,player_id,season_year' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function saveExpectedGames(
  settings: { team_name: string; expected_games: number }[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const rows = settings.map((s) => ({
    user_id: user.id,
    team_name: s.team_name,
    expected_games: s.expected_games,
    season_year: 2026,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('user_ncaa_team_settings')
    .upsert(rows, { onConflict: 'user_id,team_name,season_year' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
