/**
 * Debug utility to verify Supabase configuration
 * Use this in browser console: window.__debugSupabase()
 */
export function debugSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const info = {
    hasUrl: !!url,
    hasKey: !!key,
    url: url ? `${url.substring(0, 30)}...` : 'MISSING',
    keyPrefix: key ? `${key.substring(0, 20)}...` : 'MISSING',
    keyLength: key?.length || 0,
    keyStartsWith: key?.substring(0, 7) || 'N/A',
    // Anon keys typically start with 'eyJ' (base64 encoded JWT)
    isValidFormat: key?.startsWith('eyJ') || false,
  };

  console.log('Supabase Configuration Debug:', info);
  
  if (!url || !key) {
    console.error('❌ Missing environment variables!');
    console.log('Make sure .env.local contains:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=...');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  } else if (!info.isValidFormat) {
    console.warn('⚠️ API key format looks unusual. Anon keys typically start with "eyJ"');
  } else {
    console.log('✅ Environment variables are present and formatted correctly');
  }

  return info;
}

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).__debugSupabase = debugSupabaseConfig;
}


