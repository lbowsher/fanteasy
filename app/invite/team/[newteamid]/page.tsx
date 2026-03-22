// invite/team/[newteamid]
"use server";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import AddToTeam from './add-to-team';
import { Card, CardContent } from "@/components/ui/card";

export default async function TeamInvite(props: { params: Promise<{ newteamid: TeamID }> }) {
    const params = await props.params;
    const team_id = params.newteamid;
    const supabase = await createClient();

    // First validate the team ID
    if (!team_id) {
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
        redirect(`/login?next=/invite/team/${team_id}`);
    }

    const { data: team } = await supabase.from('teams').select('*').eq('id', team_id).single();
    if (!team) {
        return (
            <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
                <h1 className="text-xl font-bold mb-4">Invalid Invite Link</h1>
                <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                    Go Back to Home
                </Link>
            </div>
        );
    }

    // Check if team is already claimed
    if (team.user_id) {
        return (
            <div className="w-full max-w-xl mx-auto px-4 py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Team Already Claimed</h2>
                        <p className="mb-4 text-muted-foreground">
                            The team &quot;{team.name}&quot; has already been claimed by another user.
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
                    <AddToTeam user={user} team_name={team.name} team_id={team_id} />
                </CardContent>
            </Card>
        </div>
    );
}
