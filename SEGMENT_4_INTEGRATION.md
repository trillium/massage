# Segment 4: Auth Components - Integration Plan

This guide shows how to integrate Supabase auth components into your application.

## What This Segment Provides

**New Files Created:**
- `components/auth/supabase/SupabaseAuthProvider.tsx` - Auth context provider
- `components/auth/supabase/LoginForm.tsx` - Magic link login form
- `components/auth/supabase/AuthGuard.tsx` - Route protection component
- `components/auth/supabase/UserMenu.tsx` - User dropdown menu
- `app/auth/supabase-login/page.tsx` - Standalone login page
- `app/auth/supabase-test/page.tsx` - Test page for all components

**No Existing Files Modified** ✅

## Components Overview

### 1. SupabaseAuthProvider

**What it does:**
- Provides auth state to your entire app
- Listens for auth changes (login, logout, etc.)
- Fetches user profile from database
- Provides `useAuth()` hook

**Usage:**
```tsx
import { SupabaseAuthProvider, useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

// Wrap your app
<SupabaseAuthProvider>
  <YourApp />
</SupabaseAuthProvider>

// Use in any component
function MyComponent() {
  const { user, profile, isAdmin, signOut } = useAuth()
  // ...
}
```

### 2. LoginForm

**What it does:**
- Sends magic link to user's email
- Shows success message
- Handles errors gracefully

**Usage:**
```tsx
import { LoginForm } from '@/components/auth/supabase/LoginForm'

<LoginForm
  redirectTo="/admin"
  onSuccess={() => console.log('Email sent!')}
/>
```

### 3. AuthGuard

**What it does:**
- Protects components from unauthorized access
- Shows loading state
- Redirects to login if not authenticated
- Can require admin role

**Usage:**
```tsx
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Or for admin-only:
<AuthGuard requireAdmin>
  <AdminContent />
</AuthGuard>
```

### 4. UserMenu

**What it does:**
- Shows user email and avatar
- Displays admin badge if admin
- Provides sign-out button
- Dropdown with user info

**Usage:**
```tsx
import { UserMenu } from '@/components/auth/supabase/UserMenu'

<UserMenu />
```

## Test the Components

### Step 1: Visit the Test Page

Start your dev server and visit:
```
http://localhost:3000/auth/supabase-test
```

This page demonstrates:
- Login form
- Auth state display
- User menu
- Protected content
- Admin-only content

### Step 2: Try Logging In

1. Enter your email (make sure it's in `admin_emails` table if you want admin access)
2. Click "Send magic link"
3. Check your email
4. Click the link in the email
5. You'll be redirected back and logged in!

**Note:** For this to work, you need to configure email in Supabase:
- Go to Supabase Dashboard → Authentication → Email Templates
- Supabase provides a development email service for testing

### Step 3: Observe the State Changes

After logging in on the test page, you'll see:
- User object populated
- Profile object from database
- Session object with JWT token
- Protected content revealed
- Admin content (if you're admin)

## Integration Steps

### Option A: Wrap Your Entire App (Recommended)

Edit your root layout to wrap everything with the auth provider:

**File to modify:** `app/layout.tsx`

```tsx
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

Now `useAuth()` works in any component!

### Option B: Wrap Specific Pages

If you only want Supabase auth on certain pages:

```tsx
// app/admin/page.tsx
import { SupabaseAuthProvider } from '@/components/auth/supabase/SupabaseAuthProvider'
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function AdminPage() {
  return (
    <SupabaseAuthProvider>
      <AuthGuard requireAdmin>
        <AdminContent />
      </AuthGuard>
    </SupabaseAuthProvider>
  )
}
```

## Using the Components

### Example 1: Simple Protected Page

```tsx
// app/profile/page.tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { user, profile } = useAuth()

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {profile?.role}</p>
    </div>
  )
}
```

### Example 2: Admin Dashboard

```tsx
// app/admin/page.tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminDashboard />
    </AuthGuard>
  )
}

function AdminDashboard() {
  const { profile } = useAuth()

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin {profile?.email}</p>
    </div>
  )
}
```

### Example 3: Navigation with User Menu

```tsx
// components/Navigation.tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'
import { UserMenu } from '@/components/auth/supabase/UserMenu'
import Link from 'next/link'

