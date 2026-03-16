'use client';

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TeamPickerProps {
    teams: any[];
    draftOrder: string[];
    currentPick: number;
}

export default function TeamPicker({ teams, draftOrder, currentPick }: TeamPickerProps) {
    // If no teams provided, return a placeholder
    if (!teams || teams.length === 0) {
        return (
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-2 pb-2">
                    {draftOrder.map((teamId, index) => (
                        <div
                            key={index}
                            className={`flex-shrink-0 rounded-lg px-3 py-2 min-w-28 text-center ${
                                (index + 1) === currentPick
                                ? 'bg-liquid-lava text-snow'
                                : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            <p className="text-sm font-medium">Team {index + 1}</p>
                            <p className="text-xs truncate">Pick {index + 1}</p>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        );
    }

    // Map team IDs to team objects
    const orderedTeams = draftOrder.map(teamId =>
        teams.find(team => team.id === teamId) || {
            id: teamId,
            name: 'Unknown Team'
        }
    );

    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2 pb-2">
                {orderedTeams.map((team, index) => (
                    <div
                        key={team.id}
                        className={`flex-shrink-0 rounded-lg px-3 py-2 min-w-28 text-center ${
                            (index + 1) === currentPick
                            ? 'bg-liquid-lava text-snow'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <p className="text-sm font-medium">{team.name}</p>
                        <p className="text-xs truncate">
                            {team.owner ? team.owner : 'Unclaimed'}
                        </p>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
