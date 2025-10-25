# Supabase Auth Implementation

Complete authentication and database implementation for Trillium Massage using Supabase.

## What's Included

This implementation provides:

✅ **Authentication**
- Magic link email authentication (passwordless)
- Cookie-based sessions (httpOnly, secure)
- Admin role management
- Protected routes and components
- Automatic session refresh

✅ **Database**
- PostgreSQL with user profiles
- Row Level Security (RLS)
- Admin email whitelist
- TypeScript types for all tables

✅ **Components**
- Login form
- Auth provider (React context)
- Auth guards for protected routes
- User menu component
- Test page

✅ **API Routes**
- Auth callback handler
- Profile management
- Admin user management
- Role promotion/demotion

✅ **Developer Tools**
- Migration scripts
- Validation scripts
- Comprehensive documentation

## Quick Start

**New to Supabase?** Start here:
- [`SUPABASE_QUICK_START.md`](./SUPABASE_QUICK_START.md) - Get running in 30 minutes

**Want detailed setup?** Read this:
- [`SUPABASE_SETUP_GUIDE.md`](./SUPABASE_SETUP_GUIDE.md) - Complete setup instructions

**Ready to migrate?** Follow this:
- [`SUPABASE_MIGRATION_GUIDE.md`](./SUPABASE_MIGRATION_GUIDE.md) - Step-by-step migration from existing auth

## Documentation Structure

### Setup Guides
- `SUPABASE_QUICK_START.md` - 30-minute quick start
- `SUPABASE_SETUP_GUIDE.md` - Detailed setup guide
- `SUPABASE_MIGRATION_GUIDE.md` - Migration from existing auth

### Integration Guides (Step-by-Step)
Each segment builds on the previous:

1. `SEGMENT_1_INTEGRATION.md` - Setup & Documentation
2. `SEGMENT_2_INTEGRATION.md` - Database Schema
3. `SEGMENT_3_INTEGRATION.md` - Client Utilities
4. `SEGMENT_4_INTEGRATION.md` - Auth Components
5. `SEGMENT_5_INTEGRATION.md` - API Layer

## File Structure

```
massage/
├── lib/supabase/
│   ├── client.ts              # Browser client
│   ├── server.ts              # Server client
│   ├── auth-helpers.ts        # Helper functions
│   └── database.types.ts      # TypeScript types
│
├── components/auth/supabase/
│   ├── SupabaseAuthProvider.tsx   # Auth context
│   ├── LoginForm.tsx              # Login component
│   ├── AuthGuard.tsx              # Route protection
│   └── UserMenu.tsx               # User dropdown
│
├── app/
│   ├── auth/
│   │   ├── supabase-login/       # Login page
│   │   ├── supabase-test/        # Test page
│   │   └── callback/supabase/    # Auth callback
│   │
│   └── api/auth/supabase/
│       ├── profile/              # Profile API
│       └── admin/                # Admin APIs
│
├── supabase/migrations/
│   ├── 20250101000001_initial_schema.sql
│   ├── 20250101000002_auth_functions.sql
│   └── 20250101000003_admin_setup.sql
│
├── scripts/
│   ├── install-supabase.sh       # Installation
│   └── check-supabase-setup.ts   # Validation
│
└── middleware.ts                 # Auth middleware
```

## Key Features

### 1. Magic Link Authentication

Users receive a secure link via email to sign in. No passwords needed.

```tsx
import { signInWithMagicLink } from '@/lib/supabase/auth-helpers'

await signInWithMagicLink('user@example.com')
```

### 2. Role-Based Access Control

Admin vs. user roles managed in database.

```tsx
<AuthGuard requireAdmin>
  <AdminDashboard />
</AuthGuard>
```

### 3. Server + Client Auth

Auth works seamlessly on both server and client.

```tsx
// Server Component
import { isAdmin } from '@/lib/supabase/server'
const admin = await isAdmin()

// Client Component
import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'
const { user, isAdmin } = useAuth()
```

### 4. Type-Safe Database

Full TypeScript types for all database tables.

