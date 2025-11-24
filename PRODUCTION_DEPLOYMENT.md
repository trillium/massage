# Production Deployment Checklist

Complete guide for deploying Supabase auth to production safely.

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure these are set in your production environment (Vercel, Netlify, etc.):

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # MUST be kept secret!

# Optional - Debug (should NOT be set in production)
# PROXY_DEBUG=true  # Only enable for troubleshooting
```

**Critical:** Never commit `.env.local` to version control. Use your platform's environment variable management.

### 2. Security Verification

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in server-side code (✅ verified in `lib/supabase/server.ts`)
- [ ] Test login page is excluded from production build (✅ configured in `next.config.js`)
- [ ] Debug logging is disabled in production (set `PROXY_DEBUG` only when troubleshooting)
- [ ] No test credentials in production `.env`
- [ ] `.gitignore` includes:
  - `.env.local`
  - `playwright/.auth/`
  - `proxy-debug.log`

### 3. Database Setup

Run migrations on production Supabase instance:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual - Run each migration in order via Supabase Dashboard SQL Editor
# Navigate to: https://app.supabase.com/project/YOUR_PROJECT/sql/new
# Run migrations in order:
# - 20250101000001_initial_schema.sql
# - 20250101000002_auth_functions.sql
# - 20250101000003_admin_setup.sql
# - 20250101000004_add_admin_email.sql
# - 20250101000005_fix_profile_insert.sql
# - 20250111000006_fix_rls_recursion.sql
```

### 4. Create First Admin User

**Method 1: Magic Link (Recommended for Production)**

1. Sign up via your production app at `/auth/supabase-login`
2. Check email and click magic link
3. Run this SQL in Supabase SQL Editor to grant admin role:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

**Method 2: Using Script (Development/Staging Only)**

```bash
# Set your admin email
export ADMIN_EMAIL=your-admin@example.com

# Generate magic link
pnpm admin:generate-link
```

### 5. Test Production Auth Flow

Before going live, test these scenarios:

- [ ] Unauthenticated user can access public pages (`/`, `/about`, etc.)
- [ ] Unauthenticated user redirected from `/admin` to `/auth/supabase-login`
- [ ] Admin can sign in via magic link
- [ ] Admin can access `/admin` routes
- [ ] Regular user cannot access `/admin` (redirected to `/`)
- [ ] Sessions persist across page refreshes
- [ ] Sign out works correctly

## Deployment Steps

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Verify Test Login Page is Excluded**
   - Navigate to `https://your-domain.vercel.app/auth/test-login`
   - Should return 404 or show "Not available in production"
   - If accessible, check `next.config.js` webpack configuration

### Other Platforms (Netlify, Railway, etc.)

1. Set environment variables in platform dashboard
2. Ensure build command: `pnpm build`
3. Ensure start command: `pnpm serve`
4. Deploy

## Post-Deployment Verification

### 1. Test Authentication

```bash
# Test unauthenticated access
curl -I https://your-domain.com/admin
# Should: 307 redirect to /auth/supabase-login

# Test public access
curl -I https://your-domain.com/
# Should: 200 OK
```

### 2. Test Role-Based Access

- Sign in as admin → Access `/admin` ✅
- Sign in as regular user → Access `/admin` redirects to `/` ✅
- Sign out → Access `/admin` redirects to `/auth/supabase-login` ✅

### 3. Monitor for Issues

**Check Logs for:**
- Auth failures
- Unexpected redirects
- Cookie/session errors

**Vercel:**
```bash
vercel logs --prod
```

**Expected:** No errors, minimal logging (unless `PROXY_DEBUG=true`)

## Troubleshooting

### Issue: "Not authenticated" errors

**Check:**
1. Supabase environment variables are set correctly
2. Cookies are being set (check browser DevTools → Application → Cookies)
3. Proxy is not blocking requests (check middleware matcher in `proxy.ts`)

**Debug:**
```bash
# Temporarily enable debug logging
vercel env add PROXY_DEBUG true production
vercel --prod

# Check logs
vercel logs --prod --follow

# IMPORTANT: Disable after troubleshooting
vercel env rm PROXY_DEBUG production
```

### Issue: Admin users can't access admin routes

**Check:**
1. User's profile exists in `profiles` table
2. Profile has `role = 'admin'`

```sql
-- Check user's role
SELECT id, email, role
FROM public.profiles
WHERE email = 'admin@example.com';

-- Grant admin role if needed
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Issue: Sessions expire quickly

**Check Supabase JWT expiry settings:**
- Dashboard → Settings → Auth → JWT Expiry
- Default: 3600 seconds (1 hour)
- Recommended: 3600-86400 (1-24 hours)

### Issue: Test login page is accessible

**This is a security issue!** Fix immediately:

1. Verify `next.config.js` has the ignore-loader configuration:
   ```javascript
   if (!options.dev && options.isServer) {
     config.module.rules.push({
       test: /\/app\/auth\/test-login\/.*$/i,
       loader: 'ignore-loader',
     })
   }
   ```

2. Rebuild and redeploy:
   ```bash
   rm -rf .next
   pnpm build
   vercel --prod
   ```

## Rollback Plan

If you encounter critical issues:

1. **Quick rollback (Vercel)**
   ```bash
   vercel rollback
   ```

2. **Disable auth temporarily**
   - Comment out protected paths in `proxy.ts`:
   ```javascript
   const protectedPaths = [] // ['/admin', '/my_events']
   ```
   - Redeploy

3. **Emergency contact**
   - Have Supabase support email ready
   - Document incident for post-mortem

## Monitoring & Maintenance

### Regular Checks

- [ ] Weekly: Review auth error logs
- [ ] Monthly: Audit admin user list
- [ ] Quarterly: Rotate service role key
- [ ] As needed: Update Supabase dependencies

### Key Metrics to Monitor

- Failed login attempts
- Average session duration
- Admin route access patterns
- Unusual redirect patterns

### Security Best Practices

1. **Rotate Secrets Regularly**
   ```bash
   # Generate new service role key in Supabase dashboard
   # Update in all environments
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

2. **Review RLS Policies**
   - Ensure all tables have appropriate Row Level Security
   - Test policies with different user roles

3. **Monitor for Suspicious Activity**
   - Multiple failed auth attempts
   - Privilege escalation attempts
   - Unusual access patterns

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Playwright E2E Testing Guide](./tests/e2e/README.md)

## Support

If you encounter issues not covered here:

1. Check Supabase Dashboard → Logs
2. Review `proxy.ts` logs (with `PROXY_DEBUG=true`)
3. Test auth flow locally with production environment variables
4. Check Supabase status: https://status.supabase.com/
