// invite/league/[newleagueid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import AddToTeam from './add-to-team';
import { Card, CardContent } from "@/components/ui/card";

export default async function LeagueInvite(props: { params: Promise<{ newleagueid: LeagueID }> }) {
    const params = await props.params;
    const league_id = params.newleagueid;
    const supabase = await createClient();

    // First validate the league ID
    if (!league_id) {
        return (
            <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
                <h1 className="text-xl font-bold mb-4">Invalid Invite Link</h1>
                <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                    Go Back to Home
                </Link>
            </div>
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
            <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
                <h1 className="text-xl font-bold mb-4">Invalid Invite Link</h1>
                <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                    Go Back to Home
                </Link>
            </div>
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
            <div className="w-full max-w-xl mx-auto px-4 py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">No Available Teams</h2>
                        <p className="text-center mb-4 text-muted-foreground">
                            Sorry, there are no available teams in {league.name}. All teams have been claimed.
                        </p>
                        <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                            Return to Home
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto px-4 py-8">
            <Card>
                <CardContent className="flex flex-col items-center p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Join {league.name}</h2>
                        <p className="text-muted-foreground">Select a team to join</p>
                    </div>
                    <AddToTeam user={user} teams={teams} />
                </CardContent>
            </Card>
        </div>
    );
}
