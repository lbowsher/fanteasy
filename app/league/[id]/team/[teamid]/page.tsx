import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import OneTeam from './one-team';
import SearchPage from './search-page';

export const dynamic = "force-dynamic";

export default async function Team({ params }: { params: { teamid: TeamID } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }
    const teamId = params.teamid;
    //const leagueId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if (!teamId) {
        // Handle the case when leagueId is undefined
        return (
            <>
                <h1>Error, invalid team</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }
    const { data } = await supabase.from('teams')
        .select('*, owner: profiles(name), leagues(*)')
        .eq('id', teamId);
    
    const this_team = data?.map(team => ({
        ...team,
        players: []
        //players: team.players.filter(player => team.team_players?.includes(player.player_id))
        }))?.[0] ?? null;
    
    const league = data?.map(team => ({
        league: team.leagues
        }))?.[0].league ?? null;
    
    const owner = data?.map(team => ({
        name: Array.isArray(team.owner) ? team.owner[0]: team.owner
        }))?.[0] ?? null;
    
    const { data: playerData } = await supabase.from('players')
        .select('*')
        .in('player_id', this_team?.team_players ?? []);
    
    const team_with_players = {
        ...this_team,
        players: playerData ?? []
    };

    if (session.user.id != league?.commish) {
        return <div className="flex-1 flex justify-center items-center">
        <OneTeam team={this_team}/>
        </div>
    }
    else {
        return <div className="flex-1 flex flex-col justify-center items-center">
            <h1>{this_team?.name}</h1>
            <h2>{owner?.name?.name}</h2>
            <OneTeam team={team_with_players}/>
            <br></br>
            <SearchPage team={team_with_players} sports_league={league?.league}></SearchPage>
            </div>
    }
    // <AddPlayerSearch team={teams[0]} sports_league={league?.league}></AddPlayerSearch>
}
