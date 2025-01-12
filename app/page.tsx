
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

  // First, let's check if we can get just the teams
  // const teamsOnly = await supabase.from('teams')
  //   .select('*')
  //   .eq('user_id', session.user.id);
  // console.log("Teams only query:", teamsOnly.data, teamsOnly.error);

  // // Then check leagues separately
  // const leagues = await supabase.from('leagues')
  //   .select('*');
  // console.log("All leagues:", leagues.data, leagues.error);

  // // Check profiles separately
  // const profiles = await supabase.from('profiles')
  //   .select('*')
  //   .eq('id', session.user.id);
  // console.log("Profile:", profiles.data, profiles.error);

  // Now try the full join with error logging
  const { data, error } = await supabase.from('teams')
    .select(`
      *,
      profiles(id, avatar_url),
      leagues(id, name)
    `)
    .eq('user_id', session.user.id);

  console.log("Full join error:", error);
  console.log("Full join data:", data);
  console.log("Session user id:", session.user.id);
  console.log("Raw data from query:", data);

  const teams = data?.map(team => ({
    ...team,
    author: team.profiles,
    league: team.leagues
  })) ?? []

  //<button onClick={redirect('/new-league')}>Create A League</button>


  return (
    <div className='w-full max-w-xl mx-auto text-snow'>
      <div className='flex justify-between px-4 py-6 border-b border-slateGrey'>
          <h1 className='text-xl font-bold'>My Teams</h1>
          <AuthButtonServer />
      </div>
      <div className='flex-1 bg-gluonGrey'>
        <div className="relative">
            <a className="rounded-full bg-lava text-snow py-2 px-4 absolute top-4 right-4">
              <Link href="/new-league">+ Create a New League</Link>
            </a>
        </div>
        <Teams teams={teams}/>
      </div>
    </div>
  )
}
