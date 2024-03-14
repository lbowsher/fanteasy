import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import OneTeam from './one-team';
import AddPlayerSearch from './add-player';
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
        .select('*, profiles(name), leagues(*)')
        .eq('id', teamId);
    
    const teams = data?.map(team => ({
        ...team,
        owner: team.profiles?.name
        })) ?? [];
    const leagues = data?.map(team => ({
        league: team.leagues
        })) ?? [];
    const league = leagues? leagues[0].league : null

    if (session.user.id != league?.commish) {
        return <div className="flex-1 flex justify-center items-center">
        <OneTeam team={teams[0]}/>
        </div>
    }
    else {
        return <div className="flex-1 flex justify-center items-center">
            <OneTeam team={teams[0]}/>
            <br></br>
            <SearchPage team={teams[0]} sports_league={league?.league}></SearchPage>
            </div>
    }
    // <AddPlayerSearch team={teams[0]} sports_league={league?.league}></AddPlayerSearch>
}