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
        <div>
        <h1>Add Players to Roster</h1>
        <SearchComponent onSearch={handleSearch} />
        <ul>
            {searchResults.map((player) => (
            <p key={`${player.id}`}>
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