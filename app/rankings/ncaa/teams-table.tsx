'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NcaaTeamInfo, PlayerWithStats } from './utils';

interface TeamsTableProps {
  teams: string[];
  teamInfo: NcaaTeamInfo[];
  expectedGames: Record<string, number>;
  players: PlayerWithStats[];
  onExpectedGamesChange: (teamName: string, games: number) => void;
}

export default function TeamsTable({
  teams,
  teamInfo,
  expectedGames,
  players,
  onExpectedGamesChange,
}: TeamsTableProps) {
  const teamInfoMap = new Map<string, NcaaTeamInfo>();
  for (const ti of teamInfo) {
    teamInfoMap.set(ti.team_name, ti);
  }

  // Compute team-level aggregates
  const teamData = teams.map((teamName) => {
    const info = teamInfoMap.get(teamName);
    const teamPlayers = players.filter((p) => p.team_name === teamName);
    const avgPpg =
      teamPlayers.length > 0
        ? Math.round(
            (teamPlayers.reduce((sum, p) => sum + p.averages.ppg, 0) / teamPlayers.length) * 10
          ) / 10
        : 0;

    return {
      teamName,
      seed: info?.seed ?? null,
      region: info?.region ?? null,
      expectedGames: expectedGames[teamName] || 1,
      playerCount: teamPlayers.length,
      avgPpg,
    };
  });

  // Sort by seed (seeded first, then alphabetical)
  teamData.sort((a, b) => {
    const seedA = a.seed ?? 99;
    const seedB = b.seed ?? 99;
    if (seedA !== seedB) return seedA - seedB;
    return a.teamName.localeCompare(b.teamName);
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="w-[60px] text-center">Seed</TableHead>
              <TableHead className="hidden sm:table-cell">Region</TableHead>
              <TableHead className="w-[80px] text-center">Games</TableHead>
              <TableHead className="w-[80px] text-center">Players</TableHead>
              <TableHead className="w-[80px] text-right">Avg PPG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamData.map((team) => (
              <TableRow key={team.teamName}>
                <TableCell className="font-medium">{team.teamName}</TableCell>
                <TableCell className="text-center">
                  {team.seed ? `#${team.seed}` : '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {team.region || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <select
                    value={team.expectedGames}
                    onChange={(e) =>
                      onExpectedGamesChange(team.teamName, parseInt(e.target.value))
                    }
                    className="bg-background border border-border rounded px-1 py-0.5 text-sm w-14 text-foreground"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-center">{team.playerCount}</TableCell>
                <TableCell className="text-right">{team.avgPpg}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
