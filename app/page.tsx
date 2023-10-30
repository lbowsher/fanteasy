
import AuthButtonServer from './auth-button-server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies }); // TODO: add database type in here

  const {data : { session }} = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className='flex justify-between px-4 py-6 border border-gray-800 border-t-0'>
        <h1 className='text-xl font-bold'>Home</h1>
        <AuthButtonServer />
      </div>
  )
}
