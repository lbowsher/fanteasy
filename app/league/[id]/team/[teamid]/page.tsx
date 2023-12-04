import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import MyTeam from './my-team';

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
        .select('*')
        .eq('id', teamId);
    
    const team = data? data[0] : null


    return <div className="flex-1 flex justify-center items-center">
        <MyTeam team={team}/>
        </div>;
}