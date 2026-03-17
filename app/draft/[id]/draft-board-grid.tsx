'use client';

import { useMemo } from 'react';
import { getPositionColor, getPositionTextColor, getPositionBorderColor, getTeamIdForPick } from './utils';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DraftBoardGridProps {
    leagueTeams: any[];
    draftOrder: string[];
    draftPicks: any[];
    totalRounds: number;
    draftType: string;
    currentPickTeamId: string | null;
    currentRound: number;
    currentPick: number;
    leagueType: string;
}

export default function DraftBoardGrid({
    leagueTeams,
    draftOrder,
    draftPicks,
    totalRounds,
    draftType,
    currentPickTeamId,
    currentRound,
    currentPick,
    leagueType,
}: DraftBoardGridProps) {
    const totalTeams = draftOrder.length;

    // Map pick_number -> draft pick
    const pickMap = useMemo(() => {
        const map: Record<number, any> = {};
        for (const pick of draftPicks) {
            map[pick.pick_number] = pick;
        }
        return map;
    }, [draftPicks]);

    // Build ordered teams
    const orderedTeams = useMemo(() => {
        return draftOrder.map((teamId, index) => {
            const team = leagueTeams.find(t => t.id === teamId);
            return {
                id: teamId,
                name: team?.name || `Team ${index + 1}`,
            };
        });
    }, [draftOrder, leagueTeams]);

    // Current overall pick number
    const currentOverallPick = (currentRound - 1) * totalTeams + currentPick;

    if (totalTeams === 0) {
        return <p className="text-muted-foreground text-center py-8">No teams in draft order.</p>;
    }

    return (
        <ScrollArea className="w-full">
            <div className="min-w-max">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 bg-background px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border w-16">
                                Round
                            </th>
                            {orderedTeams.map((team) => (
                                <th
                                    key={team.id}
                                    className={`px-2 py-2 text-xs font-semibold border-b border-border min-w-[120px] text-center ${
                                        team.id === currentPickTeamId
                                            ? 'text-yellow-500 bg-yellow-500/5'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {team.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: totalRounds }, (_, roundIndex) => {
                            const round = roundIndex + 1;
                            const isReversed = draftType === 'snake' && round % 2 === 0;
                            const arrow = isReversed ? '\u2190' : '\u2192';

                            return (
                                <tr key={round} className="border-b border-border/50">
                                    <td className="sticky left-0 z-10 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <span>{round}</span>
                                            <span className="text-muted-foreground/50">{arrow}</span>
                                        </div>
                                    </td>
                                    {orderedTeams.map((team, colIndex) => {
                                        // Calculate the pick number for this cell
                                        const pickInRound = isReversed
                                            ? totalTeams - colIndex
                                            : colIndex + 1;
                                        const overallPick = (round - 1) * totalTeams + pickInRound;
                                        const pick = pickMap[overallPick];
                                        const isCurrentCell = overallPick === currentOverallPick;
                                        const isCurrentCol = team.id === currentPickTeamId;

                                        return (
                                            <td
                                                key={`${round}-${team.id}`}
                                                className={`px-1.5 py-1 text-center min-w-[120px] relative ${
                                                    isCurrentCell
                                                        ? 'bg-yellow-500/20 ring-2 ring-yellow-500 ring-inset'
                                                        : isCurrentCol
                                                            ? 'bg-yellow-500/5'
                                                            : roundIndex % 2 === 0
                                                                ? 'bg-transparent'
                                                                : 'bg-muted/30'
                                                }`}
                                                style={pick ? { borderLeftWidth: '3px', borderLeftColor: getPositionBorderColor(pick.player?.position, leagueType) } : undefined}
                                            >
                                                {pick ? (
                                                    <div className="flex flex-col items-center py-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${getPositionColor(pick.player?.position, leagueType)} text-white`}>
                                                                {pick.player?.position}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-medium text-foreground truncate max-w-[110px] mt-0.5">
                                                            {pick.player?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {pick.player?.team_name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        <span className="text-[10px] text-muted-foreground/50">
                                                            {round}.{pickInRound}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Overall pick number */}
                                                <span className="absolute top-0.5 right-1 text-[9px] text-muted-foreground/40">
                                                    {overallPick}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
