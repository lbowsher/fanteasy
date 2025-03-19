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
    
    // Check if team is already claimed
    if (team.user_id) {
        return (
            <div className='w-full max-w-xl mx-auto p-6'>
                <div className='flex justify-between px-4 py-6 border border-slate-grey'>
                    <Link className='text-xl font-bold' href={'/'}>Home</Link>
                    <h1 className='text-xl font-bold'>Team Already Claimed</h1>
                    <AuthButtonServer />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">This Team Has Already Been Claimed</h2>
                    <p className="mb-4">
                        The team &quot;{team.name}&quot; has already been claimed by another user.
                    </p>
                    <Link href="/" className="text-liquid-lava hover:opacity-80 transition-opacity">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return <Login invitePath={`/invite/team/${team_id}`} />;
    }

    return (
        <div className='w-full max-w-xl mx-auto'>
            <div className='flex justify-between px-4 py-6 border border-slate-grey'>
                <Link className='text-xl font-bold text-primary-text hover:text-liquid-lava transition-colors' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold text-primary-text'>Team Invite</h1>
                <AuthButtonServer />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center bg-surface p-6 rounded-lg border border-slate-grey">
                <AddToTeam user={user} team_name={team.name} team_id={team_id} />
            </div>
        </div>
    );
}
