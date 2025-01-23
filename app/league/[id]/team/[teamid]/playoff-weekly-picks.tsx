// league/[id]/team/[teamid]/playoff-weekly-picks.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Edit2, Check, X } from "lucide-react";
import { calculateNFLPoints } from '../../../../utils/scoring';
import _ from 'lodash';

type WeeklyPicksProps = {
    teamData: TeamData;
    currentWeek: number;
    numWeeks: number;
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

export default function PlayoffWeeklyPicks({ teamData, currentWeek, numWeeks }: WeeklyPicksProps) {
    const [selectedWeek, setSelectedWeek] = useState(currentWeek);
    const [weeklyStats, setWeeklyStats] = useState<{[key: string]: GameStats}>({});
    const [weeklyScores, setWeeklyScores] = useState<{[key: number]: number}>({});
    const [totalScore, setTotalScore] = useState(0);
    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        const fetchWeeklyData = async () => {
            // Get all player IDs from weekly picks
            const playerIds = teamData.weeklyPicks.map(pick => pick.player_id);
            
            // Fetch game stats for all players
            const { data: stats } = await supabase
                .from('game_stats')
                .select('*')
                .in('player_id', playerIds);

            if (stats) {
                // Group stats by week and player
                const statsByWeek = _.groupBy(stats, 'week_number');
                const statsMap: {[key: string]: GameStats} = {};
                
                Object.entries(statsByWeek).forEach(([week, weekStats]) => {
                    weekStats.forEach(stat => {
                        statsMap[`${week}-${stat.player_id}`] = stat;
                    });
                });
                
                setWeeklyStats(statsMap);

                // Calculate weekly scores
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
    }, [teamData, numWeeks]);

    const getPlayerStatline = (stats: GameStats | undefined) => {
        if (!stats) return 'No stats available';
        
        const statlines = [];
        if (stats.passing_yards) {
            statlines.push(`${stats.passing_yards} Pass YDS, ${stats.passing_tds || 0} TD, ${stats.interceptions || 0} INT`);
        }
        if (stats.rushing_yards) {
            statlines.push(`${stats.rushing_yards} Rush YDS, ${stats.rushing_tds || 0} TD`);
        }
        if (stats.receiving_yards) {
            statlines.push(`${stats.receptions || 0} REC, ${stats.receiving_yards} REC YDS, ${stats.receiving_tds || 0} TD`);
        }
        return statlines.join(' | ') || 'No stats available';
    };

    return (
        <div className="w-full bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary-text">Weekly Picks</h2>
                <div className="mt-4 text-xl font-semibold text-accent">
                    Total Season Score: {totalScore.toFixed(1)}
                </div>
            </div>

            <div className="p-6">
                {/* Week Selection Tabs */}
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

                {/* Weekly Stats Table */}
                <div className="bg-surface rounded-lg border border-border">
                    <div className="p-4 border-b border-border bg-background">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-primary-text">
                                Week {selectedWeek} Details
                            </h3>
                            <span className="text-accent font-semibold">
                                Week Score: {weeklyScores[selectedWeek]?.toFixed(1) || 0}
                            </span>
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
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-primary-text">{slot.label}</span>
                                        <span className="text-accent font-medium">
                                            {playerScore.toFixed(1)} pts
                                        </span>
                                    </div>
                                    <div className="text-secondary-text mb-1">
                                        {pick?.player 
                                            ? `${pick.player.name} (${pick.player.team_name})`
                                            : 'Not selected'}
                                    </div>
                                    <div className="text-sm text-secondary-text">
                                        {getPlayerStatline(stats)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}