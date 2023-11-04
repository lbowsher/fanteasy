
import { createServerActionClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeagueCreator from "./league-creator";


export const dynamic = "force-dynamic";

export default function NewLeague() {
    //const supabase = createServerComponentClient<Database>({ cookies }); 

    //const {data : { session }} = await supabase.auth.getSession();
    


    return ( 
    <div className="flex-1 justify-center items-center">
        <LeagueCreator/>
    </div>);

}