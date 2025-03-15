// invite/team/[newteamid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import AuthButtonServer from '../../../auth-button-server';
import Link from 'next/link';
import AddToTeam from './add-to-team';
import Login from '../../../login/page';

export default async function TeamInvite(props: { params: Promise<{ newteamid: TeamID }> }) {
    const params = await props.params;
    const team_id = params.newteamid;
    const supabase = await createClient();

    // First validate the team ID
    if (!team_id) {
        return (
            <>
                <h1>Error, invalid invite link, please try again</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }

    const { data: team } = await supabase.from('teams').select('*').eq('id', team_id).single();
    if (!team) {
        return (
            <>
                <h1>Error, invalid invite link, please try again</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return <Login invitePath={`/invite/team/${team_id}`} />;
    }

    return (
        <div className='w-full text-snow max-w-xl mx-auto'>
            <div className='flex justify-between px-4 py-6 border border-slateGrey border-t-0'>
                <Link className='text-xl font-bold' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold'>Team Invite</h1>
                <AuthButtonServer />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <AddToTeam user={user} team_name={team.name} team_id={team_id}></AddToTeam>
            </div>
        </div>
    );
}
