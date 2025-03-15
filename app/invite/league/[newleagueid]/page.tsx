// invite/league/[newleagueid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import AuthButtonServer from '../../../auth-button-server';
import Link from 'next/link';
import AddToTeam from './add-to-team';
import Login from '../../../login/page';

export default async function LeagueInvite(props: { params: Promise<{ newleagueid: LeagueID }> }) {
    const params = await props.params;
    const league_id = params.newleagueid;
    const supabase = await createClient();

    // First validate the league ID
    if (!league_id) {
        return (
            <>
                <h1>Error, invalid invite link, please try again</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }

    // Get league info
    const { data: league } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', league_id)
        .single();

    if (!league) {
        return (
            <>
                <h1>Error, invalid invite link, please try again</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return <Login invitePath={`/invite/league/${league_id}`} />;
    }

    // Find the first unclaimed team in the league, sorted by name
    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', league_id)
        .is('user_id', null)
        .order('name', { ascending: true })
        .limit(1);

    if (!teams || teams.length === 0) {
        return (
            <div className='w-full text-snow max-w-xl mx-auto'>
                <div className='flex justify-between px-4 py-6 border border-slateGrey border-t-0'>
                    <Link className='text-xl font-bold' href={'/'}>Home</Link>
                    <h1 className='text-xl font-bold'>League Invite</h1>
                    <AuthButtonServer />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <h2 className="text-2xl font-bold mb-4">No Available Teams</h2>
                    <p className="text-center mb-4">
                        Sorry, there are no available teams in {league.name}. All teams have been claimed.
                    </p>
                    <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const team = teams[0];

    return (
        <div className='w-full text-snow max-w-xl mx-auto'>
            <div className='flex justify-between px-4 py-6 border border-slateGrey border-t-0'>
                <Link className='text-xl font-bold' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold'>League Invite</h1>
                <AuthButtonServer />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Join {league.name}</h2>
                    <p className="text-secondary-text">You've been invited to join as {team.name}</p>
                </div>
                <AddToTeam user={user} team_name={team.name} team_id={team.id}></AddToTeam>
            </div>
        </div>
    );
}
