'use client';

import { useRef, useEffect, useMemo } from 'react';
import { getPositionColor, getPositionBorderColor, computePickInfo, getTeamIdForPick } from './utils';

interface PicksCarouselProps {
    leagueTeams: any[];
    draftOrder: string[];
    currentPickTeamId: string | null;
    draftPicks: any[];
    leagueType: string;
    currentRound: number;
    currentPick: number;
    totalRounds: number;
    draftType: string;
}

export default function PicksCarousel({
    leagueTeams,
    draftOrder,
    currentPickTeamId,
    draftPicks,
    leagueType,
    currentRound,
    currentPick,
    totalRounds,
    draftType,
}: PicksCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentCardRef = useRef<HTMLDivElement>(null);

    const totalTeams = draftOrder.length;
    const totalPicks = totalRounds * totalTeams;

    // Map pick_number -> draft pick for O(1) lookup
    const pickMap = useMemo(() => {
        const map: Record<number, any> = {};
        for (const pick of draftPicks) {
            if (pick.pick_number != null) {
                map[pick.pick_number] = pick;
            }
        }
        return map;
    }, [draftPicks]);

    // Build a team lookup by id
    const teamMap = useMemo(() => {
        const map: Record<string, any> = {};
        for (const team of leagueTeams) {
            map[team.id] = team;
        }
        return map;
    }, [leagueTeams]);

    const currentOverallPick = (currentRound - 1) * totalTeams + currentPick;

    // Auto-scroll to current pick
    useEffect(() => {
        if (currentCardRef.current) {
            currentCardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [currentOverallPick]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = 300;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative">
            {/* Left arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-muted rounded-full p-1.5 shadow-md border border-border"
            >
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {Array.from({ length: totalPicks }, (_, i) => {
                    const overallPick = i + 1;
                    const { round, pickInRound } = computePickInfo(overallPick, totalTeams, draftType);
                    const teamId = getTeamIdForPick(overallPick, draftOrder, draftType);
                    const team = teamMap[teamId];
                    const teamName = team?.name || 'Unknown';
                    const pick = pickMap[overallPick];
                    const isCurrent = overallPick === currentOverallPick;
                    const isFilled = !!pick;
                    const notation = `${round}.${pickInRound}`;

                    if (isFilled) {
                        const position = pick.player?.position || '';
                        const playerName = pick.player?.name || 'Unknown';
                        const playerTeam = pick.player?.team || '';
                        const posColor = getPositionColor(position, leagueType);
                        const borderColor = getPositionBorderColor(position, leagueType);

                        return (
                            <div
                                key={overallPick}
                                ref={isCurrent ? currentCardRef : null}
                                className={`flex-shrink-0 rounded-lg p-2.5 min-w-[120px] max-w-[140px] border-2 transition-all ${
                                    isCurrent
                                        ? 'border-white bg-white/10 shadow-lg shadow-white/20'
                                        : 'border-border bg-card'
                                }`}
                                style={{ borderLeftWidth: '4px', borderLeftColor: isCurrent ? undefined : borderColor }}
                            >
                                {/* Pick notation */}
                                <p className="text-[10px] text-muted-foreground mb-0.5">{notation}</p>
                                {/* Player name */}
                                <p className="text-sm font-bold truncate text-foreground">{playerName}</p>
                                {/* Position badge + team */}
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${posColor} text-white`}>
                                        {position}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{playerTeam}</span>
                                </div>
                                {/* Team name */}
                                <p className="text-[10px] text-muted-foreground truncate mt-1">{teamName}</p>
                            </div>
                        );
                    }

                    // Empty / future pick
                    return (
                        <div
                            key={overallPick}
                            ref={isCurrent ? currentCardRef : null}
                            className={`flex-shrink-0 rounded-lg p-2.5 min-w-[120px] max-w-[140px] border-2 transition-all ${
                                isCurrent
                                    ? 'border-white bg-white/10 shadow-lg shadow-white/20'
                                    : 'border-border bg-card opacity-50'
                            }`}
                        >
                            <p className="text-[10px] text-muted-foreground mb-0.5">{notation}</p>
                            <p className="text-sm font-medium truncate text-muted-foreground">{teamName}</p>
                        </div>
                    );
                })}
            </div>

            {/* Right arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-muted rounded-full p-1.5 shadow-md border border-border"
            >
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
