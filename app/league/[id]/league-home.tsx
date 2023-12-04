"use client";

import Link from 'next/link';


export default async function LeagueHome({ teams }: { teams: TeamWithOwner[] }){

    //TODO: add team image in
    //<div className="h-12 w-12">
    //  <Image className="rounded-full" src={team.author.avatar_url} 
    //  alt="tweet user avatar" width={48} height={48}/>
    //</div> 
    


    return teams.map(team => ( 
        <div key={team.id} className="border border-gray-800 border-t-0 px-4 py-8 flex">
            <div className="ml-4">
                <p>
                    <Link href={`team/${team.id}`} className="font-bold"> {team.name} </Link>
                </p>
                <p>
                    <span> {team.owner} </span>
                </p>
            </div>
        </div>
    ))
}