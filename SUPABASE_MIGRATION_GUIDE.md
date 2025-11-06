# Complete Supabase Migration Guide

This guide shows step-by-step how to migrate from your current token-based auth system to Supabase.

## Overview

### Current System
```
┌─────────────────────────────────────────────┐
│  Token-Based Auth                           │
│  ├─ AdminAuthManager (HMAC tokens)          │
│  ├─ UserAuthManager (simple tokens)         │
│  ├─ localStorage for sessions               │
│  ├─ Redux authSlice for UI state            │
│  └─ Email-based access links                │
└─────────────────────────────────────────────┘
```

### New System
```
┌─────────────────────────────────────────────┐
│  Supabase Auth                              │
│  ├─ Magic link authentication               │
│  ├─ Cookie-based sessions (httpOnly)        │
│  ├─ Database-backed profiles (PostgreSQL)   │
│  ├─ Row Level Security (RLS)                │
│  ├─ Auth context provider                   │
│  └─ Server + client auth checks             │
└─────────────────────────────────────────────┘
```

## Migration Strategy

We'll migrate in phases to minimize disruption:

1. **Phase 0**: Set up Supabase (Segments 1-2)
2. **Phase 1**: Add Supabase auth alongside existing auth (Segments 3-5)
3. **Phase 2**: Migrate admin pages to Supabase
4. **Phase 3**: Migrate user pages to Supabase
5. **Phase 4**: Update Redux or remove it
6. **Phase 5**: Clean up old auth code

## Phase 0: Setup (Already Complete)

If you've followed Segments 1-5, you should have:
- ✅ Supabase project created
- ✅ Environment variables configured
- ✅ Database schema deployed
- ✅ Client utilities created
- ✅ Auth components built
- ✅ API routes ready

## Phase 1: Coexistence (RECOMMENDED START)

Run both auth systems side-by-side initially.

### Step 1.1: Add Auth Provider to Root Layout

**File:** `app/layout.tsx`

**Current code:**
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Add Supabase provider:**
```tsx
import { SupabaseAuthProvider } from '@/components/auth/supabase/SupabaseAuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </Providers>
      </body>
    </html>
  )
}
```

### Step 1.2: Update Middleware Redirect

**File:** `middleware.ts` (already created in Segment 3)

Change login redirect to point to Supabase login:

```typescript
// Find this line:
url.pathname = '/login'

// Change to:
url.pathname = '/auth/supabase-login'
```

### Step 1.3: Test Supabase Auth

1. Visit `/auth/supabase-test`
2. Try logging in with your email
3. Verify magic link works
4. Confirm you see your profile data

**At this point:** Both auth systems work independently!

## Phase 2: Migrate Admin Pages

### Current Admin Auth Flow

```
lib/adminAuth.ts (AdminAuthManager)
  ↓
components/auth/admin/AdminAuthWrapper.tsx
  ↓
app/admin/* pages
```

### New Admin Auth Flow

```
lib/supabase/server.ts (isAdmin)
  ↓
components/auth/supabase/AuthGuard.tsx
  ↓
app/admin/* pages
```

### Step 2.1: Find Admin Pages

Your admin pages are likely in:
- `app/admin/page.tsx`
- `app/admin/*/page.tsx`

### Step 2.2: Replace AdminAuthWrapper with AuthGuard

**Before:**
```tsx
import { AdminAuthWrapper } from '@/components/auth/admin/AdminAuthWrapper'

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <AdminContent />
    </AdminAuthWrapper>
  )
}
```

**After:**
```tsx
'use client'

import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  )
}
```

### Step 2.3: Update Admin API Calls

**Current admin validation:**
```tsx
const response = await fetch('/api/admin/validate', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**New Supabase approach:**
```tsx
// No need for token in headers - cookies handle it!
const response = await fetch('/api/auth/supabase/profile')
```

### Step 2.4: Update Admin Components Using Auth State

**Before:**
```tsx
import { useSelector } from 'react-redux'

function AdminComponent() {
  const { isAuthenticated, adminEmail } = useSelector((state) => state.auth)
  // ...
}
```

**After:**
```tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

function AdminComponent() {
  const { user, isAdmin } = useAuth()
  // ...
}
```

### Step 2.5: Test Admin Pages

1. Sign out from old auth
2. Sign in with Supabase (as admin)
3. Visit `/admin`
4. Verify all functionality works

## Phase 3: Migrate User Pages

### Current User Auth Flow

```
lib/userAuth.ts (UserAuthManager)
  ↓
