# Segment 3: Supabase Client Utilities - Integration Plan

This guide shows how to integrate Supabase client utilities into your Next.js application.

## What This Segment Provides

**New Files Created:**
- `lib/supabase/client.ts` - Browser client for Client Components
- `lib/supabase/server.ts` - Server client for Server Components & API Routes
- `middleware.ts` - Auth middleware for route protection
- `lib/supabase/auth-helpers.ts` - Convenience functions for auth operations

**No Existing Files Modified** ✅

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Your Next.js App                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Client Components ('use client')                      │
│  └─ lib/supabase/client.ts                             │
│     └─ Creates browser client (singleton)              │
│     └─ Manages auth state in browser                   │
│                                                         │
│  Server Components & API Routes                        │
│  └─ lib/supabase/server.ts                             │
│     └─ Creates server client per request               │
│     └─ Reads/writes cookies for sessions               │
│     └─ Admin client for elevated ops                   │
│                                                         │
│  Middleware (runs on every request)                    │
│  └─ middleware.ts                                       │
│     └─ Refreshes auth tokens                           │
│     └─ Protects routes (/admin, /my_events)            │
│     └─ Updates cookies                                  │
│                                                         │
│  Helper Functions                                       │
│  └─ lib/supabase/auth-helpers.ts                       │
│     └─ signInWithMagicLink(), signOut(), etc.          │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Supabase Cloud
```

## Integration Steps

### Step 1: Understand the Files

**No code changes needed yet!** Just understand what each file does:

#### `lib/supabase/client.ts`
- **Use in**: Client Components (with `'use client'`)
- **Purpose**: Auth UI, user interactions
- **Example usage**: Login forms, user menu, auth state

```typescript
import { supabase } from '@/lib/supabase/client'

// In a client component
const { data: { user } } = await supabase.auth.getUser()
```

#### `lib/supabase/server.ts`
- **Use in**: Server Components, API Routes, Server Actions
- **Purpose**: Server-side data fetching, auth checks
- **Example usage**: Protected pages, admin operations

```typescript
import { getSupabaseServerClient, isAdmin } from '@/lib/supabase/server'

// In a server component
const supabase = await getSupabaseServerClient()
const admin = await isAdmin()
```

#### `middleware.ts`
- **Runs automatically** on every request
- **Purpose**: Session management, route protection
- **Protected routes**: `/admin`, `/my_events`
- **Redirects** unauthenticated users to `/login`

#### `lib/supabase/auth-helpers.ts`
- **Use in**: Client Components
- **Purpose**: Simplified auth operations
- **Example usage**: Login/logout buttons, forms

```typescript
import { signInWithMagicLink, signOut } from '@/lib/supabase/auth-helpers'

await signInWithMagicLink('user@example.com')
await signOut()
```

### Step 2: Test Middleware (Optional)

The middleware is already working! Test it:

1. Make sure your dev server is running: `pnpm dev`
2. Visit http://localhost:3000/admin
3. You should be redirected to `/login` (404 for now, which is expected)

This proves middleware is protecting routes.

### Step 3: Verify Imports Work

Create a simple test component to verify everything imports correctly:

```typescript
// Create this anywhere temporarily to test
import { supabase } from '@/lib/supabase/client'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { signInWithMagicLink } from '@/lib/supabase/auth-helpers'

// If no TypeScript errors, you're good!
```

### Step 4: Understanding Route Protection

The middleware protects these routes automatically:

| Route | Protection | Redirect |
|-------|-----------|----------|
| `/admin` | Admins only | → `/login` (if not logged in)<br>→`/` (if logged in but not admin) |
| `/my_events` | Authenticated users | → `/login` (if not logged in) |
| Other routes | Public | No redirect |

### Step 5: Customize Protected Routes (Optional)

Want to protect different routes? Edit `middleware.ts`:

```typescript
// In middleware.ts, find these lines:
const protectedPaths = ['/admin', '/my_events']
const adminPaths = ['/admin']

