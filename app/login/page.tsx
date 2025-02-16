import { createClient } from '../utils/supabase/server';
import { redirect } from "next/navigation";
import GoogleButton from "./google-button";
import MagicLink from './magic-link';
import OneTapComponent from "./one-tap-component";

export const dynamic = "force-dynamic";

export default async function Login() {
    const supabase = await createClient();

    const {data : { session }} = await supabase.auth.getSession();
    
    if (session) {
        redirect('/');
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-surface/50">
        <OneTapComponent />
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center animate-fadeIn">
              <h1 className="text-5xl font-bold text-primary-text mb-3 animate-slideDown">Welcome</h1>
              <p className="text-lg text-secondary-text animate-slideUp">Sign in to continue to Fanteasy</p>
            </div>
            
            <div className="space-y-8 bg-surface/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-xl">
              <div className="w-full">
                <GoogleButton />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-secondary-text">Or continue with email</span>
                </div>
              </div>

              <div className="w-full">
                <MagicLink />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
}