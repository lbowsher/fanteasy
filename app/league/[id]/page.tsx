// league/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../auth-button-server';
import Link from 'next/link';
import LeagueHome from './league-home';
import { calculateTeamTotalScore } from '../../utils/scoring';

export const dynamic = "force-dynamic";

export default async function League({ params }: { params: { id: LeagueID } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }

    const leagueId = params.id;
    if (!leagueId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-primary-text mb-4">
                    Error: Invalid League
                </h1>
                <Link 
                    href="/" 
                    className="text-liquid-lava hover:opacity-80 transition-opacity font-medium"
                >
                    Go Back to Home
                </Link>
            </div>
        );
    }

    // Get league info including scoring rules
    const { data: leagueData } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

    if (!leagueData) {
        return <div>League not found</div>;
    }

    // Get teams with profiles
    const { data: teamsData } = await supabase
        .from('teams')
        .select('*, profiles(id, avatar_url, full_name)')
        .eq('league_id', leagueId);

    if (!teamsData) {
        return <div>No teams found</div>;
    }

    // Get all game stats for the league's teams
    const teamTotalScores = await Promise.all(teamsData.map(async (team) => {
        // Get all players for the team
        const { data: players } = await supabase
            .from('players')
            .select('id')
            .eq('team_id', team.id);

        if (!players?.length) {
            return { teamId: team.id, totalScore: 0 };
        }

        // Get game stats for all players
        const { data: gameStats } = await supabase
            .from('game_stats')
            .select('*')
            .in('player_id', players.map(p => p.id));

        const totalScore = gameStats ? calculateTeamTotalScore(gameStats, leagueData) : 0;

        return { teamId: team.id, totalScore };
    }));

    const teams = teamsData.map(team => ({
        ...team,
        owner: team.profiles?.full_name,
        totalScore: teamTotalScores.find(score => score.teamId === team.id)?.totalScore || 0
    }));
    console.log("=================");
    console.log("League Page Render:", leagueId);
    console.log("Teams:", teams.length);
    console.log("=================");

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full max-w-4xl mx-auto px-4">
                <header className="flex justify-between items-center py-6 border-b border-slate-grey">
                    <Link 
                        href="/" 
                        className="text-xl font-bold text-primary-text hover:text-liquid-lava transition-colors"
                    >
                        Home
                    </Link>
                    <h1 className="text-xl font-bold text-primary-text">
                        {leagueData.name}
                    </h1>
                    <AuthButtonServer />
                </header>
                
                <main className="py-8">
                    <div className="bg-surface rounded-xl p-6 shadow-lg">
                        <LeagueHome 
                            teams={teams} 
                            league_id={params.id} 
                            league={leagueData}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

// export default async function League({ params }: { params: { id: LeagueID } }) {
//     const supabase = createServerComponentClient<Database>({ cookies });

//     const {data : { session }} = await supabase.auth.getSession();
//     if (!session) {
//         redirect('/login');
//     }
//     const leagueId = params.id;
//     if (!leagueId) {
//         return (
//             <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
//                 <h1 className="text-2xl font-bold text-primary-text mb-4">
//                     Error: Invalid League
//                 </h1>
//                 <Link 
//                     href="/" 
//                     className="text-liquid-lava hover:opacity-80 transition-opacity font-medium"
//                 >
//                     Go Back to Home
//                 </Link>
//             </div>
//         );
//     }
//     const { data } = await supabase.from('teams')
//         .select('*, profiles(id, avatar_url, full_name)')
//         .eq('league_id', leagueId);
    
//     const teamTotalScores = await Promise.all((data || []).map(async (team) => {
//         const { data: playerData } = await supabase.from('players')
//             .select('*')
//             .in('player_id', team.team_players ?? []);
//         const totalScores = playerData?.reduce((total, player) => total + player.scores.reduce((sum, score) => sum + score, 0), 0);
//         return { teamId: team.id, totalScores };
//     }));

//     // const teamTotalScores = data?.map(async (team) => {
//     //     const { data: playerData } = await supabase.from('players')
//     //         .select('*')
//     //         .in('player_id', team.team_players ?? []);
//     //     const totalScores = playerData?.reduce((total, player) => total + player.scores.reduce((sum, score) => sum + score, 0), 0);
        
        
//     // });

//     // Might need to change to TeamWithLeague type
//     const teams = data?.map(team => ({
//         ...team,
//         owner: team.profiles?.full_name,
//         totalScore: teamTotalScores.find(score => score.teamId === team.id)?.totalScores
//         })) ?? [];

//     return (
//         <div className="min-h-screen bg-background">
//             <div className="w-full max-w-4xl mx-auto px-4">
//                 <header className="flex justify-between items-center py-6 border-b border-slate-grey">
//                     <Link 
//                         href="/" 
//                         className="text-xl font-bold text-primary-text hover:text-liquid-lava transition-colors"
//                     >
//                         Home
//                     </Link>
//                     <h1 className="text-xl font-bold text-primary-text">League</h1>
//                     <AuthButtonServer />
//                 </header>
                
//                 <main className="py-8">
//                     <div className="bg-surface rounded-xl p-6 shadow-lg">
//                         <LeagueHome teams={teams} league_id={params.id} />
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );

// }