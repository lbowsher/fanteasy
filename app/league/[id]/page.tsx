// league/[id]/page.tsx
import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../auth-button-server';
import ThemeToggle from '../../theme-toggle';
import Link from 'next/link';
import LeagueHome from './league-home';
import { calculatePlayerScore } from '../../utils/scoring';

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
            return { teamId: team.id, totalScore: 0, weeklyScores: {} as Record<number, number> };
        }

        let allRelevantPlayerIds = [...playerIds];
        let gameStats = [];

        // Handle different scoring types
        let totalScore = 0;
        const weeklyScores: Record<number, number> = {};

        if (leagueData.scoring_type === 'NFL Playoff Pickem') {
            // For playoff pickem, we need to get the weekly picks WITH week_number
            const { data: weeklyPicks } = await supabase
                .from('weekly_picks')
                .select('player_id, week_number')
                .eq('team_id', team.id);

            if (weeklyPicks && weeklyPicks.length > 0) {
                const weeklyPickPlayerIds = weeklyPicks.map(pick => pick.player_id).filter(Boolean);

                // Get stats and positions for picked players
                const [{ data: stats }, { data: players }] = await Promise.all([
                    supabase
                        .from('game_stats')
                        .select('*')
                        .in('player_id', weeklyPickPlayerIds),
                    supabase
                        .from('players')
                        .select('id, position')
                        .in('id', weeklyPickPlayerIds)
                ]);

                // Create position map
                const playerPositions: Record<string, string> = {};
                (players || []).forEach((p: { id: string; position: string }) => {
                    playerPositions[p.id] = p.position;
                });

                // Group stats by week-player key
                const statsByWeekPlayer: Record<string, GameStats[]> = {};
                (stats || []).forEach((stat: GameStats) => {
                    const key = `${stat.week_number}-${stat.player_id}`;
                    if (!statsByWeekPlayer[key]) {
                        statsByWeekPlayer[key] = [];
                    }
                    statsByWeekPlayer[key].push(stat);
                });

                // Calculate score for each weekly pick using only matching week's stats
                // Also track scores by week
                weeklyPicks.forEach(pick => {
                    const key = `${pick.week_number}-${pick.player_id}`;
                    const playerStats = statsByWeekPlayer[key] || [];
                    const position = playerPositions[pick.player_id];
                    const playerScore = calculatePlayerScore(playerStats, leagueData, position);

                    // Add to weekly total
                    if (!weeklyScores[pick.week_number]) {
                        weeklyScores[pick.week_number] = 0;
                    }
                    weeklyScores[pick.week_number] += playerScore;
                    totalScore += playerScore;
                });
            }
        } else {
            // Non-pickem scoring: get game stats and player positions for all relevant players
            if (allRelevantPlayerIds.length > 0) {
                const [{ data: stats }, { data: players }] = await Promise.all([
                    supabase
                        .from('game_stats')
                        .select('*')
                        .in('player_id', allRelevantPlayerIds),
                    supabase
                        .from('players')
                        .select('id, position')
                        .in('id', allRelevantPlayerIds)
                ]);

                gameStats = stats || [];

                // Create a map of player_id to position
                const playerPositions: Record<string, string> = {};
                (players || []).forEach((p: { id: string; position: string }) => {
                    playerPositions[p.id] = p.position;
                });

                // Group stats by player_id and week_number
                const statsByPlayerAndWeek: Record<string, Record<number, GameStats[]>> = {};
                gameStats.forEach((stat: GameStats) => {
                    if (!statsByPlayerAndWeek[stat.player_id]) {
                        statsByPlayerAndWeek[stat.player_id] = {};
                    }
                    if (!statsByPlayerAndWeek[stat.player_id][stat.week_number]) {
                        statsByPlayerAndWeek[stat.player_id][stat.week_number] = [];
                    }
                    statsByPlayerAndWeek[stat.player_id][stat.week_number].push(stat);
                });

                // Calculate weekly and total scores
                Object.entries(statsByPlayerAndWeek).forEach(([playerId, weekStats]) => {
                    const position = playerPositions[playerId];
                    Object.entries(weekStats).forEach(([weekNum, stats]) => {
                        const weekNumber = parseInt(weekNum);
                        const weekScore = calculatePlayerScore(stats, leagueData, position);
                        if (!weeklyScores[weekNumber]) {
                            weeklyScores[weekNumber] = 0;
                        }
                        weeklyScores[weekNumber] += weekScore;
                        totalScore += weekScore;
                    });
                });
            }
        }

        return {
            teamId: team.id,
            totalScore,
            weeklyScores
        };
    }));

    // Collect all weeks that have scores across all teams
    const allWeeks = new Set<number>();
    teamScores.forEach(ts => {
        Object.keys(ts.weeklyScores).forEach(week => allWeeks.add(parseInt(week)));
    });
    const sortedWeeks = Array.from(allWeeks).sort((a, b) => a - b);

    const teams = teamsData.map(team => {
        const scoreData = teamScores.find(score => score.teamId === team.id);
        return {
            ...team,
            owner: team.profiles?.full_name,
            totalScore: scoreData?.totalScore || 0,
            weeklyScores: scoreData?.weeklyScores || {}
        };
    });

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
                            weeks={sortedWeeks}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}