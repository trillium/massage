# Supabase Quick Start Guide

**TL;DR** - Get Supabase auth running in 30 minutes.

## What You're Getting

- Magic link email authentication
- Database-backed user profiles
- Admin role management
- Protected routes
- Cookie-based sessions

## 5 Quick Steps

### 1️⃣ Install Dependencies (2 min)

```bash
chmod +x scripts/install-supabase.sh
bash scripts/install-supabase.sh
```

### 2️⃣ Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Create new project
4. Save the database password!
5. Wait for project to provision (~2 min)

### 3️⃣ Configure Environment (3 min)

```bash
cp .env.supabase.template .env.local
```

Edit `.env.local` and add:
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Settings → API

### 4️⃣ Run Database Migrations (5 min)

**Option A: Using SQL Editor (Easiest)**

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - Copy `supabase/migrations/20250101000001_initial_schema.sql`
   - Paste in SQL Editor
   - Click Run
   - Repeat for `20250101000002_auth_functions.sql`
   - Repeat for `20250101000003_admin_setup.sql`

**Option B: Using CLI**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 5️⃣ Set Up Your Admin Account (5 min)

In Supabase SQL Editor:

```sql
-- Add your email to admin list
insert into public.admin_emails (email)
values ('your-email@example.com');
```

### Test It! (10 min)

```bash
pnpm dev
```

Visit:
1. http://localhost:3000/auth/supabase-test
2. Enter your email
3. Check your email for magic link
4. Click the link
5. You should be logged in!

### Verify Setup

```bash
pnpm tsx scripts/check-supabase-setup.ts
```

Should show all green checkmarks ✅

## What's Next?

Now you have Supabase auth running alongside your existing auth.

### To Actually Use It:

**Add to your root layout:**

```tsx
// app/layout.tsx
import { SupabaseAuthProvider } from '@/components/auth/supabase/SupabaseAuthProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
```

**Protect a page:**

```tsx
// app/your-page/page.tsx
'use client'

import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function YourPage() {
  return (
    <AuthGuard>
      <YourContent />
    </AuthGuard>
  )
}
```

**Use auth state:**

```tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

function MyComponent() {
  const { user, isAdmin } = useAuth()

  return <div>Hello {user?.email}</div>
}
```

## File Reference

- **Setup**: See `SUPABASE_SETUP_GUIDE.md`
- **Migration**: See `SUPABASE_MIGRATION_GUIDE.md`
- **Integration**: See `SEGMENT_*_INTEGRATION.md` files

## Common Issues

### "Email not sending"
Supabase provides test email service in dev. Check your spam folder.

### "Not seeing admin role"
Make sure:
1. Your email is in `admin_emails` table
2. You signed up AFTER adding your email to the table
3. If you signed up before, update your profile manually

### "Cookies not working"
Check you're on localhost or HTTPS. HTTP cookies won't work in production.

### "RLS blocking my queries"
You need to be authenticated. RLS is working correctly!

## Pro Tips

1. **Test page is your friend**: `/auth/supabase-test` shows everything
2. **Check Supabase dashboard**: See all users, sessions, and data
3. **Use server client for server components**: `getSupabaseServerClient()`
4. **Use browser client for client components**: `getSupabaseBrowserClient()`
5. **Middleware handles session refresh**: No manual refresh needed

## Support

- Check `SUPABASE_SETUP_GUIDE.md` for detailed docs
- Check `SUPABASE_MIGRATION_GUIDE.md` for full migration
- Check Supabase dashboard for user/session info
- Check browser console for errors

Happy coding! 🚀