app/my_events/page.tsx
```

### New User Auth Flow

```
lib/supabase/server.ts (getUser)
  ↓
components/auth/supabase/AuthGuard.tsx
  ↓
app/my_events/page.tsx
```

### Step 3.1: Update My Events Page

**File:** `app/my_events/page.tsx`

**Before:**
```tsx
// Likely has manual auth check
'use client'

export default function MyEventsPage() {
  // Check UserAuthManager token
  // ...
}
```

**After:**
```tsx
'use client'

import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function MyEventsPage() {
  return (
    <AuthGuard>
      <MyEventsContent />
    </AuthGuard>
  )
}

function MyEventsContent() {
  // Auth is guaranteed here
  return (
    // your existing content
  )
}
```

### Step 3.2: Update User-Specific API Calls

**Before:**
```tsx
const token = UserAuthManager.getToken()
const response = await fetch('/api/user/events', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**After:**
```tsx
// Cookies handle auth automatically
const response = await fetch('/api/user/events')
```

### Step 3.3: Test User Pages

1. Sign in with Supabase (as regular user)
2. Visit `/my_events`
3. Verify functionality works

## Phase 4: Update or Remove Redux Auth Slice

### Option A: Keep Redux, Sync with Supabase

**File:** `redux/slices/authSlice.ts`

Update the slice to use Supabase state:

```tsx
// Add a listener or update from Supabase
import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    isAdmin: false,
  },
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = !!action.payload.user
      state.user = action.payload.user
      state.isAdmin = action.payload.isAdmin
    },
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.isAdmin = false
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
```

Then sync in your auth provider or components.

### Option B: Remove Redux Auth (Recommended)

If you're only using Redux for auth state, you can remove it:

1. Remove auth slice
2. Replace `useSelector` with `useAuth()`
3. Remove Redux provider if not used elsewhere

## Phase 5: Clean Up Old Auth Code

Once everything works with Supabase:

### Files to Remove

```bash
# Old auth managers
rm lib/adminAuth.ts
rm lib/userAuth.ts

# Old admin auth components
rm -rf components/auth/admin/

# Old API routes
rm app/api/admin/validate/route.ts

# Redux auth (if not used for other things)
rm redux/slices/authSlice.ts
```

### Files to Keep

Keep these for reference or if they contain non-auth logic:
- `lib/adminTypes.ts` - May have other types
- Redux store - If used for other state

### Environment Variables

You can remove these after migration:
```bash
# .env.local
# Remove (after verifying nothing else uses them):
GOOGLE_OAUTH_SECRET  # If only used for token signing
ADMIN_EMAILS         # Now in Supabase database
```

Keep these:
```bash
# Still needed for other features
GOOGLE_OAUTH_REFRESH  # For Gmail integration
GOOGLE_OAUTH_CLIENT_ID
OWNER_EMAIL
OWNER_PHONE_NUMBER
NEXT_PUBLIC_POSTHOG_KEY
UPDATE_LOC_PASSWORD
```

## Phase 6: Update PostHog Integration

### Current PostHog Identification

**File:** Look for PostHog `identify` calls

**Before:**
```tsx
posthog.identify(adminEmail, {
  email: adminEmail,
  // ...
})
```

**After:**
```tsx
import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

function MyComponent() {
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        role: profile?.role,
        email_verified: !!user.email_confirmed_at,
      })
    }
  }, [user, profile])
}
```

## Migration Checklist

### Pre-Migration
- [ ] Complete Segments 1-5
- [ ] Supabase project running
- [ ] Database migrations applied
- [ ] At least one admin user set up
- [ ] Test page working (`/auth/supabase-test`)

### Phase 1: Coexistence
- [ ] Add SupabaseAuthProvider to root layout
- [ ] Update middleware redirect
- [ ] Test Supabase login works
- [ ] Verify both auth systems work

### Phase 2: Admin Migration
- [ ] List all admin pages
- [ ] Replace AdminAuthWrapper with AuthGuard
- [ ] Update admin API calls
- [ ] Update admin components using auth state
- [ ] Test all admin functionality

### Phase 3: User Migration
- [ ] Update my_events page
- [ ] Update user API calls
- [ ] Test user functionality

### Phase 4: Redux
- [ ] Decide: keep or remove Redux auth
- [ ] Update or remove auth slice
- [ ] Replace useSelector with useAuth
- [ ] Test all components

### Phase 5: Cleanup
- [ ] Remove old auth files
- [ ] Remove old API routes
- [ ] Update environment variables
- [ ] Remove unused dependencies

### Phase 6: PostHog
- [ ] Update PostHog identify calls
- [ ] Use Supabase user IDs
- [ ] Test analytics tracking

### Post-Migration
- [ ] Test complete user flow
- [ ] Test complete admin flow
- [ ] Verify protected routes work
- [ ] Check auth state persists on refresh
- [ ] Test sign out works
- [ ] Deploy to production

## Comparison: Before vs After

### Authentication Flow

**Before:**
```
1. User clicks email link with HMAC token
2. Token validated against GOOGLE_OAUTH_SECRET
3. Session stored in localStorage
4. Frontend checks token on each page
5. API validates token in headers
```

**After:**
```
1. User clicks magic link from Supabase
2. Supabase validates and creates session
3. Session stored in httpOnly cookies
4. Middleware refreshes session automatically
5. API checks cookies (automatic)
```

### Admin Check

**Before:**
```tsx
const adminEmails = process.env.ADMIN_EMAILS?.split(',')
const isAdmin = adminEmails?.includes(email)
```

**After:**
```tsx
const profile = await getUserProfile()
const isAdmin = profile?.role === 'admin'
```

### Protected Component

**Before:**
```tsx
<AdminAuthWrapper>
  <Component />
</AdminAuthWrapper>
```

**After:**
```tsx
<AuthGuard requireAdmin>
  <Component />
</AuthGuard>
```

### API Call

**Before:**
```tsx
fetch('/api/admin/validate', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**After:**
```tsx
fetch('/api/auth/supabase/profile')
// Cookies sent automatically
```

## Benefits of Migration

### Security
- ✅ httpOnly cookies (can't be stolen by XSS)
- ✅ Row Level Security in database
- ✅ Server-side session validation
- ✅ No tokens in localStorage
- ✅ Automatic session refresh

### Features
- ✅ Built-in email verification
- ✅ Password reset flows
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Real-time auth state updates
- ✅ Multi-device session management

### Developer Experience
- ✅ Less code to maintain
- ✅ Type-safe database queries
- ✅ Auto-generated API documentation
- ✅ Built-in admin dashboard (Supabase)
- ✅ Standardized patterns

### Scalability
- ✅ PostgreSQL database (vs localStorage)
- ✅ Horizontal scaling ready
- ✅ No need to manage JWT secrets
- ✅ Built-in rate limiting
- ✅ CDN-friendly (cookies vs localStorage)

## Rollback Plan

If you need to rollback:

1. **Phase 1-2**: Just stop using Supabase routes, old auth still works
2. **Phase 3**: Revert admin page changes
3. **Phase 4**: Revert user page changes
4. **Phase 5**: Don't delete old files yet

Keep both systems running until you're 100% confident.

## Timeline Estimate

- **Phase 0** (Setup): 30 minutes
- **Phase 1** (Coexistence): 15 minutes
- **Phase 2** (Admin): 1-2 hours (depends on # of pages)
- **Phase 3** (User): 30 minutes
- **Phase 4** (Redux): 30 minutes
- **Phase 5** (Cleanup): 30 minutes
- **Phase 6** (PostHog): 15 minutes

**Total: 4-5 hours** (for a small-medium app)

## Getting Help

### Supabase Resources
- [Docs](https://supabase.com/docs)
- [Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Testing Locally
- Use `/auth/supabase-test` page
- Check browser DevTools → Application → Cookies
- Check Supabase Dashboard → Authentication → Users
- Check Supabase Dashboard → Table Editor → profiles

### Common Issues
- **Magic links not working**: Check email provider config in Supabase
- **Cookies not setting**: Check if using HTTPS in production
- **RLS blocking queries**: Check you're authenticated and policies are correct
- **Admin not working**: Check `admin_emails` table has your email

## Next Steps

1. Start with Phase 1 (coexistence)
2. Test thoroughly in development
3. Migrate one page at a time
4. Keep old auth as fallback initially
5. Once confident, complete migration
6. Deploy to production
7. Clean up old code

Good luck with your migration! 🚀
