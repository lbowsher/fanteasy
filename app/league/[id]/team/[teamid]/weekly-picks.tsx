// league/[id]/team/[teamid]/weekly-picks.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Search, Edit2, Check, X } from "lucide-react";
import { debounce } from 'lodash';

type WeeklyPicksProps = {
    team: TeamWithPlayers;
    currentWeek: number;
    numWeeks: number;
};

type LineupSlot = {
    id: string;
    label: string;
    validPositions: string[];
};

type WeeklyPick = {
    id: string;
    player_id: string;
    slot_position: string;
    week_number: number;
    player?: Player;
};

const LINEUP_SLOTS: LineupSlot[] = [
    { id: 'QB', label: 'QB', validPositions: ['QB'] },
    { id: 'RB1', label: 'RB 1', validPositions: ['RB'] },
    { id: 'RB2', label: 'RB 2', validPositions: ['RB'] },
    { id: 'WR1', label: 'WR 1', validPositions: ['WR'] },
    { id: 'WR2', label: 'WR 2', validPositions: ['WR'] },
    { id: 'TE', label: 'TE', validPositions: ['TE'] },
    { id: 'FLEX', label: 'FLEX', validPositions: ['RB', 'WR', 'TE'] },
    { id: 'DST', label: 'D/ST', validPositions: ['D/ST'] },
    { id: 'K', label: 'K', validPositions: ['K'] }
];

