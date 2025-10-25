# Segment 1: Setup & Documentation - Integration Plan

This guide shows how to integrate the Supabase setup into your project.

## What This Segment Provides

**New Files Created:**
- `SUPABASE_SETUP_GUIDE.md` - Complete setup instructions
- `.env.supabase.template` - Environment variable template
- `scripts/install-supabase.sh` - Installation script
- `scripts/check-supabase-setup.ts` - Validation script

**No Existing Files Modified** ✅

## Integration Steps

### Step 1: Install Dependencies

```bash
# Make the script executable
chmod +x scripts/install-supabase.sh

# Run installation
bash scripts/install-supabase.sh
```

This installs:
- `@supabase/supabase-js` - Core Supabase client
- `@supabase/ssr` - Server-side rendering helpers for Next.js
- `supabase` (dev dependency) - CLI tools

### Step 2: Create Supabase Project

Follow the guide in `SUPABASE_SETUP_GUIDE.md`:

1. Go to https://supabase.com
2. Create account / sign in
3. Create new project
4. Wait for provisioning (~2-3 minutes)
5. Get your credentials from Settings → API

### Step 3: Configure Environment Variables

```bash
# Copy the template
cp .env.supabase.template .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Important:** Keep all your existing environment variables! Just add these three new ones.

### Step 4: Verify Setup

```bash
pnpm tsx scripts/check-supabase-setup.ts
```

Expected output:
```
✅ Environment: NEXT_PUBLIC_SUPABASE_URL
✅ Environment: NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ Environment: SUPABASE_SERVICE_ROLE_KEY
✅ Connection Test
⚠️  Database Schema (expected - migrations not run yet)
✅ Auth Configuration
```

## File Changes Required

### None for this segment! 🎉

This segment is purely additive - no changes to existing code needed.

## What's Next

After completing this segment, you'll have:
- ✅ Supabase account and project
- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Connection verified

Next segments will add:
- **Segment 2**: Database schema and migrations
- **Segment 3**: Supabase client utilities
- **Segment 4**: Auth components
- **Segment 5**: API integration

## Rollback Plan

If you need to undo this segment:

```bash
# Remove dependencies
pnpm remove @supabase/supabase-js @supabase/ssr supabase

# Remove new files
rm SUPABASE_SETUP_GUIDE.md
rm .env.supabase.template
rm scripts/install-supabase.sh
rm scripts/check-supabase-setup.ts
rm SEGMENT_1_INTEGRATION.md

# Remove environment variables from .env.local
# (manually edit and remove the three SUPABASE_ lines)
```

## Troubleshooting

### Script won't run: "Permission denied"
```bash
chmod +x scripts/install-supabase.sh
```

### pnpm not found
```bash
npm install -g pnpm
```

### Validation script errors: "Cannot find module"
The dependencies might not be installed yet. Run:
```bash
bash scripts/install-supabase.sh
```

### Connection test fails
- Double-check your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Verify the project is active in Supabase dashboard
- Make sure you copied the full URL (should end in `.supabase.co`)

## Notes

- All new files are standalone and don't affect existing functionality
- You can test the setup without touching any existing auth code
- Environment variables are additive - your existing config remains unchanged
- The validation script is optional but helpful for debugging

## Time Estimate

- **Installation**: 2-3 minutes
- **Supabase project creation**: 3-5 minutes
- **Configuration**: 2 minutes
- **Total**: ~10 minutes
