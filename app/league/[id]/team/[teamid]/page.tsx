import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../../../auth-button-server'
import Link from 'next/link';

import OneTeam from './one-team';
import SearchPage from './search-page';

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
        // Handle the case when teamId is undefined
        return (
            <>
                <h1>Error, invalid team</h1>
                <Link href="/">Go Back to Home</Link>
            </>
        );
    }
    const { data } = await supabase.from('teams')
        .select('*, owner: profiles(name), leagues(*)')
        .eq('id', teamId);
    
    const this_team = data?.map(team => ({
        ...team,
        }))?.[0] ?? null;
    
    const league = data?.map(team => ({
        league: team.leagues
        }))?.[0].league ?? null;
    
    const owner = data?.map(team => ({
        name: Array.isArray(team.owner) ? team.owner[0]: team.owner
        }))?.[0] ?? null;
    
    const { data: playerData } = await supabase.from('players')
        .select('*')
        .in('player_id', this_team?.team_players ?? []);
    
    const team_with_players = {
        ...this_team,
        players: playerData ?? []
    };

    const backToHome = () => {
        redirect('/');
    };

    const totalTeamScore = team_with_players?.players?.reduce((totalScore: number, player: Player) => totalScore + player.scores.reduce((partialSum: number, score: number) => partialSum + score, 0), 0);

    if (session.user.id != league?.commish) {
        return (
        <div className='w-full max-w-xl mx-auto text-snow'>
            <div className='flex justify-between px-4 py-6 border border-gray-800 border-t-0'>
                <Link className='text-xl font-bold' href={'/'}>Home</Link>
                <Link className='text-xl font-bold' href={`/league/${league?.id}`}>League Home</Link>
                <AuthButtonServer />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <h1>{this_team?.name}</h1>
                <h2>{owner?.name?.name}</h2>
                <OneTeam team={team_with_players}/>
            </div>
        </div>)
    }
    else {
        return (
            <div className='w-full max-w-xl mx-auto'>
                <div className='flex text-snow justify-between px-4 py-6 border border-gray-800 border-t-0'>
                    <Link className='text-xl font-bold' href={'/'}>Home</Link>
                    <Link className='text-xl font-bold' href={`/league/${league?.id}`}>League Home</Link>
                    <AuthButtonServer />
                </div>
                <div className="flex-1 text-snow flex flex-col px-4 bg-gluonGrey">
                    <h1 className='font-bold text-xl text-center'>{this_team?.name}</h1>
                    <h2>{owner?.name?.name}</h2>
                    <OneTeam team={team_with_players}/>
                    <h1 className='text-bold text-xl text-lava text-right'>{totalTeamScore} points</h1>
                    <br></br>
                    <SearchPage team={team_with_players} sports_league={league?.league}></SearchPage>
                </div>
            </div>
    )}
    // <AddPlayerSearch team={teams[0]} sports_league={league?.league}></AddPlayerSearch>
}
