"use client";

import { Database } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function GitHubButton() {
  const supabase = createClientComponentClient<Database>();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleSignIn} className="hover:bg-gray-800 p-8 rounded-xl">
      <Image
        src="/continue-with-google.png"
        alt="Continue with Google"
        width={100}
        height={100}
      />
    </button>
  );
}