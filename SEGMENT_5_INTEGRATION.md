# Segment 5: API Layer - Integration Plan

This guide shows how to integrate Supabase API routes into your application.

## What This Segment Provides

**New Files Created:**
- `app/auth/callback/supabase/route.ts` - Auth callback handler
- `app/api/auth/supabase/profile/route.ts` - Profile CRUD API
- `app/api/auth/supabase/admin/users/route.ts` - List users (admin)
- `app/api/auth/supabase/admin/promote/route.ts` - Promote to admin
- `app/api/auth/supabase/admin/demote/route.ts` - Demote from admin

**No Existing Files Modified** ✅

## API Routes Overview

### 1. Auth Callback

**Route:** `GET /auth/callback/supabase`

**Purpose:**
- Handles magic link redirects
- Exchanges auth code for session
- Sets auth cookies
- Redirects to requested page

**Flow:**
```
User clicks magic link
  ↓
/auth/callback/supabase?code=xyz&next=/admin
  ↓
Exchange code for session
  ↓
Set session cookies
  ↓
Redirect to /admin
```

**Query Parameters:**
- `code` - Auth code from Supabase
- `next` - Where to redirect after auth (default: `/`)
- `error` - Error code if auth failed
- `error_description` - Error details

### 2. Profile API

**Routes:**
- `GET /api/auth/supabase/profile` - Get current user's profile
- `PUT /api/auth/supabase/profile` - Update profile (email only)

**Example GET:**
```typescript
const response = await fetch('/api/auth/supabase/profile')
const { profile } = await response.json()
```

**Example PUT:**
```typescript
const response = await fetch('/api/auth/supabase/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'new@example.com' })
})
```

### 3. Admin Users API

**Route:** `GET /api/auth/supabase/admin/users`

**Purpose:** List all users (admin-only)

**Example:**
```typescript
const response = await fetch('/api/auth/supabase/admin/users')
const { users } = await response.json()
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 4. Promote/Demote APIs

**Routes:**
- `POST /api/auth/supabase/admin/promote` - Promote user to admin
- `POST /api/auth/supabase/admin/demote` - Demote admin to user

**Example:**
```typescript
await fetch('/api/auth/supabase/admin/promote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user-uuid' })
})
```

## Integration Steps

### Step 1: Test Auth Callback

The callback route is critical for magic links to work.

1. Go to `/auth/supabase-login`
2. Enter your email
3. Check your email for magic link
4. Click the link
5. Should redirect to `/auth/callback/supabase` then to `/`

**Expected behavior:**
- Magic link contains `code` parameter
- Callback exchanges code for session
- Cookies are set
- User is authenticated
- Redirected to home or specified page

### Step 2: Configure Supabase Redirect URLs

In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URL:
   ```
   http://localhost:3000/auth/callback/supabase
   ```
3. For production, also add:
   ```
   https://yourdomain.com/auth/callback/supabase
   ```

### Step 3: Test Profile API

Create a test component:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ProfileTest() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetch('/api/auth/supabase/profile')
      .then(res => res.json())
      .then(data => setProfile(data.profile))
  }, [])

  return <pre>{JSON.stringify(profile, null, 2)}</pre>
}
```

### Step 4: Test Admin APIs

Only works if you're logged in as admin:

```tsx
'use client'

import { useState } from 'react'

export function AdminTest() {
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    const res = await fetch('/api/auth/supabase/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
  }

  return (
    <div>
      <button onClick={fetchUsers}>Load Users</button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}
```

## Using the APIs in Your App

### Example 1: Profile Settings Page

```tsx
// app/profile/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/supabase/SupabaseAuthProvider'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [email, setEmail] = useState(profile?.email || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    await fetch('/api/auth/supabase/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    await refreshProfile()
    setSaving(false)
  }

  return (
    <div>
      <h1>Profile Settings</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
```

### Example 2: Admin User Management

```tsx
// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/supabase/AuthGuard'

function AdminUsersContent() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch('/api/auth/supabase/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
  }

  const promoteUser = async (userId: string) => {
    await fetch('/api/auth/supabase/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    fetchUsers()
  }

  const demoteUser = async (userId: string) => {
    await fetch('/api/auth/supabase/admin/demote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    fetchUsers()
  }

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role === 'user' ? (
                  <button onClick={() => promoteUser(user.id)}>
                    Promote to Admin
                  </button>
                ) : (
                  <button onClick={() => demoteUser(user.id)}>
                    Demote to User
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminUsersContent />
    </AuthGuard>
  )
}
```

