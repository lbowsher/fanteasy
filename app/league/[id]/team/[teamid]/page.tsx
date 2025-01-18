// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import AuthButtonServer from '../../../../auth-button-server'
// import Link from 'next/link';

// import OneTeam from './one-team';
// import SearchPage from './search-page';
// import WeeklyPicks from './weekly-picks';

// export const dynamic = "force-dynamic";

// export default async function Team({ params }: { params: { teamid: TeamID } }) {
//     const supabase = createServerComponentClient<Database>({ cookies });

//     const {data : { session }} = await supabase.auth.getSession();
//     if (!session) {
//         redirect('/login');
//     }
//     const teamId = params.teamid;
//     //const leagueId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
//     if (!teamId) {
//         return (
//             <div className="min-h-screen bg-background">
//                 <div className="max-w-xl mx-auto p-6">
//                     <h1 className="text-primary-text text-2xl font-bold mb-4">Error, invalid team</h1>
//                     <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
//                         Go Back to Home
//                     </Link>
//                 </div>
//             </div>
//         );
//     }
//     const { data } = await supabase.from('teams')
//         .select('*, owner: profiles(full_name), leagues(*)')
//         .eq('id', teamId)
//         .single();
    
//     if (!data) {
//         return <div>Team not found</div>;
//     }
    
//     // const this_team = data?.map(team => ({
//     //     ...team,
//     //     }))?.[0] ?? null;
    
//     // const league = data?.map(team => ({
//     //     league: team.leagues
//     //     }))?.[0].league ?? null;
    
//     // const owner = data?.map(team => ({
//     //     name: Array.isArray(team.owner) ? team.owner[0]: team.owner
//     //     }))?.[0] ?? null;
    
//     // const { data: playerData } = await supabase.from('players')
//     //     .select('*')
//     //     .in('player_id', this_team?.team_players ?? []);

//     // const team_with_players = {
//         //     ...this_team,
//         //     players: playerData ?? []
//         // };
    
//         // const totalTeamScore = team_with_players?.players?.reduce((totalScore: number, player: Player) => totalScore + player.scores.reduce((partialSum: number, score: number) => partialSum + score, 0), 0);
    

//     const team = data;
//     const league = data.leagues;
//     const owner_name = data?.owner?.full_name ?? "";
//     const isNFLPlayoffPickem = league?.scoring_type === 'NFL Playoff Pickem';

//     // For NBA Tournament, fetch players as before
//     let playerData = null;
//     if (!isNFLPlayoffPickem) {
//         const { data: players } = await supabase
//             .from('players')
//             .select('*')
//             .in('player_id', team?.team_players ?? []);
//         playerData = players;
//     }

//     const baseLayout = (content: React.ReactNode) => (
//         <div className="min-h-screen bg-background">
//             <div className="max-w-xl mx-auto">
//                 <nav className="flex justify-between items-center px-6 py-4 border-b border-border">
//                     <Link href="/" className="text-lg font-bold text-primary-text hover:text-accent transition-colors">
//                         Home
//                     </Link>
//                     <Link 
//                         href={`/league/${league?.id}`} 
//                         className="text-lg font-bold text-primary-text hover:text-accent transition-colors"
//                     >
//                         League Home
//                     </Link>
//                     <AuthButtonServer />
//                 </nav>
//                 {content}
//             </div>
//         </div>
//     );

//     // Non-commissioner view
//     if (session.user.id !== league?.commish) {
//         return baseLayout(
//             <div className="p-6">
//                 <div className="mb-6">
//                     <h1 className="text-2xl font-bold text-primary-text mb-2">{team?.name}</h1>
//                     <h2 className="text-secondary-text">{owner_name}</h2>
//                 </div>
//                 {isNFLPlayoffPickem ? (
//                     <WeeklyPicks team={team} currentWeek={1} /> // You'll need to determine the current week
//                 ) : (
//                     <OneTeam team={team_with_players} />
//                 )}
//             </div>
//         );
//     }

