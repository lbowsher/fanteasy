// V3 lets go

// league/[id]/team/[teamid]/one-team.tsx
"use client";
import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { calculatePlayerScore } from '../../../../utils/scoring';

export default function OneTeam({ team }: { team: TeamWithPlayers & { leagues: League } }) {
    const orderedPlayers = useCallback(() => {
        if (!team.players) return [];
        
        const isNFLPlayoffPickem = team.leagues?.scoring_type === 'NFL Playoff Pickem';
        
        const positionOrder = isNFLPlayoffPickem 
            ? {
                "QB": 0, "RB": 1, "WR": 2, "TE": 3, "K": 4, "D/ST": 5
            }
            : {
                "PG": 0, "G": 1, "SG": 2, "SF": 3, "F": 4,
                "PF": 5, "C": 6
            };

        return team.players.sort((a : Player, b: Player) => {
            const aPos = a.position as keyof typeof positionOrder;
            const bPos = b.position as keyof typeof positionOrder;
            return (positionOrder[aPos] ?? 99) - (positionOrder[bPos] ?? 99);
        });
    }, [team.players, team.leagues?.scoring_type]);

    // Calculate total team score
    const totalTeamScore = useMemo(() => {
        if (!team.players) return 0;
        
        return team.players.reduce((total: number, player: Player) => {
            if (!player.gameStats) return total;
            return total + calculatePlayerScore(player.gameStats, team.leagues, player.position);
        }, 0);
    }, [team.players, team.leagues]);

    return (
        <div className="space-y-4">
            <div className="bg-surface p-4 rounded-lg border border-border mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-primary-text">Team Total Score</h2>
                    <div className="text-2xl font-bold text-accent">{totalTeamScore.toFixed(1)}</div>
                </div>
            </div>
            {orderedPlayers().map((player: Player) => {
                const playerScore = player.gameStats
                    ? calculatePlayerScore(player.gameStats, team.leagues, player.position)
                    : 0;

                return (
                    <div 
                        key={player.id} 
                        className="flex items-center p-4 bg-background rounded-lg border border-border hover:border-accent transition-colors"
                    >
                        <div className="flex-shrink-0">
                            <Image 
                                className="h-12 w-12 rounded-full object-cover bg-surface" 
                                alt={`${player.name}'s photo`}
                                src={player.pic_url || '/default-player.png'} 
                                width={48}
                                height={48}
                            />
                        </div>
                        
                        <div className="ml-4 flex-grow overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-primary-text">
                                        {player.name}
                                    </h3>
                                    <p className="text-secondary-text text-sm">
                                        {player.team_name}
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 bg-surface rounded text-xs font-medium text-accent">
                                        {player.position}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                                <div className="flex flex-nowrap whitespace-nowrap text-secondary-text text-sm">
                                    {player.height && <span className="mr-4">{player.height}</span>}
                                    {player.number && <span>#{player.number}</span>}
                                </div>
                                
                                <div className="flex items-center">
                                    {player.gameStats && player.gameStats.length > 0 ? (
                                        <div className="relative max-w-[180px] sm:max-w-[240px] md:max-w-[320px] mr-4">
                                            <div className="overflow-x-auto pb-1 games-scroll-container" 
                                                 style={{ 
                                                     scrollbarWidth: 'thin',
                                                     maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                                                     WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
                                                 }}>
                                                <div className="flex whitespace-nowrap text-secondary-text text-sm pr-4">
                                                    {player.gameStats.map((stat : GameStats, index: number) => {
                                                        const gameScore = calculatePlayerScore([stat], team.leagues, player.position).toFixed(1);
                                                        return (
                                                            <div key={stat.id} className="mr-2 flex-shrink-0 text-center">
                                                                <div className="bg-surface px-2 py-1 rounded-md">
                                                                    <div className="text-xs opacity-75">G{stat.week_number || index + 1}</div>
                                                                    <div>{gameScore}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-secondary-text text-sm mr-4">No games played</div>
                                    )}
                                    <div className="text-accent font-bold flex-shrink-0">
                                        {playerScore.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}