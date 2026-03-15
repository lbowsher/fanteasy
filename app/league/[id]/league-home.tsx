//TODO: add team image in

// league/[id]/league-home.tsx
'use client';
import Link from 'next/link';
import { calculateNFLPoints } from '../../utils/scoring';
import { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { createClient } from "../../utils/supabase/client";
import DraftStatusPanel from './draft-status-panel';
import { useRouter } from 'next/navigation';
import { Plus, Settings } from 'lucide-react';
import LeagueSettingsModal from './league-settings-modal';

interface TeamWithOwnerAndScores {
    id: string;
    name: string;
    owner?: string | null;
    totalScore: number;
    weeklyScores: Record<number, number>;
    team_players?: string[] | null;
    league_id: string;
    user_id?: string | null;
    is_commish?: boolean | null;
}

interface LeagueHomeProps {
    teams: TeamWithOwnerAndScores[];
    league_id: LeagueID;
    league: League;
    draftSettings: DraftSettings | null;
    isCommissioner: boolean;
    weeks: number[];
}

export default function LeagueHome({ teams, league_id, league, draftSettings, isCommissioner, weeks }: LeagueHomeProps) {
    const [sortedTeams, setSortedTeams] = useState<TeamWithOwnerAndScores[]>([]);
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [addTeamError, setAddTeamError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    // Add clipboard copy function
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) {
            setAddTeamError('Please enter a team name');
            return;
        }

        setIsAddingTeam(true);
        setAddTeamError(null);

        const { error } = await supabase
            .from('teams')
            .insert({
                league_id: league_id,
                name: newTeamName.trim(),
                is_commish: false
            });

        if (error) {
            console.error('Error adding team:', error);
            setAddTeamError('Failed to add team. Please try again.');
            setIsAddingTeam(false);
        } else {
            setShowAddTeam(false);
            setNewTeamName('');
            setIsAddingTeam(false);
            router.refresh();
        }
    };

    useEffect(() => {
        // Sort teams by total score, which is now correctly calculated in the parent component
        setSortedTeams([...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
    }, [teams]);

    return (
        <div className="space-y-4">
            {isCommissioner && (
                <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-primary-text">Commissioner Controls</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="px-4 py-2 bg-surface border border-border text-primary-text rounded-lg hover:bg-background transition-colors flex items-center gap-2"
                                title="League Settings"
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                            <button
                                onClick={() => setShowAddTeam(true)}
                                className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Team
                            </button>
                            <button
                                onClick={() => copyToClipboard(`${window.location.origin}/invite/league/${league_id}`)}
                                className="px-4 py-2 bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                            >
                                Copy League Invite Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddTeam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface border border-border rounded-lg p-6 max-w-sm mx-4 w-full">
                        <h3 className="text-lg font-bold text-primary-text mb-4">Add New Team</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newTeamName" className="block text-sm text-secondary-text mb-1">
                                    Team Name
                                </label>
                                <input
                                    id="newTeamName"
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddTeam();
                                        if (e.key === 'Escape') setShowAddTeam(false);
                                    }}
                                    placeholder="Enter team name"
                                    className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                                    autoFocus
                                />
                            </div>
                            {addTeamError && (
                                <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">
                                    {addTeamError}
                                </div>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddTeam(false);
                                        setNewTeamName('');
                                        setAddTeamError(null);
                                    }}
                                    className="px-4 py-2 text-secondary-text hover:text-primary-text transition-colors"
                                    disabled={isAddingTeam}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTeam}
                                    disabled={isAddingTeam}
                                    className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isAddingTeam ? 'Adding...' : 'Add Team'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSettings && (
                <LeagueSettingsModal
                    league={league}
                    draftSettings={draftSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <DraftStatusPanel league_id={league_id} />
            
            {weeks.length > 0 && (
                <div className="flex justify-end items-center gap-4 px-6 py-2 text-sm text-secondary-text">
                    {weeks.map(week => (
                        <span key={week} className="w-16 text-center">Wk {week}</span>
                    ))}
                    <span className="w-20 text-center">Total</span>
                </div>
            )}

            <div className="space-y-1">
                {sortedTeams.map(team => (
                    <div
                        key={team.id}
                        className="border border-border bg-surface hover:bg-opacity-80 transition-colors duration-200 rounded-lg px-6 py-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Link
                                    href={`${league_id}/team/${team.id}`}
                                    className="text-lg font-bold text-primary-text hover:text-liquid-lava transition-colors"
                                >
                                    {team.name}
                                </Link>
                                <p className="text-secondary-text text-sm">
                                    {team.owner || 'Unclaimed'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {isCommissioner && !team.owner && (
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/invite/team/${team.id}`)}
                                        className="px-3 py-1 text-sm bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        Copy Team Invite
                                    </button>
                                )}
                                {weeks.map(week => (
                                    <span key={week} className="w-16 text-center text-secondary-text">
                                        {Number(team.weeklyScores[week] || 0).toFixed(1)}
                                    </span>
                                ))}
                                <span className="w-20 text-center text-liquid-lava font-bold text-lg">
                                    {Number(team.totalScore).toFixed(1)}
                                </span>
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