//     // Commissioner view
//     return baseLayout(
//         <div className="p-6 bg-surface rounded-lg mt-4">
//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-primary-text text-center mb-2">
//                     {team?.name}
//                 </h1>
//                 <h2 className="text-secondary-text text-center">{owner_name}</h2>
//             </div>
//             {isNFLPlayoffPickem ? (
//                 <>
//                     <WeeklyPicks team={team} currentWeek={1} />
//                     <div className="mt-4 text-secondary-text text-center">
//                         Commissioner View: You can monitor picks here
//                     </div>
//                 </>
//             ) : (
//                 <>
//                     <OneTeam team={team_with_players} />
//                     <div className="mt-8">
//                         <SearchPage team={team_with_players} sports_league={league?.league} />
//                     </div>
//                 </>
//             )}
//         </div>
//     );
//     // if (session.user.id != league?.commish) {
//     //     return (
//     //     <div className='w-full max-w-xl mx-auto text-snow'>
//     //         <div className='flex justify-between px-4 py-6 border border-gray-800 border-t-0'>
//     //             <Link className='text-xl font-bold' href={'/'}>Home</Link>
//     //             <Link className='text-xl font-bold' href={`/league/${league?.id}`}>League Home</Link>
//     //             <AuthButtonServer />
//     //         </div>
//     //         <div className="flex-1 flex flex-col justify-center items-center">
//     //             <h1>{this_team?.name}</h1>
//     //             <h2>{owner?.name?.name}</h2>
//     //             <OneTeam team={team_with_players}/>
//     //         </div>
//     //     </div>)
//     // }
//     // else {
//     //     return (
//     //         <div className='w-full max-w-xl mx-auto'>
//     //             <div className='flex text-snow justify-between px-4 py-6 border border-gray-800 border-t-0'>
//     //                 <Link className='text-xl font-bold' href={'/'}>Home</Link>
//     //                 <Link className='text-xl font-bold' href={`/league/${league?.id}`}>League Home</Link>
//     //                 <AuthButtonServer />
//     //             </div>
//     //             <div className="flex-1 text-snow flex flex-col px-4 bg-gluonGrey">
//     //                 <h1 className='font-bold text-xl text-center'>{this_team?.name}</h1>
//     //                 <h2>{owner?.name?.name}</h2>
//     //                 <OneTeam team={team_with_players}/>
//     //                 <h1 className='text-bold text-xl text-lava text-right'>{totalTeamScore} points</h1>
//     //                 <br></br>
//     //                 <SearchPage team={team_with_players} sports_league={league?.league}></SearchPage>
//     //             </div>
//     //         </div>
//     // )}
//     // <AddPlayerSearch team={teams[0]} sports_league={league?.league}></AddPlayerSearch>
// }


// V2 lets go

// league/[id]/team/[teamid]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../../../auth-button-server';
import Link from 'next/link';
import OneTeam from './one-team';
import SearchPage from './search-page';
import WeeklyPicks from './weekly-picks';
import { calculateTeamTotalScore } from '../../../../utils/scoring';

export const dynamic = "force-dynamic";

export default async function Team({ params }: { params: { teamid: TeamID } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }

    const teamId = params.teamid;
    if (!teamId) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-xl mx-auto p-6">
                    <h1 className="text-primary-text text-2xl font-bold mb-4">Error, invalid team</h1>
                    <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                        Go Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch team data with related profiles and league info
    const { data: team } = await supabase
        .from('teams')
        .select(`
            *,
            owner: profiles(full_name),
            leagues(*),
            players(*)
        `)
        .eq('id', teamId)
        .single();

    if (!team) {
        return <div>Team not found</div>;
    }

    // Get all game stats for the team's players
    const { data: gameStats } = await supabase
        .from('game_stats')
        .select('*')
        .in('player_id', team.players?.map(p => p.id) || []);

    // Calculate total team score based on league scoring rules
    const totalScore = gameStats ? calculateTeamTotalScore(gameStats, team.leagues) : 0;

    const teamWithScores = {
        ...team,
        players: team.players?.map(player => ({
            ...player,
            gameStats: gameStats?.filter(stat => stat.player_id === player.id) || []
        })),
        totalScore
    };

    const baseLayout = (content: React.ReactNode) => (
        <div className="min-h-screen bg-background">
            <div className="max-w-xl mx-auto">
                <nav className="flex justify-between items-center px-6 py-4 border-b border-border">
                    <Link href="/" className="text-lg font-bold text-primary-text hover:text-accent transition-colors">
                        Home
                    </Link>
                    <Link 
                        href={`/league/${team.leagues?.id}`} 
                        className="text-lg font-bold text-primary-text hover:text-accent transition-colors"
                    >
                        League Home
                    </Link>
                    <AuthButtonServer />
                </nav>
                {content}
            </div>
        </div>
    );

    const mainContent = (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-text mb-2">{team.name}</h1>
                <h2 className="text-secondary-text">{team.owner?.full_name || 'Unclaimed'}</h2>
                <div className="mt-4 text-accent font-bold text-xl">
                    Total Score: {totalScore.toFixed(1)}
                </div>
            </div>

            {team.leagues?.scoring_type === 'NFL Playoff Pickem' ? (
                <WeeklyPicks team={teamWithScores} currentWeek={1} />
            ) : (
                <>
                    <OneTeam team={teamWithScores} />
                    {session.user.id === team.leagues?.commish && (
                        <div className="mt-8">
                            <SearchPage 
                                team={teamWithScores} 
                                sports_league={team.leagues?.league} 
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );

    return baseLayout(mainContent);
}