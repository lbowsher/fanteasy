'use client'

import Image from "next/image";
import Link from 'next/link';

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    return teams.map(team => ( 
        <div key={team.id} className="px-4 py-8 flex border-b border-border hover:bg-card transition-colors cursor-pointer">
            <div className="h-12 w-12">
                <Image 
                    className="rounded-full" 
                    src={team.author.avatar_url} 
                    alt={`${team.name} avatar`} 
                    width={48} 
                    height={48}
                />
            </div> 
            <div className="ml-4">
                <p>
                    <Link 
                        href={`/league/${team.league.id}/team/${team.id}`} 
                        className="font-bold hover:text-accent transition-colors"
                    >
                        {team.name}
                    </Link>
                </p>
                <p>
                    <Link 
                        href={`/league/${team.league.id}`} 
                        className="text-muted-foreground hover:text-accent transition-colors"
                    >
                        {team.league.name}
                    </Link>
                </p>
            </div>
        </div>
    ))
}