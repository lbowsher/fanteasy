'use client'

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import Link from 'next/link';
import Teams from './teams';
import { Button } from '@/components/ui/button';

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

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trophy size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No teams yet</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Create a new league to get started, or ask a commissioner for an invite link.
        </p>
        <Button asChild>
          <Link href="/new-league">Create a League</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Teams teams={currentYearTeams} />

      {hasPreviousYears && (
        <div className="border-t border-border pt-2">
          <button
            onClick={() => setShowPreviousYears(!showPreviousYears)}
            className="w-full px-3 py-2 flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="font-medium text-sm">Previous Leagues</span>
            <span className="text-sm flex items-center gap-1">
              {showPreviousYears ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> Show</>} ({previousYearTeams.length})
            </span>
          </button>

          {showPreviousYears && (
            <div className="mt-3">
              <Teams teams={previousYearTeams} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
