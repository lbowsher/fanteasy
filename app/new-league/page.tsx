import { createClient } from '../utils/supabase/server'
import { redirect } from "next/navigation";
import LeagueCreator from "./league-creator";

export const dynamic = "force-dynamic";

export default async function NewLeague() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }

    return ( 
    <div className="flex-wrap justify-center items-center">
        <LeagueCreator />
    </div>);
}