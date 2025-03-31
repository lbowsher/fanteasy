import AuthButtonServer from './auth-button-server'
import ThemeToggle from './theme-toggle'
import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation';
import Teams from './teams';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
    
  if (authError || !user) {
      redirect('/login');
  }

  const { data, error } = await supabase.from('teams')
    .select(`
      *,
      profiles(id, avatar_url),
      leagues(id, name)
    `)
    .eq('user_id', user.id);

  const teams = data?.map(team => ({
    ...team,
    author: team.profiles,
    league: team.leagues
  })) ?? []

  return (
    <div className="w-full max-w-xl mx-auto bg-background text-primary-text">
      <div className="flex justify-between items-center px-4 py-6 border border-border">
        <h1 className="text-xl font-bold">My Teams</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthButtonServer />
        </div>
      </div>
      <div className="flex-1 bg-surface">
        <div className="relative p-4">
          <Link 
            href="/new-league" 
            className="inline-block rounded-lg bg-accent hover:opacity-90 transition-opacity text-white py-2 px-4 absolute top-4 right-4"
          >
            + Create a New League
          </Link>
        </div>
        <Teams teams={teams}/>
      </div>
    </div>
  )
}