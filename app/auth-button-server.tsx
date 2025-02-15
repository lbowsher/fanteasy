import { createClient } from "./utils/supabase/server";
import AuthButtonClient from "./auth-button-client";

export const dynamic = "force-dynamic";

export default async function AuthButtonServer() {
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    return <AuthButtonClient session={session} />;
}