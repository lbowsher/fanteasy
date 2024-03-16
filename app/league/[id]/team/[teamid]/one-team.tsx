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
    const supabase = createClientComponentClient<Database>();
    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }

    // TODO: add all players with scores
    return team.players.map((player: Player) => (
        <div key={player.id} className="border border-gray-800 border-t-0 px-4 py-8 flex">
            <div className="h-12 w-12">
                <img className="rounded-full" src={player.pic_url} alt="player pic" width={48} height={48}/>
            </div>
            <div className="ml-4">
                <p>
                    <span className="font-bold"> {player.name} </span>
                    <span className="text-sm ml-2 text-gray-400">{player.position}</span>
                </p>
                <p> {player.scores}</p>
            </div>
        </div>
        ))
    
}