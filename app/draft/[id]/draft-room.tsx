'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import DraftQueue from './draft-queue';
import PlayerSearch from './player-search';
import PicksCarousel from './picks-carousel';
import DraftBoardGrid from './draft-board-grid';
import DraftInfoPanel from './draft-info-panel';
import { makePick, startDraft, togglePause, toggleAutoPick, triggerAutoPick } from './actions';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DraftRoomProps {
    draftSettings: any;
    currentTeam: any;
    isCommissioner: boolean;
    leagueTeams?: any[];
}

export default function DraftRoom({ draftSettings, currentTeam, isCommissioner, leagueTeams = [] }: DraftRoomProps) {
    const supabase = createClient();

    // Draft state
    const [draftState, setDraftState] = useState(draftSettings);
    const [draftPicks, setDraftPicks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentPickTeam, setCurrentPickTeam] = useState<any>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [autoPickEnabled, setAutoPickEnabled] = useState<boolean>(true);
    const [isPaused, setIsPaused] = useState<boolean>(draftSettings.is_paused || false);
    const [pickError, setPickError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Get current pick team information
    useEffect(() => {
        const fetchCurrentPickTeam = async () => {
            if (!draftState.pick_order) return;

            const pickOrder = draftState.pick_order.order || [];
            if (pickOrder.length === 0) return;

            const totalTeams = pickOrder.length;
            const currentIndex = (draftState.current_pick - 1) % totalTeams;
            const isSnake = draftState.draft_type === 'snake';
            const isEvenRound = draftState.current_round % 2 === 0;

            let currentTeamId: string;
            if (isSnake && isEvenRound) {
                currentTeamId = pickOrder[totalTeams - 1 - currentIndex];
            } else {
                currentTeamId = pickOrder[currentIndex];
            }

            try {
                const { data: teamData, error } = await supabase
                    .from('teams')
                    .select('*, profiles(full_name)')
                    .eq('id', currentTeamId)
                    .single();

                if (error) throw error;
                setCurrentPickTeam(teamData);
            } catch (error) {
                console.error('Error fetching current pick team:', error);
            }
        };

        fetchCurrentPickTeam();
    }, [draftState.current_pick, draftState.current_round, draftState.pick_order, draftState.draft_type, supabase]);

    // Load draft picks
    useEffect(() => {
        const fetchDraftPicks = async () => {
            try {
                const { data, error } = await supabase
                    .from('draft_picks')
                    .select('*, team:teams(name, id), player:players(name, position, team_name, pic_url, summary)')
                    .eq('draft_id', draftSettings.id)
                    .order('pick_number', { ascending: true });

                if (error) throw error;
                setDraftPicks(data || []);
            } catch (error) {
                console.error('Error fetching draft picks:', error);
            }
        };

        fetchDraftPicks();
    }, [draftSettings.id, supabase]);

    // Fetch current team's auto-pick preference
    useEffect(() => {
        const fetchAutoPickPreference = async () => {
            if (!currentTeam || currentTeam.id === 'commissioner') return;

            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('auto_pick_preference')
                    .eq('id', currentTeam.id)
                    .single();

                if (error) throw error;

                if (data && typeof data.auto_pick_preference === 'boolean') {
                    setAutoPickEnabled(data.auto_pick_preference);
                }
            } catch (error) {
                console.error('Error fetching auto-pick preference:', error);
            }
        };

        fetchAutoPickPreference();
    }, [currentTeam, supabase]);

    // Load available players
    useEffect(() => {
        const fetchAvailablePlayers = async () => {
            setIsLoading(true);
            try {
                const { data: draftedPlayers, error: draftedError } = await supabase
                    .from('draft_picks')
                    .select('player_id')
                    .eq('draft_id', draftSettings.id);

                if (draftedError) throw draftedError;

                const draftedIds = (draftedPlayers || []).map(pick => pick.player_id);

                let playersQuery = supabase
                    .from('players')
                    .select('*')
                    .eq('league', draftSettings.leagues.league)
                    .order('name');

                // For NCAAM, only show players from the 2026 season
                if (draftSettings.leagues.league === 'NCAAM') {
                    playersQuery = playersQuery.eq('season', '2026');
                }

                if (draftedIds.length > 0) {
                    playersQuery = playersQuery.not('id', 'in', `(${draftedIds.join(',')})`);
                }

                const { data: players, error: playersError } = await playersQuery;

                if (playersError) throw playersError;

                setAvailablePlayers(players || []);
                setSearchResults(players || []);
            } catch (error) {
                console.error('Error fetching available players:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailablePlayers();
    }, [draftSettings.id, draftSettings.leagues.league, draftPicks.length, supabase]);

    // Subscribe to draft changes
    useEffect(() => {
        const fetchLatestDraftPicks = async () => {
            try {
                const { data, error } = await supabase
                    .from('draft_picks')
                    .select('*, team:teams(name, id), player:players(name, position, team_name, pic_url, summary)')
                    .eq('draft_id', draftSettings.id)
                    .order('pick_number', { ascending: true });

                if (error) throw error;
                setDraftPicks(data || []);
            } catch (error) {
                console.error('Error fetching latest draft picks:', error);
            }
        };

        const draftChannel = supabase
            .channel('draft-room')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'draft_settings',
                filter: `id=eq.${draftSettings.id}`
            }, (payload) => {
                setDraftState(payload.new);
                setIsPaused(payload.new.is_paused || false);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'draft_picks',
                filter: `draft_id=eq.${draftSettings.id}`
            }, () => {
                fetchLatestDraftPicks();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(draftChannel);
        };
    }, [draftSettings.id, supabase]);

    // Server Action handlers
    const handleMakePick = (playerId: string) => {
        setPickError(null);
        startTransition(async () => {
            const result = await makePick(draftSettings.id, playerId);
            if (!result.success) {
                setPickError(result.error || 'Failed to make pick');
            } else {
                setSelectedPlayer(null);
                setPickError(null);
            }
        });
    };

    const handleStartDraft = () => {
        startTransition(async () => {
            const result = await startDraft(draftSettings.id);
            if (!result.success) {
                alert(result.error || 'Failed to start draft');
            }
        });
    };

    const handleTogglePause = () => {
        startTransition(async () => {
            const result = await togglePause(draftSettings.id);
            if (!result.success) {
                alert(result.error || 'Failed to toggle pause');
            }
        });
    };

    const handleToggleAutoPick = () => {
        if (!currentTeam || currentTeam.id === 'commissioner') return;

        startTransition(async () => {
            const result = await toggleAutoPick(currentTeam.id);
            if (!result.success) {
                alert(result.error || 'Failed to update auto-pick preference');
            } else {
                setAutoPickEnabled(result.data.autoPickEnabled);
            }
        });
    };

    const handleTimerExpired = async () => {
        if (!isMyTurn || !autoPickEnabled) return;
        if (!currentPickTeam) return;

        const result = await triggerAutoPick(draftSettings.id, currentPickTeam.id);
        if (!result.success) {
            console.error('Client-side auto-pick fallback failed:', result.error);
        }
    };

    const handleSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setSearchResults(availablePlayers);
            return;
        }

        const filtered = availablePlayers.filter(player =>
            player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.team_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults(filtered);
    };

    const isDraftActive = draftState.draft_status === 'in_progress';
    const isDraftCompleted = draftState.draft_status === 'completed';
    const isMyTurn = currentPickTeam?.id === currentTeam.id && isDraftActive;

    const draftOrder = draftState.pick_order?.order || [];
    const totalRounds = draftState.pick_order?.total_rounds || 15;

    return (
        <div className="space-y-4">
            {/* Picks Carousel - always visible */}
            <Card>
                <CardContent className="p-3">
                    <PicksCarousel
                        leagueTeams={leagueTeams}
                        draftOrder={draftOrder}
                        currentPickTeamId={currentPickTeam?.id || null}
                        draftPicks={draftPicks}
                        leagueType={draftSettings.leagues.league}
                        currentRound={draftState.current_round}
                        currentPick={draftState.current_pick}
                        totalRounds={totalRounds}
                        draftType={draftState.draft_type}
                    />
                </CardContent>
            </Card>

            {/* Status Bar */}
            <Card>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-foreground">
                                {isDraftCompleted ? 'Draft Complete' : isDraftActive ? 'Draft In Progress' : 'Draft Scheduled'}
                            </h2>
                            {isDraftActive && (
                                <span className="text-sm text-muted-foreground">
                                    Round {draftState.current_round}, Pick {draftState.current_pick}
                                    {isPaused && <span className="ml-2 text-yellow-500 font-medium">(Paused)</span>}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {currentPickTeam && isDraftActive && (
                                <span className="text-sm font-medium text-foreground">
                                    {currentPickTeam.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isDraftActive && !isDraftCompleted && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            <p>
                                The draft is scheduled to begin{' '}
                                {draftState.draft_date
                                    ? `on ${new Date(draftState.draft_date).toLocaleString()}`
                                    : 'soon'}.
                                You can add players to your draft queue while you wait.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="players">
                <TabsList>
                    <TabsTrigger value="players">Players</TabsTrigger>
                    <TabsTrigger value="board">Draft Board</TabsTrigger>
                </TabsList>

                {/* Players Tab - 3 column layout */}
                <TabsContent value="players">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Player Search - main area */}
                        <div className="lg:col-span-5">
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Available Players</h3>
                                    <PlayerSearch
                                        availablePlayers={availablePlayers}
                                        searchResults={searchResults}
                                        isLoading={isLoading}
                                        onSearch={handleSearch}
                                        onSelectPlayer={(player) => {
                                            if (player && typeof player === 'object') {
                                                setSelectedPlayer({ ...player, id: String(player.id) });
                                            }
                                        }}
                                        onAddToQueue={async (player) => {
                                            try {
                                                const { data: currentQueue, error: queueError } = await supabase
                                                    .from('draft_queue')
                                                    .select('id, player_id, priority')
                                                    .eq('team_id', currentTeam.id)
                                                    .order('priority', { ascending: true });

                                                if (queueError) throw queueError;

                                                if (currentQueue?.some(item => item.player_id === player.id)) {
                                                    alert('This player is already in your queue.');
                                                    return;
                                                }

                                                const nextPriority = currentQueue?.length
                                                    ? Math.max(...currentQueue.map(item => item.priority)) + 1
                                                    : 1;

                                                const { error } = await supabase
                                                    .from('draft_queue')
                                                    .insert({
                                                        team_id: currentTeam.id,
                                                        player_id: player.id,
                                                        priority: nextPriority
                                                    });

                                                if (error) throw error;

                                                alert('Player added to your queue!');
                                            } catch (error: any) {
                                                console.error('Error adding player to queue:', error);
                                                alert(`Failed to add player to queue: ${error?.message || 'Unknown error'}`);
                                            }
                                        }}
                                        isMyTurn={isMyTurn}
                                        isCommissioner={isCommissioner}
                                        isDraftActive={isDraftActive}
                                        selectedPlayer={selectedPlayer}
                                        leagueType={draftSettings.leagues.league}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Draft Queue */}
                        <div className="lg:col-span-4">
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Draft Queue</h3>
                                    <DraftQueue teamId={currentTeam.id} draftId={draftSettings.id} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Draft Info Panel */}
                        <div className="lg:col-span-3">
                            <DraftInfoPanel
                                currentPickTeam={currentPickTeam}
                                currentTeam={currentTeam}
                                draftState={draftState}
                                isMyTurn={isMyTurn}
                                isCommissioner={isCommissioner}
                                isDraftActive={isDraftActive}
                                isDraftCompleted={isDraftCompleted}
                                isPaused={isPaused}
                                isPending={isPending}
                                autoPickEnabled={autoPickEnabled}
                                selectedPlayer={selectedPlayer}
                                pickError={pickError}
                                draftPicks={draftPicks}
                                leagueType={draftSettings.leagues.league}
                                onStartDraft={handleStartDraft}
                                onTogglePause={handleTogglePause}
                                onToggleAutoPick={handleToggleAutoPick}
                                onMakePick={handleMakePick}
                                onCancelSelection={() => setSelectedPlayer(null)}
                                onTimerExpired={handleTimerExpired}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Draft Board Tab - full width grid */}
                <TabsContent value="board">
                    <Card>
                        <CardContent className="p-4">
                            <DraftBoardGrid
                                leagueTeams={leagueTeams}
                                draftOrder={draftOrder}
                                draftPicks={draftPicks}
                                totalRounds={totalRounds}
                                draftType={draftState.draft_type}
                                currentPickTeamId={currentPickTeam?.id || null}
                                currentRound={draftState.current_round}
                                currentPick={draftState.current_pick}
                                leagueType={draftSettings.leagues.league}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
