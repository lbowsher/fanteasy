"use client";
import React, { useState } from 'react';
import SearchComponent from './search-component';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SearchPage: React.FC<{ sports_league: LeagueSportsLeague, team: TeamWithOwner }> = ({ sports_league, team }) => {
    const supabase = createClientComponentClient<Database>();
    
    const UpdatePlayer =async (playerID: PlayerID) => {
        const new_players = team.players ? [...team.players, playerID] : [playerID];
        console.log(new_players)
        await supabase.from('teams').update({players: new_players }).eq('id', team.id);
        console.log("Submitted new player to team");
    }

    const [searchResults, setSearchResults] = useState<Player[]>([]);

    const handleSearch = async (searchTerm: string) => {
        // Perform search logic here (e.g., make API call to fetch search results)
        // Update searchResults state with the fetched results
        const { data, error } = await supabase
        .from('players')
        .select()
        .eq('league', sports_league)
        .textSearch('name', searchTerm, {
            type: 'websearch',
            config: 'english'
        })
        const players = data?.map(player => ({
            ...player,
            })) ?? [];
        setSearchResults(players); // Example: Adding the search term to results
    };

    return (
        <div>
        <h1>Search Page</h1>
        <SearchComponent onSearch={handleSearch} />
        <ul>
            {searchResults.map((player, index) => (
            <p>
                <span className="font-bold"> {player.name} </span>
                <span className="text-sm ml-2 text-gray-400">{player.team_name}</span>
                <button onClick={() => UpdatePlayer(player.id)}>+</button>
            </p>
            ))}
        </ul>
        </div>
    );
};

export default SearchPage;