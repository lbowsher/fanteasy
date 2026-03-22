// invite/league/[newleagueid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import AuthButtonServer from '../../../auth-button-server';
import ThemeToggle from '../../../theme-toggle';
import Link from 'next/link';
import AddToTeam from './add-to-team';

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

    // Check auth BEFORE any DB queries so the session is resolved for RLS
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        // Middleware should redirect unauthenticated users, but fallback just in case
        redirect(`/login?next=/invite/league/${league_id}`);
    }

    // Get league info (requires authenticated session for RLS)
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

    // Find all unclaimed teams in the league, sorted by name
    const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', league_id)
        .is('user_id', null)
        .order('name', { ascending: true });

    if (!teams || teams.length === 0) {
        return (
            <div className='w-full max-w-xl mx-auto'>
                <div className='flex justify-between px-4 py-6 border border-border'>
                    <Link className='text-xl font-bold text-foreground hover:text-accent transition-colors' href={'/'}>Home</Link>
                    <h1 className='text-xl font-bold text-foreground'>League Invite</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <AuthButtonServer />
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-8 bg-card rounded-lg border border-border mt-4">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">No Available Teams</h2>
                    <p className="text-center mb-4 text-muted-foreground">
                        Sorry, there are no available teams in {league.name}. All teams have been claimed.
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
            <div className='flex justify-between px-4 py-6 border border-border'>
                <Link className='text-xl font-bold text-foreground hover:text-accent transition-colors' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold text-foreground'>League Invite</h1>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <AuthButtonServer />
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-card rounded-lg border border-border mt-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">Join {league.name}</h2>
                    <p className="text-muted-foreground">Select a team to join</p>
                </div>
                <AddToTeam user={user} teams={teams} />
            </div>
        </div>
    );
}
