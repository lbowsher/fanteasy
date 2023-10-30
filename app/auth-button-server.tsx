import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonClient from "./auth-button-client";

export const dynamic = "force-dynamic";

export default async function AuthButtonServer(){
    const supabase = createServerComponentClient({ cookies }); //Todo: add databse type later
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return <AuthButtonClient session={session}/>
}