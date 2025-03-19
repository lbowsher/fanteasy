// V3 lets go

// league/[id]/team/[teamid]/one-team.tsx
"use client";
import { useCallback } from 'react';
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

    return (
        <div className="space-y-4">
            {orderedPlayers().map((player: Player) => {
                const playerScore = player.gameStats 
                    ? calculatePlayerScore(player.gameStats, team.leagues) 
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
                                src={player.pic_url || '/placeholder-avatar.png'} 
                                width={48}
                                height={48}
                            />
                        </div>
                        
                        <div className="ml-4 flex-grow">
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
                            
                            <div className="mt-2 flex justify-between items-center">
                                <div className="flex space-x-4 text-secondary-text text-sm">
                                    {player.height && <span>{player.height}</span>}
                                    {player.number && <span>#{player.number}</span>}
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    {player.gameStats && player.gameStats.length > 0 ? (
                                        <div className="text-secondary-text text-sm">
                                            {player.gameStats.map((stat : GameStats, index: number) => (
                                                <span key={stat.id} className="mr-2">
                                                    {`Week ${stat.week_number || index + 1}: ${calculatePlayerScore([stat], team.leagues).toFixed(1)}`}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-secondary-text text-sm">No games played</div>
                                    )}
                                    <div className="text-accent font-bold">
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