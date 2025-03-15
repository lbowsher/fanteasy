// league/[id]/page.tsx
import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../auth-button-server';
import Link from 'next/link';
import LeagueHome from './league-home';
import { calculateTeamTotalScore } from '../../utils/scoring';

export const dynamic = "force-dynamic";

export default async function League(props: { params: Promise<{ id: LeagueID }> }) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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

    const isCommissioner = user.id === leagueData.commish;

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
                            isCommissioner={isCommissioner}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}