// PlayerSearch component for individual slot
function PlayerSearch({ 
    slot, 
    validPositions, 
    onSelect, 
    availablePlayers,
    selectedPlayer 
}: { 
    slot: LineupSlot;
    validPositions: string[];
    onSelect: (player: Player) => void;
    availablePlayers: Player[];
    selectedPlayer: Player | null;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Player[]>([]);

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (!query.trim()) {
                    setSearchResults([]);
                    return;
                }

                const query_lower = query.toLowerCase();
                const results = availablePlayers.filter(
                    player =>
                        validPositions.includes(player.position) &&
                        (player.name.toLowerCase().includes(query_lower) ||
                         player.team_name.toLowerCase().includes(query_lower))
                ).slice(0, 5); // Limit to top 5 results

                setSearchResults(results);
            }, 300),
        [availablePlayers, validPositions]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsSearching(!!query);
        debouncedSearch(query);
    };

    return (
        <div className="relative">
            <div className="flex items-center space-x-2 mb-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={`Search ${slot.label} by name or team...`}
                    className="w-full p-2 bg-background border border-border rounded-lg
                             text-primary-text placeholder:text-secondary-text
                             focus:outline-none focus:border-accent"
                />
                <Search className="text-secondary-text" size={20} />
            </div>

            {/* Selected Player Display */}
            {selectedPlayer && !isSearching && (
                <div className="p-3 bg-accent/10 rounded-lg border border-accent">
                    <span className="text-accent font-semibold">
                        {selectedPlayer.name} - {selectedPlayer.team_name} ({selectedPlayer.position})
                    </span>
                </div>
            )}

            {/* Search Results Dropdown */}
            {isSearching && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg">
                    {searchResults.map(player => (
                        <button
                            key={player.id}
                            onClick={() => {
                                onSelect(player);
                                setSearchQuery('');
                                setIsSearching(false);
                                setSearchResults([]);
                            }}
                            className="w-full p-2 text-left hover:bg-accent/20 
                                     transition-colors text-primary-text"
                        >
                            {player.name} - {player.team_name} ({player.position})
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function WeeklyPicks({ team, currentWeek, numWeeks }: WeeklyPicksProps) {
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<{[key: string]: Player | null}>({});
    const [submittedPicks, setSubmittedPicks] = useState<WeeklyPick[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
    const supabase = createClientComponentClient<Database>();

    // Fetch submitted picks and available players
    useEffect(() => {
        const fetchData = async () => {
            // Get all previous picks for this team with player details
            const { data: picks, error: picksError } = await supabase
                .from('weekly_picks')
                .select(`
                    *,
                    player:players(*)
                `)
                .eq('team_id', team.id);

            if (picksError) {
                setError('Error loading previous picks');
                return;
            }

            setSubmittedPicks(picks || []);

            // Get all NFL players
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select('*')
                .eq('league', 'NFL');

            if (playersError) {
                setError('Error loading players');
                return;
            }

            // Filter out previously picked players for the current week
            const usedPlayerIds = new Set(
                picks
                    ?.filter(p => p.week_number === selectedWeek)
                    ?.map(p => p.player_id)
            );
            const available = players?.filter(p => !usedPlayerIds.has(p.id)) || [];
            setAvailablePlayers(available);
        };

        fetchData();
    }, [team.id, selectedWeek]);

    const handlePlayerSelect = (slotId: string, player: Player) => {
        const slot = LINEUP_SLOTS.find(s => s.id === slotId);
        if (!slot?.validPositions.includes(player.position)) {
            setError(`Invalid position ${player.position} for slot ${slot?.label}`);
            return;
        }
        
        setSelectedPicks(prev => ({
            ...prev,
            [slotId]: player
        }));
    };

    const handleEditWeek = (weekNumber: number) => {
        setEditingWeek(weekNumber);
        setSelectedWeek(weekNumber);
        
        // Pre-populate selected picks with existing picks
        const weekPicks = submittedPicks.filter(p => p.week_number === weekNumber);
        const picksMap: {[key: string]: Player | null} = {};
        weekPicks.forEach(pick => {
            if (pick.player) {
                picksMap[pick.slot_position] = pick.player;
            }
        });
        setSelectedPicks(picksMap);
    };

    const handleCancelEdit = () => {
        setEditingWeek(null);
        setSelectedPicks({});
    };

    const submitPicks = async () => {
        const missingSlots = LINEUP_SLOTS.filter(slot => !selectedPicks[slot.id]);
        if (missingSlots.length > 0) {
            setError(`Missing picks for: ${missingSlots.map(s => s.label).join(', ')}`);
            return;
        }

        // If editing, delete existing picks for the week first
        if (editingWeek !== null) {
            await supabase
                .from('weekly_picks')
                .delete()
                .eq('team_id', team.id)
                .eq('week_number', editingWeek);
        }

        const picksToInsert = LINEUP_SLOTS.map(slot => ({
            team_id: team.id,
            player_id: selectedPicks[slot.id]?.id,
            week_number: editingWeek ?? selectedWeek,
            slot_position: slot.id
        }));

        const { error: insertError } = await supabase
            .from('weekly_picks')
            .insert(picksToInsert);

        if (insertError) {
            console.error('Error submitting picks:', insertError);
            setError('Error submitting picks');
            return;
        }

        // Refresh the page data
        const { data: newPicks } = await supabase
            .from('weekly_picks')
            .select(`
                *,
                player:players(*)
            `)
            .eq('team_id', team.id);

        setSubmittedPicks(newPicks || []);
        setSelectedPicks({});
        setEditingWeek(null);
        setError(null);
    };

    const WeeklyPicksTable = ({ weekNumber }: { weekNumber: number }) => {
        const weekPicks = submittedPicks.filter(p => p.week_number === weekNumber);
        const isEditing = editingWeek === weekNumber;

        return (
            <div className="bg-surface rounded-lg border border-border p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-primary-text">
                        Week {weekNumber} Picks
                    </h3>
                    {!isEditing ? (
                        <button
                            onClick={() => handleEditWeek(weekNumber)}
                            className="flex items-center text-accent hover:opacity-80 transition-opacity"
                        >
                            <Edit2 size={16} className="mr-1" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={submitPicks}
                                className="flex items-center text-green-500 hover:opacity-80 transition-opacity"
                            >
                                <Check size={16} className="mr-1" />
                                Save
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center text-red-500 hover:opacity-80 transition-opacity"
                            >
                                <X size={16} className="mr-1" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        {LINEUP_SLOTS.map(slot => (
                            <div key={slot.id} className="p-4 bg-background rounded-lg border border-border">
                                <h4 className="text-sm font-semibold text-primary-text mb-2">
                                    {slot.label}
                                </h4>
                                <PlayerSearch
                                    slot={slot}
                                    validPositions={slot.validPositions}
                                    onSelect={(player) => handlePlayerSelect(slot.id, player)}
                                    availablePlayers={availablePlayers}
                                    selectedPlayer={selectedPicks[slot.id]}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {LINEUP_SLOTS.map(slot => {
                            const pick = weekPicks.find(p => p.slot_position === slot.id);
                            return (
                                <div key={slot.id} className="py-2 flex justify-between">
                                    <span className="text-secondary-text">{slot.label}</span>
                                    <span className="text-primary-text">
                                        {pick?.player ? (
                                            `${pick.player.name} (${pick.player.team_name})`
                                        ) : (
                                            'Not selected'
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary-text">
                    Weekly Picks
                </h2>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                {Array.from({ length: numWeeks }, (_, i) => i + 1).map(week => (
                    <WeeklyPicksTable key={week} weekNumber={week} />
                ))}
            </div>
        </div>
    );
}