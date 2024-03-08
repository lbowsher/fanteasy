import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import LeagueHome from './league-home';

export const dynamic = "force-dynamic";

export default async function League({ params }: { params: { id: LeagueID } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }
    const leagueId = params.id;
    //const leagueId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if (!leagueId) {
        // Handle the case when leagueId is undefined
        return (
            <>
                <h1>Error, invalid league</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }
    const { data } = await supabase.from('teams')
        .select('*, profiles(*)')
        .eq('league_id', leagueId);
    
    // Might need to change to TeamWithLeague type
    const teams = data?.map(team => ({
        ...team,
        owner: team.profiles?.name
        })) ?? [];

    //console.log(teams);
    return <div className="flex-1 flex justify-center items-center">
        <LeagueHome teams={teams} league_id={params.id}/>
        </div>;
}