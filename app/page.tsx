
import AuthButtonServer from './auth-button-server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Teams from './teams';
//import { League } from './global';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {data : { session }} = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data } = await supabase.from('teams')
    .select('*, profiles(*), leagues(*)')
    .eq('user_id', session.user.id);

  const teams = data?.map(team => ({
    ...team,
    author: team.profiles,
    league: team.leagues
  })) ?? []

  //<button onClick={redirect('/new-league')}>Create A League</button>


  return (
    <div className='w-full max-w-xl mx-auto'>
      <div className='flex justify-between px-4 py-6 border border-gray-800 border-t-0'>
          <h1 className='text-xl font-bold'>Home</h1>
          <AuthButtonServer />
      </div>
      <div className='flex-1'>
        <h1 className="">
          <Link href="/new-league">+ Create a New League</Link>
        </h1>
        <h1>My Teams</h1>
          <Teams teams={teams}/>
      </div>
    </div>
  )
}
