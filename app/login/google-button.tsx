"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function GoogleButton({ redirectPath }: { redirectPath?: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Construct the redirect URL for the OAuth callback
    const redirectTo = window.location.origin + "/auth/callback" + (redirectPath ? `?next=${redirectPath}` : '');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    if (error) {
      console.error("Error signing in with Google:", error.message);
      setLoading(false);
    }
    // After this call, the OAuth flow will redirect the user automatically
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-auto py-3 px-4"
    >
      <div className="relative w-full max-w-[280px] h-[52px]">
        <Image
          src="/continue-with-google.png"
          alt="Continue with Google"
          fill
          className="object-contain"
          priority
        />
      </div>
      {loading && (
        <span className="ml-2 text-foreground">Signing in...</span>
      )}
    </Button>
  );
}
