'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';
import DraftQueue from './draft-queue';
import DraftHistory from './draft-history';
import PlayerSearch from './player-search';
import DraftTimer from './draft-timer';
import TeamPicker from './team-picker';

interface DraftRoomProps {
    draftSettings: any; // Using any here because we're mixing DB types with joins
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
    
    // Get current pick team information
    useEffect(() => {
        const fetchCurrentPickTeam = async () => {
            if (!draftState.pick_order) return;
            
            const pickOrder = draftState.pick_order.order || [];
            if (pickOrder.length === 0) return;
            
            const currentPickIndex = (draftState.current_pick - 1) % pickOrder.length;
            const currentTeamId = pickOrder[currentPickIndex];
            
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
    }, [draftState.current_pick, draftState.pick_order, supabase]);
    
    // Load draft picks
    useEffect(() => {
        const fetchDraftPicks = async () => {
            try {
                const { data, error } = await supabase
                    .from('draft_picks')
                    .select('*, team:teams(name, id), player:players(name, position, team_name, pic_url)')
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
                
                // Set the auto-pick preference from the database
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
                // Get already drafted players
                const { data: draftedPlayers, error: draftedError } = await supabase
                    .from('draft_picks')
                    .select('player_id')
                    .eq('draft_id', draftSettings.id);
                
                if (draftedError) throw draftedError;
                
                // Get available players excluding drafted ones
                const draftedIds = (draftedPlayers || []).map(pick => pick.player_id);
                
                let playersQuery = supabase
                    .from('players')
                    .select('*')
                    .eq('league', draftSettings.leagues.league)
                    .order('name');
                    
                // Only add the 'not in' filter if there are drafted players
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
        // Function to fetch latest draft picks
        const fetchLatestDraftPicks = async () => {
            try {
                const { data, error } = await supabase
                    .from('draft_picks')
                    .select('*, team:teams(name, id), player:players(name, position, team_name, pic_url)')
                    .eq('draft_id', draftSettings.id)
                    .order('pick_number', { ascending: true });
                
                if (error) throw error;
                setDraftPicks(data || []);
            } catch (error) {
                console.error('Error fetching latest draft picks:', error);
            }
        };

        // Subscribe to draft settings changes
        const draftChannel = supabase
            .channel('draft-room')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'draft_settings',
                filter: `id=eq.${draftSettings.id}`
            }, (payload) => {
                setDraftState(payload.new);
                // Also update the isPaused state when draft settings change
                setIsPaused(payload.new.is_paused || false);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'draft_picks',
                filter: `draft_id=eq.${draftSettings.id}`
            }, () => {
                // Refresh draft picks when a new pick is made
                fetchLatestDraftPicks();
            })
            .subscribe();
            
        return () => {
            supabase.removeChannel(draftChannel);
        };
    }, [draftSettings.id, supabase]);
    
    // Function to make a draft pick
    const makeDraftPick = async (playerId: string) => {
        if (!currentPickTeam) return;
        
        const isMyTurn = currentPickTeam.id === currentTeam.id;
        const canMakePick = isMyTurn || (isCommissioner && draftState.draft_status === 'in_progress');
        
        if (!canMakePick) {
            alert("It's not your turn to draft.");
            return;
        }
        
        try {
            const { error } = await supabase
                .from('draft_picks')
                .insert({
                    draft_id: draftSettings.id,
                    team_id: currentPickTeam.id,
                    player_id: playerId,
                    pick_number: draftState.current_pick,
                    round_number: draftState.current_round,
                    is_auto_pick: false
                });
                
            if (error) throw error;
            
            // Clear selected player
            setSelectedPlayer(null);
        } catch (error) {
            console.error('Error making draft pick:', error);
            alert('Failed to make draft pick. Please try again.');
        }
    };
    
    // Function to toggle auto-pick preference
    const toggleAutoPick = async () => {
        if (!currentTeam || currentTeam.id === 'commissioner') return;
        
        const newValue = !autoPickEnabled;
        
        try {
            const { error } = await supabase
                .from('teams')
                .update({ auto_pick_preference: newValue })
                .eq('id', currentTeam.id);
                
            if (error) throw error;
            
            // Update local state after successful DB update
            setAutoPickEnabled(newValue);
            
            // Show confirmation to user
            alert(`Auto-pick has been ${newValue ? 'enabled' : 'disabled'}.`);
        } catch (error) {
            console.error('Error updating auto-pick preference:', error);
            alert('Failed to update auto-pick preference. Please try again.');
        }
    };
    
    // Function to start the draft (commissioner only)
    const startDraft = async () => {
        if (!isCommissioner) return;
        
        try {
            const { error } = await supabase
                .from('draft_settings')
                .update({
                    draft_status: 'in_progress',
                    updated_at: new Date().toISOString()
                })
                .eq('id', draftSettings.id);
                
            if (error) throw error;
        } catch (error) {
            console.error('Error starting draft:', error);
            alert('Failed to start draft. Please try again.');
        }
    };
    
    // Function to toggle draft pause state (commissioner only)
    const toggleDraftPause = async () => {
        if (!isCommissioner) return;
        
        try {
            const newPausedState = !isPaused;
            
            const { error } = await supabase
                .from('draft_settings')
                .update({
                    is_paused: newPausedState,
                    updated_at: new Date().toISOString()
                })
                .eq('id', draftSettings.id);
                
            if (error) throw error;
            
            // Update local state immediately for better UX
            setIsPaused(newPausedState);
        } catch (error) {
            console.error('Error toggling draft pause state:', error);
            alert(`Failed to ${isPaused ? 'resume' : 'pause'} draft. Please try again.`);
        }
    };

    // Handle searching for players
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

    // Determine if the draft is active
    const isDraftActive = draftState.draft_status === 'in_progress';
    const isDraftCompleted = draftState.draft_status === 'completed';
    const isMyTurn = currentPickTeam?.id === currentTeam.id && isDraftActive;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Draft Queue & History */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface rounded-xl p-4 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-primary-text">Your Draft Queue</h2>
                    <DraftQueue teamId={currentTeam.id} draftId={draftSettings.id} />
                </div>
                
                <div className="bg-surface rounded-xl p-4 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-primary-text">Draft History</h2>
                    <DraftHistory draftPicks={draftPicks} />
                </div>
            </div>
            
            {/* Middle column - Draft Board */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface rounded-xl p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-primary-text">
                            {isDraftCompleted ? 'Draft Complete' : isDraftActive ? 'Draft In Progress' : 'Draft Scheduled'}
                            {isDraftActive && isPaused && (
                                <span className="ml-2 text-yellow-500 text-sm font-normal">(Paused)</span>
                            )}
                        </h2>
                        
                        <div className="flex space-x-2">
                            {isCommissioner && !isDraftActive && !isDraftCompleted && (
                                <button
                                    onClick={startDraft}
                                    className="px-4 py-2 bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    Start Draft
                                </button>
                            )}
                            
                            {isCommissioner && isDraftActive && !isDraftCompleted && (
                                <button
                                    onClick={toggleDraftPause}
                                    className={`px-4 py-2 ${isPaused ? 'bg-green-600' : 'bg-yellow-600'} text-snow rounded-lg hover:opacity-80 transition-opacity`}
                                >
                                    {isPaused ? 'Resume Draft' : 'Pause Draft'}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {isDraftActive && (
                        <div className="mb-6 p-4 bg-gluon-grey rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div>
                                    <p className="text-secondary-text mb-1">Current Pick:</p>
                                    <p className="text-lg font-bold">
                                        Round {draftState.current_round}, Pick {draftState.current_pick}
                                    </p>
                                    <p className="text-md">
                                        Team: {currentPickTeam?.name || 'Loading...'}
                                        {currentPickTeam?.profiles?.full_name && ` (${currentPickTeam.profiles.full_name})`}
                                    </p>
                                </div>
                                
                                <div className="mt-4 sm:mt-0">
                                    <div className="flex flex-col items-end">
                                        <DraftTimer 
                                            timePerPick={draftState.time_per_pick} 
                                            isMyTurn={isMyTurn}
                                            isPaused={isPaused}
                                            onTimerExpired={async () => {
                                                if (isMyTurn && autoPickEnabled) {
                                                    // Call our auto-pick API
                                                    try {
                                                        const response = await fetch('/api/draft/auto-pick', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                draftId: draftSettings.id,
                                                                teamId: currentTeam.id
                                                            })
                                                        });
                                                        
                                                        if (!response.ok) {
                                                            console.error('Auto-pick failed', await response.json());
                                                        }
                                                    } catch (error) {
                                                        console.error('Error triggering auto-pick:', error);
                                                    }
                                                }
                                            }}
                                        />
                                        
                                        {isMyTurn && (
                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="auto-pick"
                                                    checked={autoPickEnabled}
                                                    onChange={toggleAutoPick}
                                                    className="h-4 w-4 text-liquid-lava rounded focus:ring-liquid-lava mr-2"
                                                />
                                                <label htmlFor="auto-pick" className="text-xs text-secondary-text">
                                                    Auto-pick if time expires
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {isMyTurn && (
                                <div className="mt-4 pt-4 border-t border-slate-grey">
                                    <p className="text-primary-text font-bold text-lg mb-2">It&apos;s Your Turn to Draft!</p>
                                    
                                    {selectedPlayer ? (
                                        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-surface rounded-lg">
                                            <div className="flex items-center mb-3 sm:mb-0">
                                                <Image 
                                                    src={selectedPlayer.pic_url || '/default-player.png'} 
                                                    alt={selectedPlayer.name}
                                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                                    width={48}
                                                    height={48}
                                                />
                                                <div>
                                                    <p className="font-bold">{selectedPlayer.name}</p>
                                                    <p className="text-sm text-secondary-text">
                                                        {selectedPlayer.position} - {selectedPlayer.team_name}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => setSelectedPlayer(null)}
                                                    className="px-3 py-1 bg-slate-grey text-primary-text rounded"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => makeDraftPick(selectedPlayer.id)}
                                                    className="px-3 py-1 bg-liquid-lava text-snow rounded"
                                                >
                                                    Confirm Pick
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-secondary-text">
                                            Select a player to draft from the player list or your queue
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!isDraftActive && !isDraftCompleted && (
                        <div className="mb-6 p-4 bg-gluon-grey rounded-lg">
                            <p className="text-lg">
                                The draft is scheduled to begin{' '}
                                {draftState.draft_date 
                                    ? `on ${new Date(draftState.draft_date).toLocaleString()}` 
                                    : 'soon'}
                            </p>
                            <p className="text-secondary-text mt-2">
                                You can add players to your draft queue while you wait.
                            </p>
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Teams</h3>
                        <TeamPicker 
                            teams={leagueTeams}
                            draftOrder={draftState.pick_order?.order || []}
                            currentPick={draftState.current_pick}
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Available Players</h3>
                        <PlayerSearch 
                            availablePlayers={availablePlayers}
                            searchResults={searchResults}
                            isLoading={isLoading}
                            onSearch={handleSearch}
                            onSelectPlayer={setSelectedPlayer}
                            isMyTurn={isMyTurn}
                            selectedPlayer={selectedPlayer}
                            leagueType={draftSettings.leagues.league}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}