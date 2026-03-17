'use client';

import { useState } from 'react';
import type { NcaaTeamInfo } from './utils';

interface ExpectedGamesSectionProps {
  teams: string[];
  teamInfo: NcaaTeamInfo[];
  expectedGames: Record<string, number>;
  onChange: (teamName: string, games: number) => void;
}

export default function ExpectedGamesSection({
  teams,
  teamInfo,
  expectedGames,
  onChange,
}: ExpectedGamesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const teamInfoMap = new Map<string, NcaaTeamInfo>();
  for (const ti of teamInfo) {
    teamInfoMap.set(ti.team_name, ti);
  }

  // Sort teams by seed (seeded first), then alphabetically
  const sortedTeams = [...teams].sort((a, b) => {
    const seedA = teamInfoMap.get(a)?.seed ?? 99;
    const seedB = teamInfoMap.get(b)?.seed ?? 99;
    if (seedA !== seedB) return seedA - seedB;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold text-foreground">Expected Games Per Team</h3>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {sortedTeams.map((team) => {
            const info = teamInfoMap.get(team);
            const games = expectedGames[team] || 1;

            return (
              <div
                key={team}
                className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs"
              >
                <div className="min-w-0 mr-2">
                  <span className="font-medium text-foreground truncate block">{team}</span>
                  {info?.seed && (
                    <span className="text-muted-foreground">#{info.seed}</span>
                  )}
                </div>
                <select
                  value={games}
                  onChange={(e) => onChange(team, parseInt(e.target.value))}
                  className="bg-background border border-border rounded px-1 py-0.5 text-xs w-12 text-foreground"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
