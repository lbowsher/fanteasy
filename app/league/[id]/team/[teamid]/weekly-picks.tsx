"use client";
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type WeeklyPicksProps = {
    team: TeamWithPlayers;
    currentWeek: number;
};

type LineupSlot = {
    id: string;
    label: string;
    validPositions: string[];
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

export default function WeeklyPicks({ team, currentWeek }: WeeklyPicksProps) {
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<{[key: string]: Player | null}>({});
    const [previousPicks, setPreviousPicks] = useState<{[key: string]: Player[]}>({});
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        const fetchData = async () => {
            // Get all previous picks for this team
            const { data: picks, error: picksError } = await supabase
                .from('weekly_picks')
                .select('player_id, week_number, slot_position')
                .eq('team_id', team.id);

            if (picksError) {
                setError('Error loading previous picks');
                return;
            }

            // Organize previous picks by week
            const picksByWeek: {[key: string]: Player[]} = {};
            picks?.forEach(pick => {
                if (!picksByWeek[pick.week_number]) {
                    picksByWeek[pick.week_number] = [];
                }
                picksByWeek[pick.week_number].push(pick.player_id);
            });
            setPreviousPicks(picksByWeek);

            // Get all NFL players
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select('*')
                .eq('league', 'NFL');

            if (playersError) {
                setError('Error loading players');
                return;
            }

            // Filter out previously picked players
            const usedPlayerIds = new Set(picks?.map(p => p.player_id));
            const available = players?.filter(p => !usedPlayerIds.has(p.id)) || [];
            setAvailablePlayers(available);
        };

        fetchData();
    }, [team.id]);

    const handlePlayerSelect = async (slotId: string, player: Player) => {
        // Validate position for slot
        const slot = LINEUP_SLOTS.find(s => s.id === slotId);
        if (!slot?.validPositions.includes(player.position)) {
            setError(`Invalid position ${player.position} for slot ${slot?.label}`);
            return;
        }

        // Update selected picks
        setSelectedPicks(prev => ({
            ...prev,
            [slotId]: player
        }));
    };

    const submitPicks = async () => {
        // Verify all positions are filled
        const missingSlots = LINEUP_SLOTS.filter(slot => !selectedPicks[slot.id]);
        if (missingSlots.length > 0) {
            setError(`Missing picks for: ${missingSlots.map(s => s.label).join(', ')}`);
            return;
        }

        // Submit picks to database
        const picksToInsert = LINEUP_SLOTS.map(slot => ({
            team_id: team.id,
            player_id: selectedPicks[slot.id]?.id,
            week_number: currentWeek,
            slot_position: slot.id
        }));

        const { error: insertError } = await supabase
            .from('weekly_picks')
            .insert(picksToInsert);

        if (insertError) {
            setError('Error submitting picks');
            return;
        }

        // Reset form and refresh data
        setSelectedPicks({});
        setError(null);
    };

    const getAvailablePlayersForSlot = (slot: LineupSlot) => {
        return availablePlayers.filter(player => 
            slot.validPositions.includes(player.position) &&
            // For FLEX, ensure player isn't already picked in their primary position
            !(slot.id === 'FLEX' && 
              Object.entries(selectedPicks).some(([slotId, pick]) => 
                pick?.id === player.id && slotId !== 'FLEX'
              ))
        );
    };

    return (
        <div className="w-full bg-surface rounded-lg border border-border">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary-text">
                    Week {currentWeek} Picks
                </h2>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                {/* Lineup Slots */}
                <div className="space-y-6">
                    {LINEUP_SLOTS.map(slot => (
                        <div key={slot.id} className="p-4 bg-background rounded-lg border border-border">
                            <h3 className="text-lg font-semibold text-primary-text mb-3">
                                {slot.label}
                                {selectedPicks[slot.id] && (
                                    <span className="text-accent ml-2">
                                        - {selectedPicks[slot.id]?.name}
                                    </span>
                                )}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {getAvailablePlayersForSlot(slot).map(player => (
                                    <button
                                        key={player.id}
                                        onClick={() => handlePlayerSelect(slot.id, player)}
                                        className={`p-3 rounded-lg text-sm transition-colors
                                            ${selectedPicks[slot.id]?.id === player.id
                                                ? 'bg-accent text-snow'
                                                : 'bg-background text-primary-text hover:bg-accent/20'
                                            } border border-border`}
                                    >
                                        {player.name} - {player.team_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={submitPicks}
                    className="w-full mt-6 p-4 bg-accent text-snow rounded-lg font-semibold
                             hover:bg-accent/80 transition-colors"
                >
                    Submit Week {currentWeek} Picks
                </button>
            </div>
        </div>
    );
}