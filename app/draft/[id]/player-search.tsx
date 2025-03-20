'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';

interface PlayerSearchProps {
    availablePlayers: any[];
    searchResults: any[];
    isLoading: boolean;
    onSearch: (searchTerm: string) => void;
    onSelectPlayer: (player: any) => void;
    onAddToQueue: (player: any) => Promise<void>; // Function to add player to queue
    isMyTurn: boolean;
    selectedPlayer: any | null;
    leagueType?: string; // 'NFL', 'NBA', 'NCAAM', etc.
}

export default function PlayerSearch({ 
    availablePlayers,
    searchResults,
    isLoading,
    onSearch,
    onSelectPlayer,
    onAddToQueue,
    isMyTurn,
    selectedPlayer,
    leagueType = 'NFL' // Default to NFL if not provided
}: PlayerSearchProps) {
    const supabase = createClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPosition, setCurrentPosition] = useState('All');
    
    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };
    
    // Handle position filter change
    const handlePositionChange = (position: string) => {
        setCurrentPosition(position);
        
        if (position === 'All') {
            onSearch(searchTerm); // Reset to full search results
        } else {
            // Filter by position and search term
            const filtered = availablePlayers.filter(player => 
                player.position === position && 
                (
                    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    player.team_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            
            setFilteredResults(filtered);
        }
    };
    
    // Set filtered results based on position
    const setFilteredResults = (players: any[]) => {
        // This function helps avoid duplicating filter logic
        onSearch(searchTerm);
    };
    
    
    // Define position tabs for filtering based on league type
    const getPositionsForLeague = () => {
        switch(leagueType) {
            case 'NFL':
                return ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
            case 'NBA':
            case 'NCAAM':
                return ['All', 'PG', 'SG', 'SF', 'PF', 'C'];
            default:
                return ['All'];
        }
    };
    
    const positions = getPositionsForLeague();
    
    // Get displayed results based on position filter
    const displayedResults = currentPosition === 'All' 
        ? searchResults 
        : searchResults.filter(player => player.position === currentPosition);
    
    return (
        <div>
            <div className="flex flex-col space-y-2 mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-dusty-grey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-grey rounded-lg bg-surface text-primary-text focus:outline-none focus:border-liquid-lava"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                
                <div className="flex overflow-x-auto space-x-1 pb-2">
                    {positions.map(position => (
                        <button
                            key={position}
                            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                                currentPosition === position
                                ? 'bg-liquid-lava text-snow'
                                : 'bg-gluon-grey text-secondary-text hover:bg-slate-grey'
                            }`}
                            onClick={() => handlePositionChange(position)}
                        >
                            {position}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="border border-slate-grey rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <p>Loading players...</p>
                        </div>
                    ) : displayedResults.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-secondary-text">No players found.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gluon-grey">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-secondary-text">Player</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-secondary-text">Pos</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-secondary-text">Team</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-secondary-text">Summary</th>
                                    <th className="px-4 py-2 text-right text-sm font-medium text-secondary-text">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-grey">
                                {displayedResults.map(player => (
                                    <tr 
                                        key={player.id} 
                                        className={`hover:bg-gluon-grey ${
                                            selectedPlayer?.id === player.id ? 'bg-slate-grey' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <Image 
                                                    src={player.pic_url || '/default-player.png'} 
                                                    alt={player.name}
                                                    className="w-8 h-8 rounded-full object-cover mr-3"
                                                    width={32}
                                                    height={32}
                                                />
                                                <span className="font-medium">{player.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{player.position}</td>
                                        <td className="px-4 py-3 text-sm">{player.team_name}</td>
                                        <td className="px-4 py-3 text-sm max-w-xs truncate">{player.summary || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="px-2 py-1 bg-slate-grey text-primary-text text-xs rounded"
                                                    onClick={() => onAddToQueue && onAddToQueue(player)}
                                                >
                                                    Queue
                                                </button>
                                                
                                                {isMyTurn && (
                                                    <button
                                                        className="px-2 py-1 bg-liquid-lava text-snow text-xs rounded"
                                                        onClick={() => {
                                                            console.log('Draft button clicked for player:', player);
                                                            if (player && player.id) {
                                                                console.log('Player ID type:', typeof player.id);
                                                                onSelectPlayer(player);
                                                            } else {
                                                                console.error('Invalid player or player ID:', player);
                                                            }
                                                        }}
                                                    >
                                                        Draft
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}