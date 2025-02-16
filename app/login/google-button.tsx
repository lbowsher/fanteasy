"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import Image from "next/image";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Construct the redirect URL for the OAuth callback
    const redirectTo = window.location.origin + "/auth/callback";
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
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-surface hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <div className="relative w-full max-w-[220px] h-[46px]">
        <Image
          src="/continue-with-google.png"
          alt="Continue with Google"
          fill
          className="object-contain"
          priority
        />
      </div>
      {loading && (
        <span className="ml-2 text-primary-text">Signing in...</span>
      )}
    </button>
  );
}