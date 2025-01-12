import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../auth-button-server'
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
        .select('*, profiles(id, avatar_url, full_name)')
        .eq('league_id', leagueId);
    
    const teamTotalScores = await Promise.all((data || []).map(async (team) => {
        const { data: playerData } = await supabase.from('players')
            .select('*')
            .in('player_id', team.team_players ?? []);
        const totalScores = playerData?.reduce((total, player) => total + player.scores.reduce((sum, score) => sum + score, 0), 0);
        return { teamId: team.id, totalScores };
    }));

    // const teamTotalScores = data?.map(async (team) => {
    //     const { data: playerData } = await supabase.from('players')
    //         .select('*')
    //         .in('player_id', team.team_players ?? []);
    //     const totalScores = playerData?.reduce((total, player) => total + player.scores.reduce((sum, score) => sum + score, 0), 0);
        
        
    // });

    // Might need to change to TeamWithLeague type
    const teams = data?.map(team => ({
        ...team,
        owner: team.profiles?.full_name,
        totalScore: teamTotalScores.find(score => score.teamId === team.id)?.totalScores
        })) ?? [];

    return (
        <div className='w-full max-w-xl mx-auto text-snow border-dustyGrey'>
            <div className='flex justify-between px-4 py-6 border-t-0'>
                <Link className='text-xl font-bold' href={'/'}>Home</Link>
                <h1 className='text-xl font-bold'>League</h1>
                <AuthButtonServer />
            </div>   
            <div className="flex-1 flex flex-col justify-center items-center  bg-gluonGrey">
                <LeagueHome teams={teams} league_id={params.id}/>
            </div>
        </div>);

}