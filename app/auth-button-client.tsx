'use client'

import { createClient } from "./utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import type { Session } from "@supabase/supabase-js";

export default function AuthButtonClient({ session } : { session: Session | null}) {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`
            }
        });
    };

    return session ? (
        <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={handleSignOut}>Logout</Button>
    ) : (
        <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={handleSignIn}>Login</Button>
    );
}
