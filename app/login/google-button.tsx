"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Construct the redirect URL for the OAuth callback
    const redirectTo = window.location.origin + "/auth/callback";
    console.log(redirectTo)
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
      className="btn btn-primary"
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
// <Image
// src="/continue-with-google.png"
// alt="Continue with Google"
// width={500}
// height={100}
// />