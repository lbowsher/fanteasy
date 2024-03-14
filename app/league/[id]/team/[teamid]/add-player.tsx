"use server";
import { User, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import {cookies} from 'next/headers';

export const dynamic = "force-dynamic";

export default async function AddPlayerSearch({team, sports_league}: {team: TeamWithOwner, sports_league: LeagueSportsLeague}){
    const supabase = createServerActionClient<Database>({cookies});
    
    const UpdatePlayer =async (playerID: PlayerID) => {
        const new_players = team.players ? [...team.players, playerID] : [playerID];
        await supabase.from('teams').update({players: new_players }).eq('id', team.id);
        console.log("Submitted new player to team");
    }
    const SearchPlayer = async (formData: FormData) => {
        const search_text = String(formData.get('Text'));
        const { data, error } = await supabase
        .from('players')
        .select()
        .eq('league', sports_league)
        .textSearch('name', search_text, {
            type: 'websearch',
            config: 'english'
        })
        const players = data?.map(player => ({
            ...player,
            })) ?? [];
        return players.map(player => (
            <div className="ml-4">
                <p>
                    <span className="font-bold"> {player.name} </span>
                    <span className="text-sm ml-2 text-gray-400">{player.team_name}</span>
                    <button onClick={() => UpdatePlayer(player.id)}>+</button>
                </p>
            </div>
        ))
    }
    // TODO: Add search icon
    return <>
        <form className="border border-gray-800 border-t-0" action={SearchPlayer}>
        <input name="Text" 
        className="bg-inherit flex-1 ml-2 text-2xl placeholder-gray-500 px-2" 
        placeholder="Lebron James"/>
    </form>
    </>
}