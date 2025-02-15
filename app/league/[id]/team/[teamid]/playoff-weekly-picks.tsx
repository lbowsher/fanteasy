// league/[id]/team/[teamid]/playoff-weekly-picks.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from "../../../../utils/supabase/client";
import { Edit2, Check, X, Search } from "lucide-react";
import { calculateNFLPoints } from '../../../../utils/scoring';
import { debounce, groupBy } from 'lodash';
import Image from 'next/image';

type WeeklyPicksProps = {
    teamData: TeamData;
    currentWeek: number;
    numWeeks: number;
    isAuthorized: boolean;
};

const LINEUP_SLOTS = [
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

function PlayerSearch({ 
    slot, 
    validPositions, 
    onSelect, 
    availablePlayers,
    selectedPlayer 
}: { 
    slot: typeof LINEUP_SLOTS[0];
    validPositions: string[];
    onSelect: (player: Player) => void;
    availablePlayers: Player[];
    selectedPlayer: Player | null;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Player[]>([]);

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
                ).slice(0, 5);

                setSearchResults(results);
            }, 300),
        [availablePlayers, validPositions]
    );

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

            {selectedPlayer && !isSearching && (
                <div className="p-3 bg-accent/10 rounded-lg border border-accent">
                    <div className="flex items-center space-x-3">
                        <Image 
                            src={selectedPlayer.pic_url || '../../../../../public/default-player.png'}
                            alt={selectedPlayer.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                        <span className="text-accent font-semibold">
                            {selectedPlayer.name} - {selectedPlayer.team_name} ({selectedPlayer.position})
                        </span>
                    </div>
                </div>
            )}

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
                                     transition-colors text-primary-text flex items-center space-x-3"
                        >
                            <Image 
                                src={player.pic_url || '../../../../../public/default-player.png'}
                                alt={player.name}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                            />
                            <span>
                                {player.name} - {player.team_name} ({player.position})
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PlayoffWeeklyPicks({ teamData, currentWeek, numWeeks, isAuthorized }: WeeklyPicksProps) {
    const [selectedWeek, setSelectedWeek] = useState(currentWeek);
    const [weeklyStats, setWeeklyStats] = useState<{[key: string]: GameStats[]}>({});
    const [weeklyScores, setWeeklyScores] = useState<{[key: number]: number}>({});
    const [totalScore, setTotalScore] = useState(0);
    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<{[key: string]: Player | null}>({});
    const supabase = createClient();

    useEffect(() => {
        const fetchPlayers = async () => {
            const { data: players } = await supabase
                .from('players')
                .select('*')
                .eq('league', 'NFL');
            
            if (players) {
                setAvailablePlayers(players);
            }
        };

        fetchPlayers();
    }, [supabase]);

    useEffect(() => {
        const fetchWeeklyData = async () => {
            const playerIds = teamData.weeklyPicks.map(pick => pick.player_id);
            
            const { data: stats } = await supabase
                .from('game_stats')
                .select('*')
                .in('player_id', playerIds);

            if (stats) {
                const statsByWeek = groupBy(stats, 'week_number');
                const statsMap: {[key: string]: GameStats[]} = {};
                
                Object.entries(statsByWeek).forEach(([week, weekStats]) => {
                    weekStats.forEach(stat => {
                        statsMap[`${week}-${stat.player_id}`] = statsMap[`${week}-${stat.player_id}`] 
                            ? [...statsMap[`${week}-${stat.player_id}`], stat]
                            : [stat];
                    });
                });
                
                setWeeklyStats(statsMap);

                const scores: {[key: number]: number} = {};
                for (let week = 1; week <= numWeeks; week++) {
                    const weekPicks = teamData.weeklyPicks.filter(pick => pick.week_number === week);
                    let weekScore = 0;
                    
                    weekPicks.forEach(pick => {
                        const playerStats = statsMap[`${week}-${pick.player_id}`];
                        if (playerStats && teamData.team.leagues) {
                            weekScore += calculateNFLPoints(playerStats, teamData.team.leagues.scoring_rules.rules);
                        }
                    });                    
                    scores[week] = weekScore;
                }
                
                setWeeklyScores(scores);
                setTotalScore(Object.values(scores).reduce((sum, score) => sum + score, 0));
            }
        };

        fetchWeeklyData();
    }, [teamData, numWeeks, supabase]);

    const handleEditWeek = (week: number) => {
        setEditingWeek(week);
        
        // Pre-populate selected picks
        const weekPicks = teamData.weeklyPicks.filter(p => p.week_number === week);
        const picksMap: {[key: string]: Player | null} = {};
        weekPicks.forEach(pick => {
            if (pick.player) {
                picksMap[pick.slot_position] = pick.player;
            }
        });
        setSelectedPicks(picksMap);
    };

    const handlePlayerSelect = (slotId: string, player: Player) => {
        const slot = LINEUP_SLOTS.find(s => s.id === slotId);
        if (!slot?.validPositions.includes(player.position)) {
            return;
        }
        
        setSelectedPicks(prev => ({
            ...prev,
            [slotId]: player
        }));
    };

    const submitPicks = async () => {
        // Delete existing picks for the week
        if (editingWeek !== null) {
            await supabase
                .from('weekly_picks')
                .delete()
                .eq('team_id', teamData.team.id)
                .eq('week_number', editingWeek);
        }

        // Insert new picks
        const picksToInsert = LINEUP_SLOTS.map(slot => ({
            team_id: teamData.team.id,
            player_id: selectedPicks[slot.id]?.id ?? '',
            week_number: editingWeek as number, // we know it's not null here
            slot_position: slot.id
        })).filter(pick => pick.player_id !== ''); // remove empty picks

        await supabase
            .from('weekly_picks')
            .insert(picksToInsert);

        // Refresh page data
        window.location.reload();
    };

    const getPlayerStatline = (stats: GameStats[] | undefined) => {
        if (!stats || stats.length === 0) return 'No stats available';
        
        const combinedStats = stats.reduce((acc, stat) => ({
            passing_yards: (acc.passing_yards || 0) + (stat.passing_yards || 0),
            passing_tds: (acc.passing_tds || 0) + (stat.passing_tds || 0),
            interceptions: (acc.interceptions || 0) + (stat.interceptions || 0),
            rushing_yards: (acc.rushing_yards || 0) + (stat.rushing_yards || 0),
            rushing_tds: (acc.rushing_tds || 0) + (stat.rushing_tds || 0),
            receiving_yards: (acc.receiving_yards || 0) + (stat.receiving_yards || 0),
            receiving_tds: (acc.receiving_tds || 0) + (stat.receiving_tds || 0),
            receptions: (acc.receptions || 0) + (stat.receptions || 0)
        }), {} as GameStats);
        
        const statlines = [];
        if (combinedStats.passing_yards) {
            statlines.push(`${combinedStats.passing_yards} Pass YDS, ${combinedStats.passing_tds || 0} TD, ${combinedStats.interceptions || 0} INT`);
        }
        if (combinedStats.rushing_yards) {
            statlines.push(`${combinedStats.rushing_yards} Rush YDS, ${combinedStats.rushing_tds || 0} TD`);
        }
        if (combinedStats.receiving_yards) {
            statlines.push(`${combinedStats.receptions || 0} REC, ${combinedStats.receiving_yards} REC YDS, ${combinedStats.receiving_tds || 0} TD`);
        }
        return statlines.join(' | ') || 'No stats available';
    };

    return (
        (<div className="w-full bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary-text">Weekly Picks</h2>
                <div className="mt-4 text-xl font-semibold text-accent">
                    Total Season Score: {totalScore.toFixed(1)}
                </div>
            </div>
            <div className="p-6">
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    {Array.from({ length: numWeeks }, (_, i) => i + 1).map(week => (
                        <button
                            key={week}
                            onClick={() => setSelectedWeek(week)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors
                                ${selectedWeek === week 
                                    ? 'bg-accent text-white' 
                                    : 'bg-surface text-secondary-text hover:bg-accent/20'}`}
                        >
                            Week {week}
                        </button>
                    ))}
                </div>

                <div className="bg-surface rounded-lg border border-border">
                    <div className="p-4 border-b border-border bg-background">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-primary-text">
                                Week {selectedWeek} Details
                            </h3>
                            <div className="flex space-x-4 items-center">
                                <span className="text-accent font-semibold">
                                    Week Score: {weeklyScores[selectedWeek]?.toFixed(1) || 0}
                                </span>
                                {isAuthorized && (  // Only show edit button if authorized
                                    (editingWeek === selectedWeek ? (<div className="flex space-x-2">
                                        <button
                                            onClick={submitPicks}
                                            className="flex items-center text-green-500 hover:opacity-80"
                                        >
                                            <Check size={16} className="mr-1" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingWeek(null);
                                                setSelectedPicks({});
                                            }}
                                            className="flex items-center text-red-500 hover:opacity-80"
                                        >
                                            <X size={16} className="mr-1" />
                                            Cancel
                                        </button>
                                    </div>) : (<button
                                        onClick={() => handleEditWeek(selectedWeek)}
                                        className="flex items-center text-accent hover:opacity-80"
                                    >
                                        <Edit2 size={16} className="mr-1" />Edit
                                                                                </button>))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {LINEUP_SLOTS.map(slot => {
                            const pick = teamData.weeklyPicks.find(
                                p => p.week_number === selectedWeek && p.slot_position === slot.id
                            );
                            const stats = pick ? weeklyStats[`${selectedWeek}-${pick.player_id}`] : undefined;
                            const playerScore = stats && teamData.team.leagues 
                                ? calculateNFLPoints(stats, teamData.team.leagues.scoring_rules.rules)
                                : 0;

                            return (
                                <div key={slot.id} className="p-4">
                                    {editingWeek === selectedWeek ? (
                                        <div>
                                            <h4 className="font-medium text-primary-text mb-2">{slot.label}</h4>
                                            <PlayerSearch
                                                slot={slot}
                                                validPositions={slot.validPositions}
                                                onSelect={(player) => handlePlayerSelect(slot.id, player)}
                                                availablePlayers={availablePlayers}
                                                selectedPlayer={selectedPicks[slot.id]}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-primary-text">{slot.label}</span>
                                                <span className="text-accent font-medium">
                                                    {playerScore.toFixed(1)} pts
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                {pick?.player && (
                                                    <Image 
                                                        src={pick.player.pic_url || '../../../../../public/default-player.png'} 
                                                        alt={pick.player.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-secondary-text">
                                                        {pick?.player 
                                                            ? `${pick.player.name} (${pick.player.team_name})`
                                                            : 'Not selected'}
                                                    </div>
                                                    <div className="text-sm text-secondary-text">
                                                        {getPlayerStatline(stats)}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>)
    );
}