'use client'

import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    if (teams.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map(team => (
                <Card key={team.id} className="h-full">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Image
                            className="rounded-full flex-shrink-0"
                            src={team.author.avatar_url}
                            alt={`${team.name} avatar`}
                            width={44}
                            height={44}
                        />
                        <div className="min-w-0">
                            <p className="font-bold truncate">
                                <Link
                                    href={`/league/${team.league.id}/team/${team.id}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {team.name}
                                </Link>
                            </p>
                            <p className="text-sm truncate">
                                <Link
                                    href={`/league/${team.league.id}`}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {team.league.name}
                                </Link>
                                {team.league.league && (
                                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                        {team.league.league}
                                    </span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
