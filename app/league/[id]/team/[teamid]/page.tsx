// V2 lets go

// league/[id]/team/[teamid]/page.tsx
import { createClient } from "../../../../utils/supabase/server";
import { redirect } from 'next/navigation';
import AuthButtonServer from '../../../../auth-button-server';
import ThemeToggle from '../../../../theme-toggle';
import Link from 'next/link';
import OneTeam from './one-team';
import SearchPage from './search-page';
import PlayoffWeeklyPicks from './playoff-weekly-picks';
import { calculateTeamTotalScore } from '../../../../utils/scoring';
import TeamHeader from './team-header';

export const dynamic = "force-dynamic";

export default async function Team(props: { params: Promise<{ teamid: TeamID }> }) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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
        .select('*, owner: profiles(full_name), leagues(*)')
        .eq('id', teamId)
        .single() as { data: TeamWithRelations };

    if (!team) {
        console.log('Team data:', team);
        return <div>Team not found</div>;
    }

    // Get the player IDs from the team.team_players
    const playerIds = team.team_players || [];
    
    // Fetch the actual player data using the player IDs
    const { data: players } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);

    // First fetch weekly picks for this team
    const { data: weeklyPicks } = await supabase
        .from('weekly_picks')
        .select(`
            *,
            players(*)
        `)
        .eq('team_id', teamId);

    if (!weeklyPicks) {
        console.log('No weekly picks found for team');
    }

    // Get all game stats for the weekly picked players
    const { data: gameStats } = await supabase
        .from('game_stats')
        .select('*')
        .in('player_id', weeklyPicks?.map(pick => pick.player_id) || []);

    // Also get game stats for all players on the team
    const { data: allPlayersGameStats } = await supabase
        .from('game_stats')
        .select('*')
        .in('player_id', playerIds);

    // Calculate total team score based on league scoring rules
    const totalScore = gameStats ? calculateTeamTotalScore(gameStats, team.leagues) : 0;

    const teamData = {
        team: team,
        owner: team.owner,
        league: team.leagues,
        weeklyPicks: weeklyPicks?.map(pick => ({
            ...pick,
            player: pick.players
        })) || [],
        totalScore: totalScore
    };

    const teamWithScores = {
        ...team,
        weeklyPicks,
        totalScore
    };
    
    // Map game stats to respective players
    const playersWithStats = players?.map(player => {
        const playerGameStats = allPlayersGameStats?.filter(stat => stat.player_id === player.id) || [];
        return {
            ...player,
            gameStats: playerGameStats
        };
    }) || [];
    
    const teamWithPlayers = {
        ...team,
        players: playersWithStats || [],
        leagues: team.leagues // Ensure leagues is properly passed to the OneTeam component
    };

    const isOwner = user.id === team.user_id;
    const isAuthorized = isOwner || user.id === team.leagues?.commish;

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
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <AuthButtonServer />
                    </div>
                </nav>
                {content}
            </div>
        </div>
    );

    const mainContent = (
        <div className="p-6">
            <div className="mb-6">
                <TeamHeader team={team} isAuthorized={isAuthorized} isOwner={isOwner} />
                <h2 className="text-secondary-text">{teamData.owner?.full_name || 'Unclaimed'}</h2>
            </div>

            {teamData.league?.scoring_type === 'NFL Playoff Pickem' ? (
                <PlayoffWeeklyPicks
                    teamData={teamData}
                    currentWeek={1}
                    numWeeks={teamData.league.num_weeks}
                    isAuthorized={isAuthorized}
                    season={teamData.league?.created_at ? String(new Date(teamData.league.created_at).getFullYear()) : '2026'}
                />
            ) : (
                <>
                    <OneTeam team={teamWithPlayers} />
                    {user.id === team.leagues?.commish && (
                        <div className="mt-8">
                            <SearchPage
                                team={teamWithScores}
                                sports_league={team.leagues?.league}
                                year={team.leagues?.created_at ? String(new Date(team.leagues.created_at).getFullYear()) : '2026'}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );

    return baseLayout(mainContent);
}