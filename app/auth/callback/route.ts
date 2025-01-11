
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// export async function GET (request: NextRequest){
//     const requestUrl = new URL(request.url);
//     const code = requestUrl.searchParams.get('code');

//     if (code) {
//         const supabase = createRouteHandlerClient<Database>({ cookies });
//         await supabase.auth.exchangeCodeForSession(code);
//     }

//     return NextResponse.redirect(requestUrl.origin);
// }

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
  
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
    }
  
    if (code) {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      try {
        await supabase.auth.exchangeCodeForSession(code);
      } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
      }
    }
  
    return NextResponse.redirect(requestUrl.origin);
  }