```tsx
import type { Profile } from '@/lib/supabase/database.types'

const profile: Profile = await supabase
  .from('profiles')
  .select('*')
  .single()
```

### 5. Row Level Security

Database-level security policies.

```sql
-- Users can only see their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js Application                            │
│  ├─ Client Components                           │
│  │  └─ SupabaseAuthProvider                     │
│  │     └─ useAuth() hook                        │
│  │                                               │
│  ├─ Server Components                           │
│  │  └─ getSupabaseServerClient()                │
│  │     └─ getUser(), isAdmin()                  │
│  │                                               │
│  ├─ Middleware                                  │
│  │  └─ Session refresh on each request          │
│  │  └─ Route protection                         │
│  │                                               │
│  └─ API Routes                                  │
│     └─ Server-side auth checks                  │
│     └─ Database queries with RLS                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Supabase Cloud                                 │
│  ├─ Auth Service                                │
│  │  └─ Magic links, sessions, JWT tokens        │
│  │                                               │
│  └─ PostgreSQL Database                         │
│     ├─ auth.users (managed by Supabase)         │
│     └─ public.profiles (your custom table)      │
│        └─ RLS policies enforce security         │
└─────────────────────────────────────────────────┘
```

## Usage Examples

### Protect a Page

```tsx
'use client'

import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is protected</div>
    </AuthGuard>
  )
}
```

### Check Auth State

```tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

export default function MyComponent() {
  const { user, isAdmin, signOut } = useAuth()

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <p>Hello {user.email}</p>
      {isAdmin && <button>Admin Panel</button>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Server-Side Auth Check

```tsx
import { getUser, isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/supabase-login')
  }

  const admin = await isAdmin()

  if (!admin) {
    redirect('/')
  }

  return <div>Admin Dashboard</div>
}
```

### API Route with Auth

```tsx
import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ message: 'Hello ' + user.email })
}
```

## Testing

### Test Page

Visit `/auth/supabase-test` to see:
- Login form
- Auth state
- User/profile objects
- Protected content demo

### Validation Script

```bash
pnpm tsx scripts/check-supabase-setup.ts
```

Checks:
- ✅ Environment variables
- ✅ Supabase connection
- ✅ Database schema
- ✅ Auth configuration

## Migration Path

Your existing app uses token-based auth. Here's how to migrate:

### Phase 1: Coexistence (START HERE)
Add Supabase alongside existing auth. Both work independently.

### Phase 2: Migrate Admin
Update admin pages to use Supabase auth.

### Phase 3: Migrate Users
Update user pages to use Supabase auth.

### Phase 4: Cleanup
Remove old auth code once Supabase is proven.

**See:** [`SUPABASE_MIGRATION_GUIDE.md`](./SUPABASE_MIGRATION_GUIDE.md)

## Security Features

- **httpOnly Cookies**: Sessions can't be stolen via XSS
- **Row Level Security**: Database-level access control
- **Server-Side Validation**: All auth checks happen server-side
- **Automatic Session Refresh**: Middleware keeps sessions alive
- **Email Verification**: Optional email confirmation
- **Rate Limiting**: Built-in protection against abuse

## Support & Resources

### Documentation
- This implementation: See files listed above
- Supabase docs: https://supabase.com/docs
- Next.js + Supabase: https://supabase.com/docs/guides/auth/server-side/nextjs

### Troubleshooting
- Check browser console for errors
- Check Supabase Dashboard → Authentication → Users
- Check Supabase Dashboard → Table Editor → profiles
- Run validation script: `pnpm tsx scripts/check-supabase-setup.ts`

### Getting Help
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Keep your existing variables
GOOGLE_OAUTH_REFRESH=...
GOOGLE_OAUTH_CLIENT_ID=...
# ... etc
```

## Next Steps

1. **Start**: Read `SUPABASE_QUICK_START.md`
2. **Set Up**: Follow setup guide
3. **Test**: Visit `/auth/supabase-test`
4. **Integrate**: Add auth provider to layout
5. **Migrate**: Follow migration guide
6. **Deploy**: Push to production

## License

Same as parent project.

## Questions?

See the integration guides for detailed answers to common questions.
