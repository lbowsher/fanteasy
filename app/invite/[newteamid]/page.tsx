"use server";
import { createClient } from "../../utils/supabase/client";
import AuthButtonServer from '../../auth-button-server';
import GoogleButton from '../../login/google-button';
import Link from 'next/link';
import AddToTeam from './add-to-team';


export default async function TeamInvite(props: { params: Promise<{ newteamid: TeamID }> }) {
    const params = await props.params;
    
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return (
        <div className="flex-1 flex justify-center items-center text-4xl font-bold">
        <GoogleButton/>
        </div>);
    }

    const team_id = params.newteamid;
    if (!team_id) {
        return (
            <>
                <h1>Error, invalid invite link, please try again</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }
    else {
        const { data: team } = await supabase.from('teams').select('*').eq('id', team_id).single();
        if (!team) {
            return (
                <>
                    <h1>Error, invalid invite link, please try again</h1>
                    <Link href="/">Go Back to Home</Link>
                </>
            );
        }
        else {

            return (
                <div className='w-full text-snow max-w-xl mx-auto'>
                    <div className='flex justify-between px-4 py-6 border border-slateGrey border-t-0'>
                        <Link className='text-xl font-bold' href={'/'}>Home</Link>
                        <h1 className='text-xl font-bold'>Team Invite</h1>
                        <AuthButtonServer />
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <AddToTeam user={session.user} team_name={team.name} team_id={team_id}></AddToTeam>
                    </div>
                </div>
            );
        }
    }
}
