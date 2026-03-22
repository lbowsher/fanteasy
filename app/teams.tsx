'use client'

import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    if (teams.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map(team => (
                <Link
                    key={team.id}
                    href={`/league/${team.league.id}/team/${team.id}`}
                    className="block"
                >
                    <Card className="hover:brightness-110 transition-all cursor-pointer h-full">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Image
                                className="rounded-full flex-shrink-0"
                                src={team.author.avatar_url}
                                alt={`${team.name} avatar`}
                                width={44}
                                height={44}
                            />
                            <div className="min-w-0">
                                <p className="font-bold truncate">{team.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {team.league.name}
                                    {team.league.league && (
                                        <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {team.league.league}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
