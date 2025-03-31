"use client";
import React, { useState } from 'react';
import SearchComponent from './search-component';
import { useRouter } from 'next/navigation';
import { createClient } from "../../../../utils/supabase/client";

const SearchPage: React.FC<{ sports_league: LeagueSportsLeague, team: TeamWithPlayers, year?: string }> = ({ sports_league, team, year = '2025' }) => {
    const supabase = createClient();
    const router = useRouter()
    
    const UpdatePlayer = async (playerID: PlayerID) => {
        if (!playerID) {
            console.log("Invalid player ID:", playerID);
        } else if (team.team_players && team.team_players.includes(playerID)) {
            console.log("Player already in team");
        }
        else {
            if (team.team_players) {
                const new_squad = [...team.team_players, playerID]
                await supabase.from('teams').update({team_players: new_squad}).eq('id', team.id);
                console.log("Submitted new player to team");
                router.refresh();
            }
            else {
                await supabase.from('teams').update({team_players: [playerID]}).eq('id', team.id);
                console.log("Submitted new player to team");
                router.refresh();
            }
        }
    }

    const [searchResults, setSearchResults] = useState<Player[]>([]);

    const handleSearch = async (searchTerm: string) => {
        const { data, error } = await supabase
        .from('players')
        .select()
        .eq('league', sports_league)
        .eq('season', year)
        .textSearch('name', searchTerm, {
            type: 'websearch',
            config: 'english'
        })
        const players = data?.map(player => ({
            ...player,
            })) ?? [];
        setSearchResults(players); // Update searchResults state with the fetched results
    };

    return (
        <div className="bg-surface p-4 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-primary-text mb-4">Add Players to Roster</h2>
            <SearchComponent onSearch={handleSearch} />
            
            {searchResults.length > 0 ? (
                <div className="space-y-2 mt-4">
                    {searchResults.map((player) => (
                        <div 
                            key={`${player.id}`}
                            className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-surface transition-colors"
                        >
                            <div>
                                <span className="font-medium text-primary-text">{player.name}</span>
                                <span className="ml-2 text-sm text-secondary-text">{player.team_name}</span>
                            </div>
                            <button 
                                onClick={() => UpdatePlayer(player.id)}
                                className="p-1 w-8 h-8 flex items-center justify-center bg-accent text-white rounded-full hover:opacity-90 transition-opacity"
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-secondary-text text-center py-4">
                    Search for players to add to your team
                </div>
            )}
        </div>
    );
};

export default SearchPage;