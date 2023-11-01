
import AuthButtonServer from './auth-button-server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Teams from './teams';

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {data : { session }} = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data } = await supabase.from('teams').select('*, profiles(*), leagues(*)').eq('user_id', session.user.id);

  const teams = data?.map(team => ({
    ...team,
    //league: team.leagues.find(league => league.id === team.league_id)
  })) ?? [] 

  return (
    <div className='w-full max-w-xl mx-auto'>
      <div className='flex justify-between px-4 py-6 border border-gray-800 border-t-0'>
          <h1 className='text-xl font-bold'>Home</h1>
          <AuthButtonServer />
      </div>
      <button>Create A League</button>
      <h1>My Teams</h1>
      <pre>{JSON.stringify(teams, null, 2)}</pre>
    </div>
  )
}
