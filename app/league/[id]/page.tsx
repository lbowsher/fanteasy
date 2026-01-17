// league/[id]/page.tsx
import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../auth-button-server';
import ThemeToggle from '../../theme-toggle';
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

    // Get draft settings for the league
    const { data: draftSettingsData } = await supabase
        .from('draft_settings')
        .select('*')
        .eq('league_id', leagueId)
        .single();

    // Get teams with profiles
    const { data: teamsData } = await supabase
        .from('teams')
        .select('*, profiles(id, avatar_url, full_name)')
        .eq('league_id', leagueId);

    if (!teamsData) {
        return <div>No teams found</div>;
    }

    // Get all team player IDs and weekly picks in a single operation to reduce database queries
    const teamScores = await Promise.all(teamsData.map(async (team) => {
        // First, get all player IDs from the team roster
        const playerIds = team.team_players || [];
        
        if (playerIds.length === 0 && leagueData.scoring_type !== 'NFL Playoff Pickem') {
            console.log('No players found for team:', team.name);
            return { teamId: team.id, totalScore: 0 };
        }
        
        let allRelevantPlayerIds = [...playerIds];
        let gameStats = [];
        
        // Handle different scoring types
        if (leagueData.scoring_type === 'NFL Playoff Pickem') {
            // For playoff pickem, we need to get the weekly picks
            const { data: weeklyPicks } = await supabase
                .from('weekly_picks')
                .select('player_id')
                .eq('team_id', team.id);
                
            // Add weekly pick player IDs to the relevant players list
            if (weeklyPicks && weeklyPicks.length > 0) {
                const weeklyPickPlayerIds = weeklyPicks.map(pick => pick.player_id).filter(Boolean);
                allRelevantPlayerIds = [...allRelevantPlayerIds, ...weeklyPickPlayerIds];
            }
        }
        
        // Get game stats for all relevant players
        if (allRelevantPlayerIds.length > 0) {
            const { data: stats } = await supabase
                .from('game_stats')
                .select('*')
                .in('player_id', allRelevantPlayerIds);
                
            gameStats = stats || [];
        }
        
        // Calculate total score using the game stats and league scoring rules
        const totalScore = gameStats.length > 0 ? calculateTeamTotalScore(gameStats, leagueData) : 0;
        
        return { 
            teamId: team.id, 
            totalScore 
        };
    }));

    const teams = teamsData.map(team => ({
        ...team,
        owner: team.profiles?.full_name,
        totalScore: teamScores.find(score => score.teamId === team.id)?.totalScore || 0
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
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <AuthButtonServer />
                    </div>
                </header>
                
                <main className="py-8">
                    <div className="bg-surface rounded-xl p-6 shadow-lg">
                        <LeagueHome
                            teams={teams}
                            league_id={params.id}
                            league={leagueData}
                            draftSettings={draftSettingsData}
                            isCommissioner={isCommissioner}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}