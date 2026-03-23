// V2 lets go

// league/[id]/team/[teamid]/page.tsx
import { createClient } from "../../../../utils/supabase/server";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import OneTeam from './one-team';
import SearchPage from './search-page';
import PlayoffWeeklyPicks from './playoff-weekly-picks';
import { calculatePlayerScore } from '../../../../utils/scoring';
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
            <div className="max-w-xl mx-auto p-6">
                <h1 className="text-foreground text-2xl font-bold mb-4">Error, invalid team</h1>
                <Link href="/" className="text-accent hover:opacity-80 transition-opacity">
                    Go Back to Home
                </Link>
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

    // Calculate total team score based on league scoring rules with proper position handling
    let totalScore = 0;
    if (gameStats && gameStats.length > 0) {
        // Create a map of player_id to position from weekly picks
        const playerPositions: Record<string, string> = {};
        weeklyPicks?.forEach(pick => {
            if (pick.players?.position) {
                playerPositions[pick.player_id] = pick.players.position;
            }
        });

        // Group stats by player_id
        const statsByPlayer: Record<string, GameStats[]> = {};
        gameStats.forEach((stat: GameStats) => {
            if (!statsByPlayer[stat.player_id]) {
                statsByPlayer[stat.player_id] = [];
            }
            statsByPlayer[stat.player_id].push(stat);
        });

        // Calculate total score with proper position handling
        totalScore = Object.entries(statsByPlayer).reduce((total, [playerId, playerStats]) => {
            const position = playerPositions[playerId];
            return total + calculatePlayerScore(playerStats, team.leagues, position);
        }, 0);
    }

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
    
    // For NCAAM leagues, fetch eliminated status from ncaa_team_info
    let eliminatedTeams: Set<string> = new Set();
    if (team.leagues?.league === 'NCAAM' && players && players.length > 0) {
        const teamNames = [...new Set(players.map(p => p.team_name))];
        const { data: teamInfos } = await supabase
            .from('ncaa_team_info')
            .select('team_name, eliminated')
            .in('team_name', teamNames)
            .eq('eliminated', true);
        (teamInfos || []).forEach(t => eliminatedTeams.add(t.team_name));
    }

    // Map game stats to respective players
    const playersWithStats = players?.map(player => {
        const playerGameStats = allPlayersGameStats?.filter(stat => stat.player_id === player.id) || [];
        return {
            ...player,
            eliminated: team.leagues?.league === 'NCAAM' ? eliminatedTeams.has(player.team_name) : (player.eliminated ?? false),
            gameStats: playerGameStats
        };
    }) || [];
    
    const teamWithPlayers = {
        ...team,
        players: playersWithStats || [],
        leagues: team.leagues // Ensure leagues is properly passed to the OneTeam component
    };

    const isOwner = user.id === team.user_id;
    const isCommissioner = user.id === team.leagues?.commish;
    const isAuthorized = isOwner || isCommissioner;

    return (
        <div className="w-full max-w-xl mx-auto px-4">
            <div className="py-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href={`/league/${team.leagues?.id}`} className="hover:text-foreground transition-colors">
                        {team.leagues?.name || 'League'}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{team.name}</span>
                </div>
                <TeamHeader team={team} isAuthorized={isAuthorized} isOwner={isOwner} isCommissioner={isCommissioner} />
                <h2 className="text-muted-foreground">{teamData.owner?.full_name || 'Unclaimed'}</h2>
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
}