'use client'

import Image from "next/image";
import Link from 'next/link';

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    // TODO: change the profile avatar_url to team avatar_url
    return teams.map(team => ( 
        <div key={team.id} className="border border-gray-800 border-t-0 px-4 py-8 flex">
            <div className="h-12 w-12">
                <Image className="rounded-full" src={team.author.avatar_url} 
                alt="tweet user avatar" width={48} height={48}/>
            </div> 
            <div className="ml-4">
                <p>
                    <Link href={`/league/${team.league.id}/team/${team.id}`} className="font-bold"> {team.name} </Link>
                </p>
                <p>
                    <Link href={`/league/${team.league.id}`}>{team.league.name}</Link>
                </p>
            </div>
        </div>
    ))

}