// Add your routes:
const protectedPaths = ['/admin', '/my_events', '/profile', '/settings']
const adminPaths = ['/admin', '/admin-dashboard']
```

## File Changes Required for Integration

### To Actually Use Supabase Auth

These files will need changes in future segments:

1. **Create login page** (Segment 4)
   - Create `app/login/page.tsx`
   - Use `signInWithMagicLink()` helper

2. **Create auth callback** (Segment 5)
   - Create `app/auth/callback/supabase/route.ts`
   - Handles magic link redirects

3. **Update admin pages** (Later integration)
   - Change `app/admin/*` to use `getSupabaseServerClient()`
   - Replace `AdminAuthManager` checks with `isAdmin()`

4. **Update my_events** (Later integration)
   - Change `app/my_events/*` to use Supabase auth
   - Replace `UserAuthManager` with Supabase session

5. **Update Redux** (Later integration)
   - Replace `authSlice` with Supabase auth state
   - Or use auth context (provided in Segment 4)

### Files That Won't Need Changes

- Your existing pages (until you want to migrate them)
- Your existing components (until you want to use Supabase)
- Your existing API routes (until you want Supabase auth)

**Everything is backwards compatible!**

## Testing the Clients

### Test Browser Client

Create a temporary client component:

```typescript
// app/test-auth/page.tsx
'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function TestAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div>
      <h1>Auth Test</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
```

Visit: http://localhost:3000/test-auth

Should show: `null` (not logged in yet)

### Test Server Client

Create a temporary server component:

```typescript
// app/test-server-auth/page.tsx
import { getUser, isAdmin } from '@/lib/supabase/server'

export default async function TestServerAuth() {
  const user = await getUser()
  const admin = await isAdmin()

  return (
    <div>
      <h1>Server Auth Test</h1>
      <p>User: {user?.email || 'Not logged in'}</p>
      <p>Is Admin: {admin ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

Visit: http://localhost:3000/test-server-auth

Should show: "Not logged in", "Is Admin: No"

## Common Patterns

### Pattern 1: Check Auth in Client Component

```typescript
'use client'

import { getClientUser } from '@/lib/supabase/auth-helpers'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    getClientUser().then(setUser)
  }, [])

  if (!user) return <div>Please log in</div>

  return <div>Hello {user.email}</div>
}
```

### Pattern 2: Check Auth in Server Component

```typescript
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Hello {user.email}</div>
}
```

### Pattern 3: Admin-Only Server Component

```typescript
import { isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/')
  }

  return <div>Admin Dashboard</div>
}
```

### Pattern 4: Listen to Auth Changes

```typescript
'use client'

import { onAuthStateChange } from '@/lib/supabase/auth-helpers'
import { useEffect } from 'react'

export default function MyComponent() {
  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      console.log('Session:', session)
    })

    return () => unsubscribe()
  }, [])

  return <div>Listening to auth changes...</div>
}
```

## What's Next

After completing this segment, you'll have:
- ✅ Supabase clients ready to use
- ✅ Middleware protecting routes
- ✅ Auth helper functions available
- ✅ TypeScript types for safety

Next segments will use these clients:
- **Segment 4**: Auth UI components (login, guards, provider)
- **Segment 5**: API routes and callbacks
- **Segment 6**: Full integration plan for existing code

## Troubleshooting

### Middleware not redirecting
- Make sure `middleware.ts` is in the root of your project
- Check the `config.matcher` includes your route
- Restart dev server: `pnpm dev`

### TypeScript errors on imports
- Make sure dependencies are installed: `pnpm install`
- Check environment variables are set in `.env.local`
- Restart TypeScript server in your IDE

### "createServerClient is not a function"
- Make sure you installed `@supabase/ssr`: `pnpm add @supabase/ssr`
- Clear `.next` folder: `rm -rf .next` and restart dev server

### Cookies not being set
- This is normal in Server Components
- Middleware handles cookie refresh
- Cookies are set on actual auth operations (login/signup)

## Rollback Plan

To remove this segment:

```bash
# Remove files
rm lib/supabase/client.ts
rm lib/supabase/server.ts
rm lib/supabase/auth-helpers.ts
rm middleware.ts
rm SEGMENT_3_INTEGRATION.md
```

## Notes

- All clients are type-safe using `database.types.ts`
- Middleware runs on every request (very fast, ~1-2ms)
- Browser client is a singleton (created once)
- Server client is created per request (stateless)
- Admin client bypasses RLS (use carefully!)

## Time Estimate

- **Reading & understanding**: 10 minutes
- **Testing**: 5 minutes
- **Total**: ~15 minutes

This segment requires no integration work - just understanding the tools available!
