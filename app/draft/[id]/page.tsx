// app/draft/[id]/page.tsx
import { createClient } from '@/app/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import DraftRoom from './draft-room';
import AuthButtonServer from '@/app/auth-button-server';
import ThemeToggle from '@/app/theme-toggle';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function DraftPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        redirect('/login');
    }

    const draftId = resolvedParams.id;
    
    // Get draft settings with league info
    const { data: draftSettings, error: draftError } = await supabase
        .from('draft_settings')
        .select('*, leagues(*)')
        .eq('id', draftId)
        .single();
    
    if (draftError || !draftSettings) {
        return notFound();
    }
    
    // Get user's team in this league
    const { data: userTeam, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', draftSettings.league_id)
        .eq('user_id', user.id)
        .single();
    
    if (teamError && teamError.code !== 'PGRST116') { // Not a "no rows returned" error
        console.error("Error fetching user team:", teamError);
        return <div>Error loading draft room</div>;
    }

    // If user doesn't have a team in this league, check if they're the commissioner
    const isCommissioner = draftSettings.leagues.commish === user.id;
    
    if (!userTeam && !isCommissioner) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-primary-text mb-4">
                    You don&apos;t have access to this draft
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

    // Get all teams in the league for the draft
    const { data: leagueTeams, error: leagueTeamsError } = await supabase
        .from('teams')
        .select('*, profiles(full_name)')
        .eq('league_id', draftSettings.league_id);

    if (leagueTeamsError || !leagueTeams) {
        console.error("Error fetching league teams:", leagueTeamsError);
        return <div>Error loading teams</div>;
    }

    const currentTeam = userTeam || { 
        id: 'commissioner',
        name: 'Commissioner View',
        league_id: draftSettings.league_id
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full max-w-7xl mx-auto px-4">
                <header className="flex justify-between items-center py-6 border-b border-slate-grey">
                    <Link 
                        href={`/league/${draftSettings.league_id}`}
                        className="text-xl font-bold text-primary-text hover:text-liquid-lava transition-colors"
                    >
                        Back to League
                    </Link>
                    <h1 className="text-xl font-bold text-primary-text">
                        {draftSettings.leagues.name} Draft
                    </h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <AuthButtonServer />
                    </div>
                </header>
                
                <main className="py-6">
                    <DraftRoom 
                        draftSettings={draftSettings} 
                        currentTeam={currentTeam} 
                        isCommissioner={isCommissioner}
                        leagueTeams={leagueTeams}
                    />
                </main>
            </div>
        </div>
    );
}