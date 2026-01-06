# Supabase Migration Checklist

After migrating your Supabase database, ensure the following are configured correctly:

## 1. Environment Variables

Verify your `.env.local` file (or your deployment environment variables) contain the correct values from your **new** Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
```

**How to find these:**
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" and "anon public" key

## 2. Redirect URLs (Site URL)

In your Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URLs to the **Redirect URLs** list:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)
3. Set the **Site URL** to your production domain (or `http://localhost:3000` for local dev)

## 3. Email Templates

1. Go to **Authentication** → **Email Templates**
2. Verify that email templates are configured (especially the "Magic Link" template)
3. Check that the email redirect URL in templates matches your redirect URL

## 4. CORS Configuration

1. Go to **Settings** → **API**
2. Verify CORS settings allow your domain
3. For local development, ensure `http://localhost:3000` is allowed

## 5. Auth Providers

If you're using OAuth providers (like Google):
1. Go to **Authentication** → **Providers**
2. Reconfigure any OAuth providers with new credentials if needed
3. Update redirect URLs for OAuth callbacks

## 6. Database Connection

Verify your database connection string if you're using direct database access:
- Check **Settings** → **Database** → **Connection string**

## Common "Load failed" Error Causes

The "Load failed" error typically indicates:

1. **Wrong Supabase URL**: The `NEXT_PUBLIC_SUPABASE_URL` points to the old project
2. **Wrong Anon Key**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is from the old project
3. **Missing Environment Variables**: Variables not set or not loaded properly
4. **CORS Issues**: Your domain not whitelisted in the new project
5. **Network Issues**: Firewall or network blocking the connection

## Testing After Migration

1. Restart your development server after updating environment variables
2. Clear browser cache and cookies
3. Test the magic link flow
4. Check browser console for detailed error messages
5. Check Supabase dashboard logs: **Logs** → **Auth Logs**

## Quick Verification

Run this in your browser console on your app:

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

If these are `undefined` or show old values, your environment variables aren't loaded correctly.

