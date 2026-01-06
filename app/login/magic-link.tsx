"use client";

import { useState, FormEvent } from "react";
import { createClient } from "../utils/supabase/client";
import "../utils/supabase/debug"; // Load debug utility

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function MagicLink({ redirectPath }: { redirectPath?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const supabase = createClient();

  const validateEmail = (email: string) => {
    if (!email) {
      setValidationError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setValidationError("");
    }
  };

  const handleMagicLinkSignIn = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email || loading) return;
    
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    setMessage("");
    // Construct the redirect URL (adjust if needed)
    const redirectTo = window.location.origin + "/auth/callback" + (redirectPath ? `?next=${redirectPath}` : '');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // set this to false if you do NOT want users to be automatically signed up
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Error sending magic link:", {
        message: error.message,
        status: error.status,
        name: error.name,
        fullError: error,
      });
      
      // Provide helpful debugging info for API key errors
      if (error.message.includes("Invalid API key") || error.message.includes("API key")) {
        console.error("API Key Debug Info:", {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
          keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
          keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        });
        console.log("💡 Run window.__debugSupabase() in the console for more details");
        console.log("💡 Common issues:");
        console.log("   1. Wrong key (using service_role instead of anon key)");
        console.log("   2. Extra spaces/quotes in .env.local");
        console.log("   3. Key from wrong Supabase project");
        console.log("   4. Dev server not restarted after changing .env.local");
        setMessage("Error: Invalid API key. Check console for details. Run window.__debugSupabase() for more info.");
      } else {
        setMessage("Error: " + error.message);
      }
    } else {
      setMessage("Magic link sent! Please check your email.");
      setEmail(""); // Clear the email field after successful send
      setValidationError(""); // Clear any validation errors
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleMagicLinkSignIn} className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => email && validateEmail(email)}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg border ${
              validationError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-accent'
            } bg-surface text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 transition-all duration-200`}
            required
            pattern={EMAIL_REGEX.source}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent"></div>
            </div>
          )}
        </div>
        {validationError && (
          <p className="text-sm text-red-500 animate-fadeIn">
            {validationError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !email || !!validationError}
          className="w-full px-4 py-3 rounded-lg bg-accent text-snow font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"} text-center animate-fadeIn`}>
          {message}
        </p>
      )}
    </form>
  );
}