## Error Handling

All API routes return consistent error responses:

```json
{
  "error": "Error message here"
}
```

**Status codes:**
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin)
- `400` - Bad request (missing parameters)
- `500` - Internal server error

**Example error handling:**

```typescript
const response = await fetch('/api/auth/supabase/profile')

if (!response.ok) {
  const { error } = await response.json()
  console.error('API error:', error)
  return
}

const { profile } = await response.json()
```

## Security Features

### 1. Server-Side Auth Checks

All routes verify authentication server-side:

```typescript
const user = await getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Admin-Only Routes

Admin routes verify role:

```typescript
const admin = await isAdmin()
if (!admin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 3. RLS Protection

Database queries respect Row Level Security policies.

### 4. Safe Updates

Profile updates only allow whitelisted fields:

```typescript
const allowedUpdates = ['email']
```

Users cannot change their own role via API.

## File Changes Required for Integration

### None required for API routes to work! ✅

However, to use them in your existing pages:

### 1. Update Admin Pages

Replace existing admin API calls with Supabase APIs:

```typescript
// Before
const response = await fetch('/api/admin/validate')

// After
const response = await fetch('/api/auth/supabase/profile')
```

### 2. Update Login Flow

Update middleware redirect (from Segment 3):

```typescript
// In middleware.ts
url.pathname = '/auth/supabase-login'
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Client (Browser)                                   │
│  └─ Magic link click                                │
├─────────────────────────────────────────────────────┤
│  GET /auth/callback/supabase?code=xyz               │
│  └─ Exchange code for session                       │
│  └─ Set cookies                                      │
│  └─ Redirect to app                                  │
├─────────────────────────────────────────────────────┤
│  API Routes                                         │
│  ├─ GET  /api/auth/supabase/profile                 │
│  ├─ PUT  /api/auth/supabase/profile                 │
│  ├─ GET  /api/auth/supabase/admin/users             │
│  ├─ POST /api/auth/supabase/admin/promote           │
│  └─ POST /api/auth/supabase/admin/demote            │
├─────────────────────────────────────────────────────┤
│  Auth Middleware                                    │
│  └─ Checks cookies on each request                  │
│  └─ Refreshes session if needed                     │
├─────────────────────────────────────────────────────┤
│  Supabase Database                                  │
│  └─ RLS policies enforce security                   │
│  └─ Functions handle role changes                   │
└─────────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Magic link authentication works
- [ ] Callback redirects correctly
- [ ] Profile API returns data when authenticated
- [ ] Profile API returns 401 when not authenticated
- [ ] Admin APIs return 403 for non-admins
- [ ] Admin APIs work for admins
- [ ] Promote/demote functions work
- [ ] Error handling works correctly

## What's Next

After completing this segment, you'll have:
- ✅ Working magic link authentication
- ✅ Profile management API
- ✅ Admin user management API
- ✅ Secure role-based access control

Final segment:
- **Segment 6**: Complete migration guide for existing code

## Troubleshooting

### Magic link redirects to 404
- Check callback route exists at `app/auth/callback/supabase/route.ts`
- Verify redirect URL in Supabase dashboard

### "Code exchange failed"
- Check environment variables are correct
- Verify Supabase project is active
- Check browser console for errors

### API returns 401 even when logged in
- Check cookies are being sent
- Verify middleware is running
- Clear browser cookies and log in again

### Admin APIs return 403
- Verify your user has admin role
- Check `profiles` table in Supabase dashboard
- Make sure your email is in `admin_emails` table

### Profile updates don't persist
- Check RLS policies allow updates
- Verify user is authenticated
- Check browser console for errors

## Rollback Plan

To remove this segment:

```bash
# Remove auth callback
rm -rf app/auth/callback

# Remove API routes
rm -rf app/api/auth/supabase

# Remove integration guide
rm SEGMENT_5_INTEGRATION.md
```

## Notes

- All routes use server-side Supabase client
- Cookies are automatically managed
- Admin routes use service role for elevated permissions
- Profile updates are intentionally limited for security
- Error responses are consistent across all routes

## Time Estimate

- **Testing auth callback**: 5 minutes
- **Testing profile API**: 3 minutes
- **Testing admin APIs**: 5 minutes
- **Total**: ~15 minutes
