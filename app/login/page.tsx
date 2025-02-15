import { createClient } from '../utils/supabase/server';
import { redirect } from "next/navigation";
import GoogleButton from "./google-button";
import { create } from 'lodash';

export const dynamic = "force-dynamic";


export default async function Login() {
    const supabase = await createClient();

    const {data : { session }} = await supabase.auth.getSession();
    
    if (session) {
        redirect('/');
    }

    // TODO: style this better
    // TODO: probably wanna switch to personalized google sign in eventually
    
    return <div className="flex-1 flex justify-center items-center text-4xl font-bold">
        <GoogleButton/>
        </div>;
}