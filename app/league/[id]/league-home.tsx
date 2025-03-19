//TODO: add team image in

// league/[id]/league-home.tsx
'use client';
import Link from 'next/link';
import { calculateNFLPoints } from '../../utils/scoring';
import { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { createClient } from "../../utils/supabase/client";
import DraftStatusPanel from './draft-status-panel';

interface LeagueHomeProps {
    teams: TeamWithOwner[];
    league_id: LeagueID;
    league: League;
    isCommissioner: boolean;
}

export default function LeagueHome({ teams, league_id, league, isCommissioner }: LeagueHomeProps) {
    const [sortedTeams, setSortedTeams] = useState<TeamWithOwner[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<{[key: string]: GameStats[]}>({});
    const supabase = createClient();

    console.log(teams);

    // Add clipboard copy function
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        const calculateTeamScores = async () => {
            if (league.scoring_type === 'NFL Playoff Pickem') {
                // Process each team
                const teamsWithUpdatedScores = await Promise.all(teams.map(async (team) => {                    
                    // Get weekly picks for this team
                    const { data: weeklyPicks, error: picksError } = await supabase
                        .from('weekly_picks')
                        .select('*, players(*)')
                        .eq('team_id', team.id);

                    // Add error handling
                    if (picksError) {
                        console.error('Error fetching picks:', picksError);
                        return { ...team, totalScore: 0 };
                    }

                    if (!weeklyPicks || weeklyPicks.length === 0) {
                        console.log('No weekly picks found for team:', team.name);
                        return { ...team, totalScore: 0 };
                    }
                    // Get all player IDs from picks
                    const playerIds = weeklyPicks.map(pick => pick.player_id).filter(Boolean);
                    
                    if (playerIds.length === 0) {
                        console.log('No player IDs found in picks');
                        return { ...team, totalScore: 0 };
                    }

                    // Get game stats for these players
                    const { data: stats, error: statsError } = await supabase
                        .from('game_stats')
                        .select('*')
                        .in('player_id', playerIds);

                    if (statsError) {
                        console.error('Error fetching stats:', statsError);
                        return { ...team, totalScore: 0 };
                    }

                    if (!stats || stats.length === 0) {
                        console.log('No stats found for players:', playerIds);
                        return { ...team, totalScore: 0 };
                    }

                    // Group stats by week and player ID
                    const statsByWeek = groupBy(stats, 'week_number');
                    const statsMap: {[key: string]: GameStats[]} = {};
                    
                    Object.entries(statsByWeek).forEach(([week, weekStats]) => {
                        weekStats.forEach(stat => {
                            statsMap[`${week}-${stat.player_id}`] = statsMap[`${week}-${stat.player_id}`] 
                                ? [...statsMap[`${week}-${stat.player_id}`], stat]
                                : [stat];
                        });
                    });

                    // Calculate total score across all weeks
                    let totalScore = 0;
                    for (let week = 1; week <= league.num_weeks; week++) {
                        const weekPicks = weeklyPicks.filter(pick => pick.week_number === week);
                        let weekScore = 0;
                        
                        weekPicks.forEach(pick => {
                            const playerStats = statsMap[`${week}-${pick.player_id}`];
                            if (playerStats && league.scoring_rules) {
                                weekScore += calculateNFLPoints(playerStats, league.scoring_rules.rules);
                            }
                        });
                        
                        totalScore += weekScore;
                    }

                    return {
                        ...team,
                        totalScore
                    };
                }));

                // Sort teams by total score
                setSortedTeams(teamsWithUpdatedScores.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
            } else {
                // For other league types, use the existing totalScore
                setSortedTeams([...teams].sort((a, b) => b.totalScore - a.totalScore));
            }
        };

        calculateTeamScores();
    }, [teams, league, supabase]);

    return (
        <div className="space-y-4">
            {isCommissioner && (
                <div className="mb-6 p-4 bg-gluon-grey rounded-lg border border-slate-grey">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-primary-text">Commissioner Controls</h3>
                        <button
                            onClick={() => copyToClipboard(`${window.location.origin}/invite/league/${league_id}`)}
                            className="px-4 py-2 bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                        >
                            Copy League Invite Link
                        </button>
                    </div>
                </div>
            )}
            
            <DraftStatusPanel league_id={league_id} />
            
            <div className="space-y-1">
                {sortedTeams.map(team => (
                    <div 
                        key={team.id} 
                        className="border border-slate-grey bg-surface hover:bg-gluon-grey transition-colors duration-200 rounded-lg px-6 py-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Link 
                                    href={`${league_id}/team/${team.id}`}
                                    className="text-lg font-bold text-primary-text hover:text-liquid-lava transition-colors"
                                >
                                    {team.name}
                                </Link>
                                <p className="text-dusty-grey text-sm">
                                    {team.owner || 'Unclaimed'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-secondary-text mr-2">Total Score:</span>
                                <span className="text-liquid-lava font-bold text-lg">
                                    {Number(team.totalScore).toFixed(1)}
                                </span>
                                {isCommissioner && !team.owner && (
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/invite/team/${team.id}`)}
                                        className="px-3 py-1 text-sm bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        Copy Team Invite
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
// export default function LeagueHome({ teams, league_id, league }: LeagueHomeProps) {
//     const sortedTeams = teams.sort((a, b) => b.totalScore - a.totalScore);

//     return (
//         <div className="space-y-1">
//             {sortedTeams.map(team => (
//                 <div 
//                     key={team.id} 
//                     className="border border-slate-grey bg-surface hover:bg-gluon-grey transition-colors duration-200 rounded-lg px-6 py-6"
//                 >
//                     <div className="flex justify-between items-center">
//                         <div className="space-y-2">
//                             <Link 
//                                 href={`${league_id}/team/${team.id}`}
//                                 className="text-lg font-bold text-primary-text hover:text-liquid-lava transition-colors"
//                             >
//                                 {team.name}
//                             </Link>
//                             <p className="text-dusty-grey text-sm">
//                                 {team.owner || 'Unclaimed'}
//                             </p>
//                         </div>
//                         <div className="flex items-center">
//                             <span className="text-secondary-text mr-2">Total Score:</span>
//                             <span className="text-liquid-lava font-bold text-lg">
//                                 {Number(team.totalScore).toFixed(1)}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }