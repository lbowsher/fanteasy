'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { getPositionsForLeague, getPositionBorderColor } from './utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type PlayerSortBy = 'rank' | 'projection' | 'name';

interface PlayerSearchProps {
    availablePlayers: any[];
    searchResults: any[];
    isLoading: boolean;
    onSearch: (searchTerm: string) => void;
    onSelectPlayer: (player: any) => void;
    onAddToQueue: (player: any) => Promise<void>;
    isMyTurn: boolean;
    isCommissioner?: boolean;
    isDraftActive?: boolean;
    selectedPlayer: any | null;
    leagueType?: string;
    isNcaam?: boolean;
    sortBy?: PlayerSortBy;
    onSortChange?: (sortBy: PlayerSortBy) => void;
}

export default function PlayerSearch({
    availablePlayers,
    searchResults,
    isLoading,
    onSearch,
    onSelectPlayer,
    onAddToQueue,
    isMyTurn,
    isCommissioner = false,
    isDraftActive = false,
    selectedPlayer,
    leagueType = 'NFL',
    isNcaam = false,
    sortBy = 'name',
    onSortChange,
}: PlayerSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPosition, setCurrentPosition] = useState('All');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    const handlePositionChange = (position: string) => {
        setCurrentPosition(position);
        if (position === 'All') {
            onSearch(searchTerm);
        } else {
            onSearch(searchTerm);
        }
    };

    const positions = ['All', ...getPositionsForLeague(leagueType)];

    const displayedResults = currentPosition === 'All'
        ? searchResults
        : searchResults.filter(player => player.position === currentPosition);

    return (
        <div>
            <div className="flex flex-col space-y-2 mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <Input
                        type="text"
                        className="pl-10"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <Tabs value={currentPosition} onValueChange={handlePositionChange}>
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {positions.map(position => (
                            <TabsTrigger key={position} value={position}>
                                {position}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {isNcaam && onSortChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-1">Sort:</span>
                        {(['rank', 'projection'] as const).map((key) => {
                            const label = key === 'rank' ? 'Rank' : 'Projection';
                            const isActive = sortBy === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onSortChange(key)}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <p>Loading players...</p>
                        </div>
                    ) : displayedResults.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-muted-foreground">No players found.</p>
                        </div>
                    ) : (
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={isNcaam ? "w-[30%]" : "w-[40%] xl:w-[25%]"}>Player</TableHead>
                                    <TableHead className="w-[10%]">Pos</TableHead>
                                    <TableHead className="w-[15%]">Team</TableHead>
                                    {isNcaam ? (
                                        <>
                                            <TableHead className="w-[10%] text-center">Rank</TableHead>
                                            <TableHead className="w-[10%] text-center">Proj</TableHead>
                                        </>
                                    ) : (
                                        <TableHead className="hidden xl:table-cell xl:w-[25%]">Summary</TableHead>
                                    )}
                                    <TableHead className={isNcaam ? "w-[25%] text-right" : "w-[35%] xl:w-[25%] text-right"}>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedResults.map(player => (
                                    <TableRow
                                        key={player.id}
                                        className={selectedPlayer?.id === player.id ? 'bg-muted' : ''}
                                        style={{ borderLeftWidth: '3px', borderLeftColor: getPositionBorderColor(player.position, leagueType) }}
                                    >
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Image
                                                    src={player.pic_url || '/default-player.png'}
                                                    alt={player.name}
                                                    className="w-8 h-8 rounded-full object-cover mr-3"
                                                    width={32}
                                                    height={32}
                                                />
                                                <span className="font-medium" title={player.summary || ''}>{player.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{player.position}</TableCell>
                                        <TableCell>{player.team_name}</TableCell>
                                        {isNcaam ? (
                                            <>
                                                <TableCell className="text-center">
                                                    {player.rank != null ? (
                                                        <span className="text-sm font-semibold text-foreground">{player.rank}</span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm font-semibold text-primary">{player.projectedTotal ?? '-'}</span>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <TableCell className="hidden xl:table-cell max-w-xs truncate">{player.summary || '-'}</TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onAddToQueue && onAddToQueue(player)}
                                                >
                                                    Queue
                                                </Button>

                                                {(isMyTurn || (isCommissioner && isDraftActive)) && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            if (player && player.id) {
                                                                onSelectPlayer(player);
                                                            }
                                                        }}
                                                    >
                                                        Draft
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
