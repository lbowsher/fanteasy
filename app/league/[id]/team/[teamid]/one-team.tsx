"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import Link from 'next/link';
import { redirect } from 'next/navigation';


export default async function OneTeam({ team }: { team: TeamWithPlayers }){

    //TODO: add team image in
    //<div className="h-12 w-12">
    //  <Image className="rounded-full" src={team.author.avatar_url} 
    //  alt="tweet user avatar" width={48} height={48}/>
    //</div> 
    const orderedPlayers = team.players.sort((a : Player, b: Player) => {
        const positionOrder: { [key: string]: number } = { "PG": 0, "G": 1, "SG": 2, "GF": 3, "SF": 4, "F": 5, "PF": 6, "C": 7};
        return positionOrder[a.position] - positionOrder[b.position];
    });

    const totalTeamScore = team.players.reduce((totalScore: number, player: Player) => totalScore + player.scores.reduce((partialSum: number, score: number) => partialSum + score, 0), 0);

    return orderedPlayers.map((player: Player) => (
        <div key={player.id} className="border border-gray-800 border-t-0 px-3 py-8 flex">
            <div className="h-12 w-12">
                <img className="rounded-full" alt="" src={player.pic_url} width={48} height={48}/>
            </div>
            <div className="flex flex-col ml-5">
                <span className="font-bold"> {player.name} </span>
                <span> {player.team_name} </span>
            </div>
            <div className="flex flex-col ml-2">
                <span className="text-sm ml-2 text-gray-400">{player.position}</span>
                <span className="text-sm ml-2 text-gray-400">{player.height}</span>
                <span className="text-sm ml-2 text-gray-400">#{player.number}</span>
            </div>
            <div className="flex flex-col ml-2 text-sm">
                <p> {player.scores.map((score: number, index: number) => (
                    index === player.scores.length - 1 ? `${score}` : `${score}, `
                ))}</p>
            </div>
            <div className="flex flex-col ml-2 font-bold">
                <p> {player.scores.reduce((partialSum: number, a: number) => partialSum + a, 0)}</p>
            </div>
        </div>
        ))
    
}