'use client'

import { createClient } from "./utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

export default function AuthButtonClient({ user } : { user: User | null}) {
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

    return user ? (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleSignOut}>Logout</Button>
    ) : (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleSignIn}>Login</Button>
    );
}
