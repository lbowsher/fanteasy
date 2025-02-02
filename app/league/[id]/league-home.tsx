//TODO: add team image in

// league/[id]/league-home.tsx
'use client';
import Link from 'next/link';
import { calculateNFLPoints } from '../../utils/scoring';
import { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface LeagueHomeProps {
    teams: TeamWithOwner[];
    league_id: LeagueID;
    league: League;
}

export default function LeagueHome({ teams, league_id, league }: LeagueHomeProps) {
    const [sortedTeams, setSortedTeams] = useState<TeamWithOwner[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<{[key: string]: GameStats[]}>({});
    const supabase = createClientComponentClient<Database>();

    console.log(teams);

    useEffect(() => {
        const calculateTeamScores = async () => {
            if (league.scoring_type === 'NFL Playoff Pickem') {
                // Process each team
                const teamsWithUpdatedScores = await Promise.all(teams.map(async (team) => {
                    // Add debugging
                    console.log('Processing team:', team.name);
                    
                    // Get weekly picks for this team
                    const { data: weeklyPicks, error: picksError } = await supabase
                        .from('weekly_picks')
                        .select('*, player(*)')
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

                    console.log('Weekly picks found:', weeklyPicks);

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

                    console.log('Stats found:', stats);
                    // Get game stats for these players
                    // const { data: stats } = await supabase
                    //     .from('game_stats')
                    //     .select('*')
                    //     .in('player_id', playerIds);

                    // if (!stats) return { ...team, totalScore: 0 };

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
                                {team.owner?.full_name || 'Unclaimed'}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="text-secondary-text mr-2">Total Score:</span>
                            <span className="text-liquid-lava font-bold text-lg">
                                {Number(team.totalScore).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
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