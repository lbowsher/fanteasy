import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { Database } from '@/lib/database.types';
import RankingsPage from './rankings-page';
import { parsePlayerSummary, getDefaultExpectedGames, computeProjectedTotal } from './utils';
import type { PlayerWithStats, NcaaTeamInfo, UserRanking, UserTeamSetting } from './utils';

type DbPlayer = Database['public']['Tables']['players']['Row'];

export const dynamic = 'force-dynamic';

export default async function NCAAankingsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login?redirect=/rankings/ncaa');
  }

  // Fetch all data in parallel
  const [playersRes, teamInfoRes, rankingsRes, teamSettingsRes] = await Promise.all([
    supabase
      .from('players')
      .select('*')
      .eq('league', 'NCAAM')
      .eq('season', '2026'),
    supabase
      .from('ncaa_team_info')
      .select('*')
      .eq('season_year', 2026),
    supabase
      .from('user_ncaa_rankings')
      .select('*')
      .eq('user_id', user.id)
      .eq('season_year', 2026),
    supabase
      .from('user_ncaa_team_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('season_year', 2026),
  ]);

  const players = (playersRes.data || []) as DbPlayer[];
  const teamInfo = (teamInfoRes.data || []) as NcaaTeamInfo[];
  const userRankings = (rankingsRes.data || []) as UserRanking[];
  const userTeamSettings = (teamSettingsRes.data || []) as UserTeamSetting[];

  // Build expected games map from team info + user overrides
  const teamInfoMap = new Map<string, NcaaTeamInfo>();
  for (const ti of teamInfo) {
    teamInfoMap.set(ti.team_name, ti);
  }

  const expectedGamesMap: Record<string, number> = {};
  const allTeamNames = [...new Set(players.map((p) => p.team_name))];
  for (const teamName of allTeamNames) {
    const ti = teamInfoMap.get(teamName);
    expectedGamesMap[teamName] = getDefaultExpectedGames(ti?.seed);
  }
  // Apply user overrides
  for (const setting of userTeamSettings) {
    expectedGamesMap[setting.team_name] = setting.expected_games;
  }

  // Parse averages from summary string and compute projected totals
  const playersWithStats: PlayerWithStats[] = players.map((player) => {
    const averages = parsePlayerSummary(player.summary);
    const expectedGames = expectedGamesMap[player.team_name] || 1;
    const projectedTotal = computeProjectedTotal(averages.ppg, expectedGames);
    return { ...player, averages, projectedTotal };
  });

  return (
    <RankingsPage
      players={playersWithStats}
      teamInfo={teamInfo}
      userRankings={userRankings}
      userTeamSettings={userTeamSettings}
      initialExpectedGames={expectedGamesMap}
    />
  );
}
