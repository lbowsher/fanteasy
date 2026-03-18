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
import type { NcaaTeamInfo } from './utils';

interface TeamsTableProps {
  teams: string[];
  teamInfo: NcaaTeamInfo[];
  expectedGames: Record<string, number>;
  onExpectedGamesChange: (teamName: string, games: number) => void;
}

export default function TeamsTable({
  teams,
  teamInfo,
  expectedGames,
  onExpectedGamesChange,
}: TeamsTableProps) {
  const teamInfoMap = new Map<string, NcaaTeamInfo>();
  for (const ti of teamInfo) {
    teamInfoMap.set(ti.team_name, ti);
  }

  // Compute team-level data
  const teamData = teams.map((teamName) => {
    const info = teamInfoMap.get(teamName);

    return {
      teamName,
      seed: info?.seed ?? null,
      region: info?.region ?? null,
      expectedGames: expectedGames[teamName] || 1,
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
              <TableHead className="w-[60px] text-center">Seed</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="hidden sm:table-cell">Region</TableHead>
              <TableHead className="w-[80px] text-center">Games</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamData.map((team) => (
              <TableRow key={team.teamName}>
                <TableCell className="text-center">
                  {team.seed ? `#${team.seed}` : '-'}
                </TableCell>
                <TableCell className="font-medium">{team.teamName}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {team.region || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="number"
                    value={team.expectedGames}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 6) {
                        onExpectedGamesChange(team.teamName, Math.round(val * 10) / 10);
                      }
                    }}
                    min={0}
                    max={6}
                    step={0.1}
                    className="bg-background border border-border rounded px-1 py-0.5 text-sm w-14 text-foreground"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
