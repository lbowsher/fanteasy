'use client';

import { ScrollArea } from "@/components/ui/scroll-area";

interface DraftHistoryProps {
    draftPicks: any[];
}

export default function DraftHistory({ draftPicks }: DraftHistoryProps) {
    return (
        <ScrollArea className="h-[600px]">
            {draftPicks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No picks have been made yet.</p>
            ) : (
                <ul className="space-y-2">
                    {draftPicks.map((pick) => (
                        <li
                            key={pick.id}
                            className="flex items-center p-2 border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                        >
                            <div className="flex-shrink-0 mr-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-liquid-lava text-snow rounded-full font-bold">
                                    {pick.round_number}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-grow">
                                <div>
                                    <p className="font-medium">{pick.player?.name || 'Unknown Player'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {pick.player?.position || 'POS'} - {pick.player?.team_name || 'Team'}
                                    </p>
                                </div>

                                <div className="mt-1 md:mt-0 text-xs md:text-sm text-right">
                                    <p className="text-muted-foreground">Drafted by:</p>
                                    <p>{pick.team?.name || 'Unknown Team'}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </ScrollArea>
    );
}