export function Navigation() {
  const { user, isAdmin } = useAuth()

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        {user && <Link href="/my-events">My Events</Link>}
        {isAdmin && <Link href="/admin">Admin</Link>}
      </div>

      <div>
        {user ? (
          <UserMenu />
        ) : (
          <Link href="/auth/supabase-login">Sign In</Link>
        )}
      </div>
    </nav>
  )
}
```

### Example 4: Conditional Rendering

```tsx
'use client'

import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

export function MyComponent() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in to continue</div>
  }

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      {isAdmin && <button>Admin Actions</button>}
    </div>
  )
}
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  App Layout (Root)                                  │
│  └─ <SupabaseAuthProvider>                         │
│     └─ Makes useAuth() available everywhere         │
├─────────────────────────────────────────────────────┤
│  Pages                                              │
│  ├─ /auth/supabase-login                           │
│  │  └─ <LoginForm />                               │
│  │                                                  │
│  ├─ /admin                                          │
│  │  └─ <AuthGuard requireAdmin>                    │
│  │     └─ Admin content                            │
│  │                                                  │
│  └─ /my-events                                      │
│     └─ <AuthGuard>                                  │
│        └─ User content                              │
├─────────────────────────────────────────────────────┤
│  Components                                         │
│  └─ <UserMenu />                                    │
│     └─ Shows in navbar when logged in              │
└─────────────────────────────────────────────────────┘
```

## File Changes Required for Full Integration

### 1. Root Layout (Recommended)

**File:** `app/layout.tsx`

**Change:**
```tsx
// Add import
import { SupabaseAuthProvider } from '@/components/auth/supabase/SupabaseAuthProvider'

// Wrap children
<SupabaseAuthProvider>
  {children}
</SupabaseAuthProvider>
```

### 2. Update Middleware Login Redirect

**File:** `middleware.ts`

**Change:**
```typescript
// Update login path from '/login' to '/auth/supabase-login'
url.pathname = '/auth/supabase-login'
```

### 3. Add Navigation (Optional)

Add `<UserMenu />` to your existing navigation component.

### 4. Update Admin Pages (Later)

Replace existing admin auth checks with:
```tsx
<AuthGuard requireAdmin>
  {/* existing admin content */}
</AuthGuard>
```

## What's Next

After completing this segment, you'll have:
- ✅ Auth provider for state management
- ✅ Login form with magic links
- ✅ Route guards for protection
- ✅ User menu component
- ✅ Test page to verify everything works

Next segment will add:
- **Segment 5**: API routes and auth callback
- **Segment 6**: Complete integration plan for existing code

## Troubleshooting

### "useAuth must be used within SupabaseAuthProvider"
You need to wrap your component tree with `<SupabaseAuthProvider>`.

### Magic link emails not sending
- Check Supabase Dashboard → Authentication → Email Templates
- For development, Supabase provides a test email service
- For production, configure a real email provider (SendGrid, AWS SES, etc.)

### Login redirects to 404
The auth callback route doesn't exist yet - it's in Segment 5.

### User is null even after login
- Check browser console for errors
- Verify environment variables are set
- Check that profiles table exists in database

### Admin features not showing
- Verify your email is in the `admin_emails` table
- Sign out and sign in again
- Check profile.role in the test page

## Testing Checklist

- [ ] Test page loads at `/auth/supabase-test`
- [ ] Login form appears when not logged in
- [ ] Magic link email received
- [ ] Clicking link redirects back to app
- [ ] User state updates after login
- [ ] Profile data loads from database
- [ ] Admin badge shows if user is admin
- [ ] User menu appears
- [ ] Sign out works

## Rollback Plan

To remove this segment:

```bash
# Remove components
rm -rf components/auth/supabase

# Remove pages
rm -rf app/auth/supabase-login
rm -rf app/auth/supabase-test

# Remove integration guide
rm SEGMENT_4_INTEGRATION.md
```

## Notes

- All components are client-side (`'use client'`)
- Auth state syncs automatically via Supabase
- Profile data refreshes on auth changes
- Components are styled with Tailwind CSS
- Fully type-safe with TypeScript

## Time Estimate

- **Understanding components**: 10 minutes
- **Testing**: 5 minutes
- **Adding to root layout**: 2 minutes
- **Total**: ~20 minutes
