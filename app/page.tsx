import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation';
import HomeContent from './home-content';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      leagues(id, name, created_at, league)
    `)
    .eq('user_id', user.id);

  const teams = data?.map(team => ({
    ...team,
    author: team.profiles,
    league: team.leagues
  })) ?? []

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <Button asChild>
          <Link href="/new-league">
            <Plus size={16} />
            New League
          </Link>
        </Button>
      </div>
      <HomeContent teams={teams}/>
    </div>
  )
}
