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
import { toast } from 'sonner';
import LeagueSettingsModal from './league-settings-modal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
            toast.success('Link copied to clipboard!');
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
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-foreground">Commissioner Controls</h3>
                            <div className="flex items-center flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSettings(true)}
                                >
                                    <Settings size={16} />
                                    Settings
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowAddTeam(true)}
                                >
                                    <Plus size={16} />
                                    Add Team
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => copyToClipboard(`${window.location.origin}/invite/league/${league_id}`)}
                                >
                                    Copy Invite Link
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={showAddTeam} onOpenChange={(open) => {
                setShowAddTeam(open);
                if (!open) {
                    setNewTeamName('');
                    setAddTeamError(null);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="newTeamName" className="text-muted-foreground mb-1">
                                Team Name
                            </Label>
                            <Input
                                id="newTeamName"
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTeam();
                                }}
                                placeholder="Enter team name"
                                autoFocus
                            />
                        </div>
                        {addTeamError && (
                            <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">
                                {addTeamError}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowAddTeam(false);
                                setNewTeamName('');
                                setAddTeamError(null);
                            }}
                            disabled={isAddingTeam}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTeam}
                            disabled={isAddingTeam}
                            loading={isAddingTeam}
                        >
                            {isAddingTeam ? 'Adding...' : 'Add Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {showSettings && (
                <LeagueSettingsModal
                    league={league}
                    draftSettings={draftSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <DraftStatusPanel league_id={league_id} />

            {weeks.length > 0 && (
                <div className="flex justify-end items-center gap-4 px-6 py-2 text-sm text-muted-foreground">
                    {weeks.map(week => (
                        <span key={week} className="hidden sm:inline-block w-16 text-center">Wk {week}</span>
                    ))}
                    <span className="w-20 text-center">Total</span>
                </div>
            )}

            <div className="space-y-1">
                {sortedTeams.map(team => (
                    <div
                        key={team.id}
                        className="border border-border bg-card hover:brightness-110 transition-all duration-200 rounded-lg px-6 py-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Link
                                    href={`${league_id}/team/${team.id}`}
                                    className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                                >
                                    {team.name}
                                </Link>
                                <p className="text-muted-foreground text-sm">
                                    {team.owner || 'Unclaimed'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {isCommissioner && !team.owner && (
                                    <Button
                                        size="sm"
                                        onClick={() => copyToClipboard(`${window.location.origin}/invite/team/${team.id}`)}
                                    >
                                        Copy Team Invite
                                    </Button>
                                )}
                                {weeks.map(week => (
                                    <span key={week} className="hidden sm:inline-block w-16 text-center text-muted-foreground">
                                        {Number(team.weeklyScores[week] || 0).toFixed(1)}
                                    </span>
                                ))}
                                <span className="w-20 text-center text-primary font-bold text-lg">
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
