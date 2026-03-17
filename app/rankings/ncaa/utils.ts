import { Database } from '@/lib/database.types';

type DbPlayer = Database['public']['Tables']['players']['Row'];

export interface PlayerAverages {
  ppg: number;
  rpg: number;
  apg: number;
}

// Parse stats from the summary string format: "20.1 Pts, 3.0 Reb, 5.0 Ast"
export function parsePlayerSummary(summary: string | null): PlayerAverages {
  if (!summary) return { ppg: 0, rpg: 0, apg: 0 };

  const ptsMatch = summary.match(/([\d.]+)\s*Pts/i);
  const rebMatch = summary.match(/([\d.]+)\s*Reb/i);
  const astMatch = summary.match(/([\d.]+)\s*Ast/i);

  return {
    ppg: ptsMatch ? parseFloat(ptsMatch[1]) : 0,
    rpg: rebMatch ? parseFloat(rebMatch[1]) : 0,
    apg: astMatch ? parseFloat(astMatch[1]) : 0,
  };
}

export function computeProjectedTotal(ppg: number, expectedGames: number): number {
  return Math.round(ppg * expectedGames * 10) / 10;
}

// Default expected games based on seed
export function getDefaultExpectedGames(seed: number | null | undefined): number {
  if (!seed) return 1;
  if (seed === 1) return 4;
  if (seed === 2) return 3;
  if (seed <= 4) return 3;
  if (seed <= 6) return 2;
  if (seed <= 8) return 2;
  return 1;
}

export type PlayerWithStats = DbPlayer & {
  averages: PlayerAverages;
  projectedTotal: number;
};

export interface NcaaTeamInfo {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
  season_year: number;
}

export interface UserRanking {
  id: string;
  user_id: string;
  player_id: string;
  rank_position: number;
  season_year: number;
}

export interface UserTeamSetting {
  id: string;
  user_id: string;
  team_name: string;
  expected_games: number;
  season_year: number;
}
