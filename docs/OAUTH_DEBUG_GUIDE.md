# OAuth Debug Guide

## Enhanced Logging for Google OAuth Troubleshooting

### What Changed

We've added comprehensive logging to the OAuth callback flow to help debug authentication issues.

### Where to Check Logs

#### 1. Terminal (Next.js Dev Server)

**Location:** Your terminal running `pnpm dev`

**Log Format:** `[Auth Callback] ...`

**What you'll see:**

```
[Auth Callback] Attempting to exchange code for session
[Auth Callback] Successfully exchanged code for session { userId: '...', email: '...', provider: 'google' }
```

**Or on error:**

```
[Auth Callback] OAuth error received: { error: 'server_error', errorCode: 'unexpected_failure', errorDescription: 'Database error saving new user' }
[Auth Callback] Error exchanging code for session: { error: '...', status: 500, ... }
```

#### 2. Browser Console

**Location:** DevTools → Console (F12)

**What to check:**

- Supabase client errors
- Network request failures
- JavaScript errors from LoginForm

#### 3. Browser Network Tab

**Location:** DevTools → Network

**Watch for:**

- `/auth/v1/authorize?provider=google` - OAuth initiation
- `/auth/callback/supabase?code=...` - Callback with auth code
- Failed requests (red status codes)

#### 4. Supabase Dashboard

**Location:** Supabase Dashboard → Logs → Auth Logs

**Shows:**

- User authentication attempts
- OAuth provider responses
- Token exchange results
- Database trigger errors (like profile creation failures)

### Understanding the Error

Your current error:

```
Database error saving new user
```

This suggests the issue is likely with:

1. **Profile creation trigger** - The `handle_new_user` trigger may be failing
2. **Database permissions** - RLS policies blocking profile insert
3. **Schema mismatch** - Missing columns or constraints

### Next Steps to Debug

1. **Test the auth flow again** to capture detailed logs:

   ```bash
   pnpm dev
   ```

   Then navigate to: `http://localhost:9876/auth/supabase-login`

2. **Check terminal output** for the detailed error logs we just added

3. **Check Supabase Auth logs** for the database-level error

4. **Verify profile trigger** is working:

   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

5. **Test trigger manually** (see `INVESTIGATION_3_test_trigger_manually.md`)

### Log Structure

All logs now include:

- **Timestamp** - When the event occurred
- **Context** - What operation was being performed
- **Details** - Relevant data (userId, email, error details, etc.)

### Error Display

Errors are now shown on the login page with:

- Error code
- Detailed error message
- Helpful hints for common issues (like server_error)

Example:

```
Authentication Error
Database error saving new user

This may be a database configuration issue. Check the server logs for details.
```
