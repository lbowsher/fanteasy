"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function MagicLink() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleMagicLinkSignIn = async () => {
    setLoading(true);
    // Construct the redirect URL (adjust if needed)
    const redirectTo = window.location.origin + "/auth/callback";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // set this to false if you do NOT want users to be automatically signed up
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error.message);
      setMessage("Error: " + error.message);
    } else {
      setMessage("Magic link sent! Please check your email.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleMagicLinkSignIn}
          disabled={loading || !email}
          className="w-full px-4 py-2 rounded-lg bg-accent text-snow font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </div>
      {message && (
        <p className="text-sm text-secondary-text text-center">
          {message}
        </p>
      )}
    </div>
  );
}