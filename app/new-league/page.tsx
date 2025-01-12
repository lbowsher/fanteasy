
import { createServerActionClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeagueCreator from "./league-creator";
import Link from 'next/link';


export const dynamic = "force-dynamic";

export default async function NewLeague() {
    const supabase = createServerComponentClient<Database>({ cookies }); 

    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }
    


    return ( 
    <div className="flex-wrap justify-center items-center">
        <LeagueCreator user={session.user}/>
    </div>);

}