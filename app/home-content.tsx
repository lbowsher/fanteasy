'use client'

import { useState, useMemo } from 'react';
import Teams from './teams';

const CURRENT_YEAR = 2026;

export default function HomeContent({ teams }: { teams: TeamWithLeague[] }) {
  const [showPreviousYears, setShowPreviousYears] = useState(false);

  const { currentYearTeams, previousYearTeams } = useMemo(() => {
    const current: TeamWithLeague[] = [];
    const previous: TeamWithLeague[] = [];

    teams.forEach(team => {
      const leagueYear = new Date(team.league.created_at).getFullYear();
      if (leagueYear >= CURRENT_YEAR) {
        current.push(team);
      } else {
        previous.push(team);
      }
    });

    return { currentYearTeams: current, previousYearTeams: previous };
  }, [teams]);

  const hasPreviousYears = previousYearTeams.length > 0;

  return (
    <>
      <Teams teams={currentYearTeams} />

      {hasPreviousYears && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowPreviousYears(!showPreviousYears)}
            className="w-full px-4 py-3 flex items-center justify-between text-secondary-text hover:text-primary-text hover:bg-surface transition-colors"
          >
            <span className="font-medium">Previous Leagues</span>
            <span className="text-sm">
              {showPreviousYears ? '▲ Hide' : '▼ Show'} ({previousYearTeams.length})
            </span>
          </button>

          {showPreviousYears && (
            <div className="border-t border-border">
              <Teams teams={previousYearTeams} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
