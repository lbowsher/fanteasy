'use client'

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
            className="w-full px-4 py-3 flex items-center justify-between text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
          >
            <span className="font-medium">Previous Leagues</span>
            <span className="text-sm flex items-center gap-1">
              {showPreviousYears ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> Show</>} ({previousYearTeams.length})
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
