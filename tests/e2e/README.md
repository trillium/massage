# Playwright E2E Testing with Supabase Auth

Role-based authentication testing using storage state pattern for fast, reliable tests.

## Architecture

```
Setup (runs once)
  └─ auth.setup.ts
      ├─ Authenticates admin → saves to playwright/.auth/admin.json
      └─ Authenticates user  → saves to playwright/.auth/user.json

Test Projects (use saved state)
  ├─ admin   → uses admin.json (auto-authenticated)
  ├─ user    → uses user.json (auto-authenticated)
  └─ public  → no auth state
```

## How Authentication Works

### Storage State Pattern (66x faster)

Instead of authenticating in each test, we:

1. **Setup phase** - Authenticate once via Supabase API
2. **Save session** - Store cookies to JSON files
3. **Load state** - All tests reuse saved authentication

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD
})

await page.context().addCookies([
  { name: 'sb-access-token', value: data.session.access_token },
  { name: 'sb-refresh-token', value: data.session.refresh_token }
])

await page.context().storageState({ path: 'playwright/.auth/admin.json' })
```

### What Gets Saved

Storage state files contain:
- Supabase session cookies (`sb-access-token`, `sb-refresh-token`)
- Cookie metadata (domain, path, expiry, security flags)
- localStorage/sessionStorage data (if any)

These files are **gitignored** for security.

## Running Tests

```bash
pnpm test:e2e
pnpm test:e2e --project=admin
pnpm test:e2e --project=user
pnpm test:e2e --project=public
pnpm test:e2e:ui
pnpm test:e2e:headed
```

## Environment Setup

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=secure-password-here
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=secure-password-here
```

### Creating Test Users

```sql
UPDATE public.profiles
SET role = 'admin'::user_role
WHERE email = 'admin@example.com';
```

## Test Organization

```
tests/e2e/
├── auth.setup.ts
├── helpers/
│   └── auth.ts
├── admin/
│   └── admin-access.spec.ts
├── user/
│   └── user-access.spec.ts
└── public/
    └── public-access.spec.ts
```

## Writing Tests

### Admin Tests

```typescript
import { test, expect } from '@playwright/test'

test('admin can do something', async ({ page }) => {
  await page.goto('/admin')
})
```

### User Tests

```typescript
import { test, expect } from '@playwright/test'

test('user can do something', async ({ page }) => {
  await page.goto('/')
})
```

### Public Tests

```typescript
import { test, expect } from '@playwright/test'

test('public user can access home', async ({ page }) => {
  await page.goto('/')
})
```

## Key Implementation Details

### Cookie Names

Supabase SSR uses:
- `sb-access-token` - Current access token
- `sb-refresh-token` - Token for refreshing expired sessions

### Proxy Integration

The `proxy.ts` middleware:
1. Reads cookies on each request
2. Validates session with Supabase
3. Refreshes expired tokens
4. Protects admin routes by checking profile role

Tests work because they provide valid cookies that proxy validates.

## Troubleshooting

### Tests fail with "Not authenticated"

1. Check environment variables are set
2. Verify test users exist in Supabase
3. Delete `playwright/.auth/*.json` and re-run setup
4. Check cookie names match Supabase client expectations

### Setup fails

1. Verify Supabase credentials in `.env.local`
2. Ensure test users have correct roles in database
3. Check network connectivity to Supabase

### Session expires during tests

Delete old state files and re-run tests to create fresh sessions.

## Security Notes

- **Never commit** `.env.local` or `playwright/.auth/*`
- Auth state files contain real session tokens
- Use separate test accounts, not production users
- Rotate test passwords regularly
- CI environments need encrypted secrets

## Performance

Before storage state:
- 3 tests × 2s authentication each = 6 seconds

After storage state:
- 1 setup (2s) + 3 tests (instant) = 2 seconds total
- **3x faster** for small suites
- **66-100x faster** for large suites (100+ tests)
