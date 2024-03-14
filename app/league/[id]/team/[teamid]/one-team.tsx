"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import Link from 'next/link';
import { redirect } from 'next/navigation';


export default async function OneTeam({ team }: { team: TeamWithOwner }){

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
    return (
    <div>
        <h1>{team.name}</h1>
        <h2>{team.players}</h2>
    </div>
    )
    
}