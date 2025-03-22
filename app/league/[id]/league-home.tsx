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
    const supabase = createClient();

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
        // Sort teams by total score, which is now correctly calculated in the parent component
        setSortedTeams([...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
    }, [teams]);

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