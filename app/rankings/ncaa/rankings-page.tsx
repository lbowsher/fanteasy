'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RankingsFilters from './rankings-filters';
import PlayerRankingsList from './player-rankings-list';
import ExpectedGamesSection from './expected-games-section';
import TeamsTable from './teams-table';
import { savePlayerRankings, saveExpectedGames, deletePlayerRankings, deleteExpectedGames } from './actions';
import { computeProjectedTotal, getDefaultExpectedGames } from './utils';
import type { PlayerWithStats, NcaaTeamInfo, UserRanking, UserTeamSetting } from './utils';

type SortBy = 'projection' | 'expectedGames' | 'custom';
type SortDir = 'asc' | 'desc';

interface RankingsPageProps {
  players: PlayerWithStats[];
  teamInfo: NcaaTeamInfo[];
  userRankings: UserRanking[];
  userTeamSettings: UserTeamSetting[];
  initialExpectedGames: Record<string, number>;
}

export default function RankingsPage({
  players,
  teamInfo,
  userRankings,
  userTeamSettings,
  initialExpectedGames,
}: RankingsPageProps) {
  // Build initial ordered player list from rankings or raw list
  const buildInitialOrder = (): PlayerWithStats[] => {
    if (userRankings.length > 0) {
      const rankMap = new Map<string, number>();
      for (const r of userRankings) {
        rankMap.set(r.player_id, r.rank_position);
      }
      const ranked = players.filter((p) => rankMap.has(p.id));
      const unranked = players.filter((p) => !rankMap.has(p.id));
      ranked.sort((a, b) => (rankMap.get(a.id) || 0) - (rankMap.get(b.id) || 0));
      unranked.sort((a, b) => b.projectedTotal - a.projectedTotal);
      return [...ranked, ...unranked];
    }
    return [...players];
  };

  const [orderedPlayers, setOrderedPlayers] = useState<PlayerWithStats[]>(buildInitialOrder);
  const [expectedGames, setExpectedGames] = useState<Record<string, number>>(initialExpectedGames);
  const [positionFilter, setPositionFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(userRankings.length > 0 ? 'custom' : 'projection');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Rank map: player_id -> rank in orderedPlayers (user's custom order)
  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    orderedPlayers.forEach((p, i) => map.set(p.id, i + 1));
    return map;
  }, [orderedPlayers]);

  const [hasUnsavedRankings, setHasUnsavedRankings] = useState(false);
  const [hasCustomRankings, setHasCustomRankings] = useState(userRankings.length > 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Snapshot of player order before editing, for cancel
  const preEditOrderRef = useRef<PlayerWithStats[]>(orderedPlayers);
  const preEditSortByRef = useRef<SortBy>(sortBy);

  // Debounce ref for expected games saving
  const gamesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get unique teams for filter dropdown
  const allTeams = [...new Set(players.map((p) => p.team_name))].sort();

  // Filter players
  const filteredPlayers = useMemo(() => {
    const filtered = orderedPlayers.filter((p) => {
      if (positionFilter !== 'All' && p.position !== positionFilter) return false;
      if (teamFilter !== 'All' && p.team_name !== teamFilter) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'custom') return filtered;

    const sorted = [...filtered];
    const dir = sortDir === 'desc' ? -1 : 1;
    sorted.sort((a, b) => {
      if (sortBy === 'projection') {
        return dir * (a.projectedTotal - b.projectedTotal);
      }
      // expectedGames: primary by team games, secondary by projectedTotal desc
      const gamesA = expectedGames[a.team_name] || 1;
      const gamesB = expectedGames[b.team_name] || 1;
      if (gamesA !== gamesB) return dir * (gamesA - gamesB);
      return -(a.projectedTotal - b.projectedTotal); // always desc tiebreaker
    });
    return sorted;
  }, [orderedPlayers, positionFilter, teamFilter, searchTerm, sortBy, sortDir, expectedGames]);

  // Update projected totals when expected games change
  const updateProjectedTotals = useCallback(
    (newExpectedGames: Record<string, number>) => {
      setOrderedPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          projectedTotal: computeProjectedTotal(
            p.averages.ppg,
            newExpectedGames[p.team_name] || 1
          ),
        }))
      );
    },
    []
  );

  // Handle expected games change
  const handleExpectedGamesChange = useCallback(
    (teamName: string, games: number) => {
      const newExpectedGames = { ...expectedGames, [teamName]: games };
      setExpectedGames(newExpectedGames);
      updateProjectedTotals(newExpectedGames);

      // Debounced save
      if (gamesTimeoutRef.current) clearTimeout(gamesTimeoutRef.current);
      gamesTimeoutRef.current = setTimeout(() => {
        const settings = Object.entries(newExpectedGames).map(([team_name, expected_games]) => ({
          team_name,
          expected_games,
        }));
        saveExpectedGames(settings);
      }, 1500);
    },
    [expectedGames, updateProjectedTotals]
  );

  // Handle sort button clicks
  const handleSortChange = useCallback((newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
  }, [sortBy]);

  // Handle reorder from DnD
  const handleReorder = useCallback(
    (newFilteredOrder: PlayerWithStats[]) => {
      setSortBy('custom');
      // If no filter is active, just use the new order directly
      const isFiltered = positionFilter !== 'All' || teamFilter !== 'All' || searchTerm !== '';

      if (!isFiltered) {
        setOrderedPlayers(newFilteredOrder);
      } else {
        // Merge filtered reorder back into master list
        setOrderedPlayers((prev) => {
          const filteredIds = new Set(newFilteredOrder.map((p) => p.id));
          const nonFiltered = prev.filter((p) => !filteredIds.has(p.id));
          // Interleave: maintain relative positions of non-filtered items
          const result: PlayerWithStats[] = [];
          let filteredIdx = 0;
          let nonFilteredIdx = 0;

          for (const p of prev) {
            if (filteredIds.has(p.id)) {
              result.push(newFilteredOrder[filteredIdx++]);
            } else {
              result.push(nonFiltered[nonFilteredIdx++]);
            }
          }
          return result;
        });
      }

      setHasUnsavedRankings(true);
    },
    [positionFilter, teamFilter, searchTerm]
  );

  // Save rankings on user confirmation
  const handleSaveRankings = useCallback(async () => {
    setIsSaving(true);
    const rankings = orderedPlayers.map((p, i) => ({
      player_id: p.id,
      rank_position: i + 1,
    }));
    await savePlayerRankings(rankings);
    setHasUnsavedRankings(false);
    setHasCustomRankings(true);
    setIsEditing(false);
    setIsSaving(false);
  }, [orderedPlayers]);

  // Reset rankings to default projection order
  const handleResetRankings = useCallback(async () => {
    setOrderedPlayers((prev) =>
      [...prev].sort((a, b) => b.projectedTotal - a.projectedTotal)
    );
    setSortBy('projection');
    setHasUnsavedRankings(false);
    setHasCustomRankings(false);
    setIsEditing(false);
    await deletePlayerRankings();
  }, []);

  // Build default expected games map from team seeds
  const defaultExpectedGames = useMemo(() => {
    const teamInfoMap = new Map(teamInfo.map((ti) => [ti.team_name, ti]));
    const defaults: Record<string, number> = {};
    for (const team of allTeams) {
      defaults[team] = getDefaultExpectedGames(teamInfoMap.get(team)?.seed);
    }
    return defaults;
  }, [teamInfo, allTeams]);

  const hasCustomExpectedGames = useMemo(() => {
    return allTeams.some((team) => expectedGames[team] !== defaultExpectedGames[team]);
  }, [expectedGames, defaultExpectedGames, allTeams]);

  // Reset expected games to seed-based defaults
  const handleResetExpectedGames = useCallback(async () => {
    setExpectedGames(defaultExpectedGames);
    updateProjectedTotals(defaultExpectedGames);
    if (gamesTimeoutRef.current) clearTimeout(gamesTimeoutRef.current);
    await deleteExpectedGames();
  }, [defaultExpectedGames, updateProjectedTotals]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (gamesTimeoutRef.current) clearTimeout(gamesTimeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">NCAA Rankings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create your personal March Madness player rankings
          </p>
        </div>

        <Tabs defaultValue="players">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <ExpectedGamesSection
              teams={allTeams}
              teamInfo={teamInfo}
              expectedGames={expectedGames}
              onChange={handleExpectedGamesChange}
            />

            <RankingsFilters
              positionFilter={positionFilter}
              onPositionChange={setPositionFilter}
              teamFilter={teamFilter}
              onTeamChange={setTeamFilter}
              teams={allTeams}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <div className="mt-3 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Sort:</span>
                {(['projection', 'expectedGames'] as const).map((key) => {
                  const label = key === 'projection' ? 'Projection' : 'Expected Games';
                  const isActive = sortBy === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSortChange(key)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="ml-1">{sortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">
                  {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                </span>
                {(hasUnsavedRankings || hasCustomRankings) && (
                  <button
                    onClick={handleResetRankings}
                    className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset to Default
                  </button>
                )}
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setOrderedPlayers(preEditOrderRef.current);
                        setSortBy(preEditSortByRef.current);
                        setHasUnsavedRankings(false);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRankings}
                      disabled={isSaving || !hasUnsavedRankings}
                      className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      preEditOrderRef.current = orderedPlayers;
                      preEditSortByRef.current = sortBy;
                      setIsEditing(true);
                    }}
                    className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit Rankings
                  </button>
                )}
              </div>
            </div>

            <PlayerRankingsList
              players={filteredPlayers}
              onReorder={handleReorder}
              expectedGames={expectedGames}
              rankMap={rankMap}
              isEditing={isEditing}
            />
          </TabsContent>

          <TabsContent value="teams">
            {hasCustomExpectedGames && (
              <div className="mb-3 flex justify-end">
                <button
                  onClick={handleResetExpectedGames}
                  className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            )}
            <TeamsTable
              teams={allTeams}
              teamInfo={teamInfo}
              expectedGames={expectedGames}
              onExpectedGamesChange={handleExpectedGamesChange}
            />
          </TabsContent>
        </Tabs>
    </div>
  );
}
