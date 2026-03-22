import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation';
import HomeContent from './home-content';
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
      leagues(id, name, created_at)
    `)
    .eq('user_id', user.id);

  const teams = data?.map(team => ({
    ...team,
    author: team.profiles,
    league: team.leagues
  })) ?? []

  return (
    <div className="w-full max-w-xl mx-auto bg-background text-foreground">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold">My Teams</h1>
      </div>
      <div className="flex-1 bg-card">
        <div className="flex justify-end p-4">
          <Link
            href="/new-league"
            className="inline-block rounded-lg bg-accent hover:opacity-90 transition-opacity text-white py-2 px-4"
          >
            + Create a New League
          </Link>
        </div>
        <HomeContent teams={teams}/>
      </div>
    </div>
  )
}