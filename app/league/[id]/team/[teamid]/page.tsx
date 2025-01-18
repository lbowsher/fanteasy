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
                <WeeklyPicks 
                    team={teamWithScores} 
                    currentWeek={1} 
                    numWeeks={team.leagues.num_weeks} 
                />
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