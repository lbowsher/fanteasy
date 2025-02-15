
import { createClient } from '../utils/supabase/server'
import { redirect } from "next/navigation";
import LeagueCreator from "./league-creator";

export const dynamic = "force-dynamic";

export default async function NewLeague() {
    const supabase = await createClient();

    const {data : { session }} = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }
    


    return ( 
    <div className="flex-wrap justify-center items-center">
        <LeagueCreator user={session.user}/>
    </div>);

}