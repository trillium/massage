# E2E Tests

End-to-end tests using Playwright for the Trillium Massage application.

## Setup

### Install Dependencies

```bash
pnpm install
npx playwright install
```

### Environment Variables

For authenticated admin tests, you need to set up a test admin user with password authentication:

```bash
# .env.test or .env.local
TEST_ADMIN_EMAIL=trilliummassagela@gmail.com
TEST_ADMIN_PASSWORD=your-test-password
```

**Note:** The authenticated tests require a Supabase user with:

1. Email/password authentication enabled
2. Admin role in the `profiles` table

### Creating a Test Admin User

You can create a test admin user using Supabase SQL Editor:

```sql
-- 1. Create auth user (or sign up via the app)
-- Use Supabase Dashboard → Authentication → Users → Add user

-- 2. Promote to admin
UPDATE public.profiles
SET role = 'admin'::user_role
WHERE email = 'trilliummassagela@gmail.com';
```

## Running Tests

### Run all e2e tests

```bash
pnpm test:e2e
```

### Run specific test file

```bash
npx playwright test admin-auth.spec.ts
```

### Run in UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Run in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

## Test Structure

### `admin-auth.spec.ts`

Tests for **unauthenticated** users:

- ✓ Cannot access admin dashboard
- ✓ Redirected from admin subpages
- ✓ See login form when accessing admin routes

### `admin-auth-authenticated.spec.ts`

Tests for **authenticated admin** users:

- ✓ Can access admin dashboard
- ✓ Can access admin subpages
- ✓ Session persists across navigation

## Notes

- Tests use `http://localhost:9876` as configured in `playwright.config.ts`
- The dev server is automatically started by Playwright
- Tests clear cookies before each test to ensure clean state
- Authenticated tests use real Supabase authentication (not mocked)
