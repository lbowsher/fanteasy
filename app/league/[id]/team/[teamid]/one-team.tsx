// "use client";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// import Link from 'next/link';
// import { redirect } from 'next/navigation';


// export default async function OneTeam({ team }: { team: TeamWithPlayers }){

//     //TODO: add team image in
//     //<div className="h-12 w-12">
//     //  <Image className="rounded-full" src={team.author.avatar_url} 
//     //  alt="tweet user avatar" width={48} height={48}/>
//     //</div> 
//     const orderedPlayers = team.players.sort((a : Player, b: Player) => {
//         const positionOrder: { [key: string]: number } = { "PG": 0, "G": 1, "SG": 2, "GF": 3, "SF": 4, "F": 5, "PF": 6, "C": 7, "QB": 8, "RB": 9, "WR": 10, "TE": 11, "K": 12, "D/ST": 13};
//         return positionOrder[a.position] - positionOrder[b.position];
//     });

//     const totalTeamScore = team.players.reduce((totalScore: number, player: Player) => totalScore + player.scores.reduce((partialSum: number, score: number) => partialSum + score, 0), 0);

//     return orderedPlayers.map((player: Player) => (
//         <div key={player.id} className="items-left border-b border-slateGrey px-11 py-8 flex">
//             <div className="h-12 w-12">
//                 <img className="rounded-full" alt="" src={player.pic_url} width={48} height={48}/>
//             </div>
//             <div className="flex flex-col ml-5">
//                 <span className="font-bold"> {player.name} </span>
//                 <span className="text-dustyGrey"> {player.team_name} </span>
//             </div>
//             <div className="flex flex-col ml-2">
//                 <span className="text-sm ml-2 text-gray-400">{player.position}</span>
//                 <span className="text-sm ml-2 text-gray-400">{player.height}</span>
//                 <span className="text-sm ml-2 text-gray-400">#{player.number}</span>
//             </div>
//             <div className="flex flex-col ml-2 text-sm">
//                 <p> {player.scores.map((score: number, index: number) => (
//                     index === player.scores.length - 1 ? `${score}` : `${score}, `
//                 ))}</p>
//             </div>
//             <div className="flex flex-col ml-2 font-bold text-lava">
//                 <p> {player.scores.reduce((partialSum: number, a: number) => partialSum + a, 0)}</p>
//             </div>
//         </div>
//         ))
    
// }

// "use client";
// import { useCallback } from 'react';

// export default function OneTeam({ team }: { team: TeamWithPlayers }) {
//     const orderedPlayers = useCallback(() => {
//         return team.players.sort((a: Player, b: Player) => {
//             const positionOrder: { [key: string]: number } = {
//                 "PG": 0, "G": 1, "SG": 2, "GF": 3, "SF": 4,
//                 "F": 5, "PF": 6, "C": 7, "QB": 8, "RB": 9,
//                 "WR": 10, "TE": 11, "K": 12, "D/ST": 13
//             };
//             return positionOrder[a.position] - positionOrder[b.position];
//         });
//     }, [team.players]);

//     return (
//         <div className="space-y-4">
//             {orderedPlayers().map((player: Player) => (
//                 <div 
//                     key={player.id} 
//                     className="flex items-center p-4 bg-background rounded-lg border border-border hover:border-accent transition-colors"
//                 >
//                     <div className="flex-shrink-0">
//                         <img 
//                             className="h-12 w-12 rounded-full object-cover" 
//                             alt={`${player.name}'s photo`}
//                             src={player.pic_url} 
//                             width={48} 
//                             height={48}
//                         />
//                     </div>
                    
//                     <div className="ml-4 flex-grow">
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 <h3 className="font-bold text-primary-text">
//                                     {player.name}
//                                 </h3>
//                                 <p className="text-secondary-text text-sm">
//                                     {player.team_name}
//                                 </p>
//                             </div>
                            
//                             <div className="text-right">
//                                 <span className="inline-block px-2 py-1 bg-surface rounded text-xs font-medium text-accent">
//                                     {player.position}
//                                 </span>
//                             </div>
//                         </div>
                        
//                         <div className="mt-2 flex justify-between items-center">
//                             <div className="flex space-x-4 text-secondary-text text-sm">
//                                 <span>{player.height}</span>
//                                 {player.number && (
//                                     <span>#{player.number}</span>
//                                 )}
//                             </div>
                            
//                             <div className="flex items-center space-x-4">
//                                 <div className="text-secondary-text text-sm">
//                                     {player.scores.join(', ')}
//                                 </div>
//                                 <div className="text-accent font-bold">
//                                     {player.scores.reduce((sum, score) => sum + score, 0)}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }

// "use client";
// import { useCallback } from 'react';

// type PlayerScore = {
//     score: number;
//     week?: number;
// };

// export default function OneTeam({ team }: { team: TeamWithPlayers }) {
//     const orderedPlayers = useCallback(() => {
//         if (!team.players) return [];
        
//         // Get the scoring type from the team's league
//         const isNFLPlayoffPickem = team.leagues?.scoring_type === 'NFL Playoff Pickem';
        
//         const positionOrder = isNFLPlayoffPickem 
//             ? {
//                 "QB": 0, "RB": 1, "WR": 2, "TE": 3, "K": 4, "D/ST": 5
//             }
//             : {
//                 "PG": 0, "G": 1, "SG": 2, "GF": 3, "SF": 4, //TODO: GF?
//                 "F": 5, "PF": 6, "C": 7
//             };

//         return team.players.sort((a, b) => {
//             return (positionOrder[a.position] ?? 99) - (positionOrder[b.position] ?? 99);
//         });
//     }, [team.players, team.leagues?.scoring_type]);

//     return (
//         <div className="space-y-4">
//             {orderedPlayers().map((player) => (
//                 <div 
//                     key={player.id} 
//                     className="flex items-center p-4 bg-background rounded-lg border border-border hover:border-accent transition-colors"
//                 >
//                     <div className="flex-shrink-0">
//                         <img 
//                             className="h-12 w-12 rounded-full object-cover" 
//                             alt={`${player.name}'s photo`}
//                             src={player.pic_url} 
//                             width={48} 
//                             height={48}
//                         />
//                     </div>
                    
//                     <div className="ml-4 flex-grow">
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 <h3 className="font-bold text-primary-text">
//                                     {player.name}
//                                 </h3>
//                                 <p className="text-secondary-text text-sm">
//                                     {player.team_name}
//                                 </p>
//                             </div>
                            
//                             <div className="text-right">
//                                 <span className="inline-block px-2 py-1 bg-surface rounded text-xs font-medium text-accent">
//                                     {player.position}
//                                 </span>
//                             </div>
//                         </div>
                        
//                         <div className="mt-2 flex justify-between items-center">
//                             <div className="flex space-x-4 text-secondary-text text-sm">
//                                 <span>{player.height}</span>
//                                 {player.number && (
//                                     <span>#{player.number}</span>
//                                 )}
//                             </div>
                            
//                             <div className="flex items-center space-x-4">
//                                 <div className="text-secondary-text text-sm">
//                                     {player.scores?.join(', ') || 'No scores yet'}
//                                 </div>
//                                 <div className="text-accent font-bold">
//                                     {player.scores?.reduce((sum, score) => sum + score, 0) || 0}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }

// V3 lets go

"use client";
import { useCallback } from 'react';
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
// ... existing code ...
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
                            <img 
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