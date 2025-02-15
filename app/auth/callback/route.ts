
import { createClient } from '@supabase/supabase-js'


import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
  
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
    }
  
    if (code) {
      const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabase_url, anon_key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
      try {
        await supabase.auth.exchangeCodeForSession(code);
      } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
      }
    }
  
    return NextResponse.redirect(requestUrl.origin);
  }