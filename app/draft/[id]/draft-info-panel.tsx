'use client';

import Image from 'next/image';
import DraftTimer from './draft-timer';
import { getPositionColor, getPositionsForLeague } from './utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DraftInfoPanelProps {
    currentPickTeam: any;
    currentTeam: any;
    draftState: any;
    isMyTurn: boolean;
    isCommissioner: boolean;
    isDraftActive: boolean;
    isDraftCompleted: boolean;
    isPaused: boolean;
    isPending: boolean;
    autoPickEnabled: boolean;
    selectedPlayer: any;
    pickError: string | null;
    draftPicks: any[];
    leagueType: string;
    onStartDraft: () => void;
    onTogglePause: () => void;
    onToggleAutoPick: () => void;
    onMakePick: (playerId: string) => void;
    onCancelSelection: () => void;
    onTimerExpired: () => void;
}

export default function DraftInfoPanel({
    currentPickTeam,
    currentTeam,
    draftState,
    isMyTurn,
    isCommissioner,
    isDraftActive,
    isDraftCompleted,
    isPaused,
    isPending,
    autoPickEnabled,
    selectedPlayer,
    pickError,
    draftPicks,
    leagueType,
    onStartDraft,
    onTogglePause,
    onToggleAutoPick,
    onMakePick,
    onCancelSelection,
    onTimerExpired,
}: DraftInfoPanelProps) {
    const positions = getPositionsForLeague(leagueType);

    // Build roster for current picking team
    const currentTeamRoster: Record<string, number> = {};
    if (currentPickTeam) {
        for (const pick of draftPicks) {
            const teamId = pick.team?.id || pick.team_id;
            const position = pick.player?.position;
            if (teamId === currentPickTeam.id && position) {
                currentTeamRoster[position] = (currentTeamRoster[position] || 0) + 1;
            }
        }
    }

    const totalPicked = Object.values(currentTeamRoster).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            {/* Current Pick Info */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">On the Clock</p>
                            <p className="text-lg font-bold text-foreground">
                                {currentPickTeam?.name || 'Waiting...'}
                            </p>
                            {currentPickTeam?.profiles?.full_name && (
                                <p className="text-sm text-muted-foreground">
                                    {currentPickTeam.profiles.full_name}
                                </p>
                            )}
                        </div>
                        {isDraftActive && (
                            <DraftTimer
                                timePerPick={draftState.time_per_pick}
                                timerStartedAt={draftState.timer_started_at}
                                isMyTurn={isMyTurn}
                                isPaused={isPaused}
                                onTimerExpired={onTimerExpired}
                            />
                        )}
                    </div>

                    {isDraftActive && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Round {draftState.current_round}</span>
                            <span>·</span>
                            <span>Pick {draftState.current_pick}</span>
                            {isPaused && (
                                <>
                                    <span>·</span>
                                    <span className="text-yellow-500 font-medium">Paused</span>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Commissioner Controls */}
            {isCommissioner && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Commissioner</p>
                        <div className="flex flex-col gap-2">
                            {!isDraftActive && !isDraftCompleted && (
                                <Button
                                    onClick={onStartDraft}
                                    disabled={isPending}
                                    loading={isPending}
                                    className="w-full"
                                >
                                    {isPending ? 'Starting...' : 'Start Draft'}
                                </Button>
                            )}
                            {isDraftActive && !isDraftCompleted && (
                                <Button
                                    variant={isPaused ? 'default' : 'secondary'}
                                    onClick={onTogglePause}
                                    disabled={isPending}
                                    className={`w-full ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                >
                                    {isPaused ? 'Resume Draft' : 'Pause Draft'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selected Player Confirmation */}
            {(isMyTurn || (isCommissioner && isDraftActive)) && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            {isMyTurn ? "Your Pick" : "Commissioner Pick"}
                        </p>

                        {pickError && (
                            <p className="text-red-500 text-sm mb-2">{pickError}</p>
                        )}

                        {selectedPlayer ? (
                            <div>
                                <div className="flex items-center mb-3">
                                    <Image
                                        src={selectedPlayer.pic_url || '/default-player.png'}
                                        alt={selectedPlayer.name}
                                        className="w-12 h-12 rounded-full object-cover mr-3"
                                        width={48}
                                        height={48}
                                    />
                                    <div>
                                        <p className="font-bold text-foreground">{selectedPlayer.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPlayer.position} - {selectedPlayer.team_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={onCancelSelection}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onMakePick(String(selectedPlayer.id))}
                                        disabled={isPending}
                                        loading={isPending}
                                        className="flex-1"
                                    >
                                        {isPending ? 'Picking...' : 'Confirm Pick'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Select a player from the list or your queue
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Auto-pick toggle */}
            {isMyTurn && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="auto-pick-panel" className="text-sm text-foreground">
                                Auto-pick if time expires
                            </label>
                            <input
                                type="checkbox"
                                id="auto-pick-panel"
                                checked={autoPickEnabled}
                                onChange={onToggleAutoPick}
                                disabled={isPending}
                                className="h-4 w-4 accent-primary rounded"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Roster Breakdown */}
            {currentPickTeam && totalPicked > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            {currentPickTeam.name} Roster ({totalPicked})
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {positions.map((pos) => {
                                const count = currentTeamRoster[pos] || 0;
                                return (
                                    <div
                                        key={pos}
                                        className={`flex items-center justify-between rounded px-2 py-1 ${
                                            count > 0 ? 'bg-muted' : 'bg-muted/30'
                                        }`}
                                    >
                                        <span className={`text-xs font-bold px-1 rounded ${getPositionColor(pos, leagueType)} text-white`}>
                                            {pos}
                                        </span>
                                        <span className="text-xs text-foreground font-medium">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
