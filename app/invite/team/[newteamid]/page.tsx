// invite/team/[newteamid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import AuthButtonServer from '../../../auth-button-server';
import ThemeToggle from '../../../theme-toggle';
import Link from 'next/link';
import AddToTeam from './add-to-team';

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

    // Check auth BEFORE any DB queries so the session is resolved for RLS
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        // Middleware should redirect unauthenticated users, but fallback just in case
        redirect(`/login?next=/invite/team/${team_id}`);
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
                <div className='flex justify-between px-4 py-6 border border-border'>
                    <Link className='text-xl font-bold text-foreground hover:text-accent transition-colors' href={'/'}>Home</Link>
                    <h1 className='text-xl font-bold text-foreground'>Team Already Claimed</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <AuthButtonServer />
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-border mt-4">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">This Team Has Already Been Claimed</h2>
                    <p className="mb-4 text-muted-foreground">
                        The team &quot;{team.name}&quot; has already been claimed by another user.
                    </p>
                    <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full max-w-xl mx-auto'>
            <div className='flex justify-between px-4 py-6 border border-slate-grey'>
                <Link className='text-xl font-bold text-foreground hover:text-liquid-lava transition-colors' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold text-foreground'>Team Invite</h1>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <AuthButtonServer />
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center bg-card p-6 rounded-lg border border-slate-grey">
                <AddToTeam user={user} team_name={team.name} team_id={team_id} />
            </div>
        </div>
    );
}
