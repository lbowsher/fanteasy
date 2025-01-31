"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function GoogleButton() {
  const supabase = createClientComponentClient<Database>();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <button onClick={handleSignIn} className="hover:bg-gray-800 p-8 rounded-xl">
      <Image
        src="/continue-with-google.png"
        alt="Continue with Google"
        width={500}
        height={100}
      />
    </button>
  );
}