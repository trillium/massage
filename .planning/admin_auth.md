# Admin Authentication System

## Overview

The admin route (`/admin`) now requires secure email-based authentication using server-side hash validation with the proven hash pattern used throughout the application. This approach is better than JWT for this use case because:

1. **Server-side security** - Hash validation happens server-side where secrets are safe
2. **Leverages existing infrastructure** - Uses the same `getHash()` function and email system
3. **Simple and secure** - No token refresh complexity or server-side session storage
4. **Audit trail** - All access requests are logged and emailed
5. **Time-limited access** - Sessions expire after 30 days
6. **Environment-specific** - Admin emails configured per deployment

## Architecture

### Server-Side Authentication Flow

1. User visits `/admin/request-access`
2. Submits email + reason for access
3. System validates email against `ADMIN_EMAILS` env var
4. Secure admin link sent via email (using `getHash()`)
5. User clicks link to access admin panel
6. **Server-side validation** - Browser sends credentials to `/api/admin/validate`
7. Server validates hash using `GOOGLE_OAUTH_SECRET` and returns success/failure
8. Client creates session in localStorage only after server validation
9. Session stored in localStorage with 30-day expiration

### Security Features

#### Server-Side Hash Validation

- **NEW**: Hash validation moved to server-side `/api/admin/validate` endpoint
- Uses existing `getHash(email)` with `GOOGLE_OAUTH_SECRET` on server only
- SHA-256 with secret salt prevents tampering
- Client never has access to `GOOGLE_OAUTH_SECRET`
- Same cryptographic approach as appointment confirmations

#### Rate Limiting

- 2 requests per IP per minute for admin access requests
- Prevents brute force and spam attempts

#### Session Management

- **UPDATED**: 30-day session timeout (was 4 hours)
- Server-side validation with client-side session storage
- Manual logout capability
- Auto-cleanup of expired sessions
- Sessions only created after successful server validation

#### Authorization

- Only pre-configured emails can request access
- All access attempts logged for audit
- No information disclosure about valid/invalid emails

## Implementation Files

### Core Authentication

- `/lib/adminAuth.ts` - Session management and validation
  - `AdminAuthManager.validateAdminAccess()` - Server-side hash validation
  - `AdminAuthManager.createValidatedSession()` - **NEW**: Create session after server validation
  - `AdminAuthManager.validateSession()` - **UPDATED**: Skips client-side hash validation
- `/components/AdminAuthProvider.tsx` - Client-side auth wrapper with server-side validation
- `/app/admin/layout.tsx` - Protects all admin routes with integrated navigation
- `/app/api/admin/validate/route.ts` - **NEW**: Server-side validation endpoint

### Navigation System

- `/components/AuthNav.tsx` - **NEW**: Comprehensive admin navigation component
  - `AuthNav` - Main categorized navigation with descriptions
  - `AuthNavCompact` - Horizontal navigation for headers
  - `AuthNavSidebar` - Dedicated sidebar navigation
- `/data/authHeaderNavLinks.ts` - **NEW**: Centralized admin route definitions
  - Categorized routes (Primary, Management, Tools, Testing)
  - Filtered exports for different contexts

### Access Request System

- `/app/admin/request-access/page.tsx` - Public access request form
- `/app/api/admin/request-access/route.ts` - Handles access requests
- `/lib/schema.ts` - Added `AdminAccessRequestSchema`

### Admin Link Generation

- `/scripts/generate-admin-link.ts` - **NEW**: CLI utility for generating admin links
- `pnpm admin:generate-link` - **NEW**: Package.json script for link generation
- Supports `--emailEnv` flag to use `ADMIN_EMAILS` environment variable

### Development & Debugging

- `/components/AdminDebugInfo.tsx` - **NEW**: Debug panel for authentication state
- Shows URL parameters, localStorage, validation status, and timing information
- Helps troubleshoot authentication issues during development

### Configuration

- `ADMIN_EMAILS` environment variable - Comma-separated authorized emails
- Uses existing `GOOGLE_OAUTH_SECRET` for hash generation (server-side only)
- `.env.local` - Local development configuration

## Usage

### For Administrators

1. **Request Access**:

   ```
   Visit: /admin/request-access
   Enter: your authorized email + reason
   Check: email for secure admin link
   ```

2. **Admin Session**:

   ```
   Valid for: 30 days from first access
   Stored in: localStorage (client-side)
   Logout: Available in admin panel header
   Navigation: Categorized sidebar with all admin tools
   ```

3. **Generate Admin Links** (Command Line):

   ```bash
   # Generate link for specific email
   pnpm admin:generate-link admin@example.com

   # Use first email from ADMIN_EMAILS environment variable
   pnpm admin:generate-link --emailEnv

   # With custom base URL
   pnpm admin:generate-link admin@example.com https://yourdomain.com
   ```

### For Developers

1. **Configure Admin Emails**:

   ```bash
   # In .env.local
   ADMIN_EMAILS="admin@example.com,owner@example.com"
   GOOGLE_OAUTH_SECRET="your-actual-secret-here"
   ```

2. **Generate Admin Links** (programmatically):

   ```typescript
   import { AdminAuthManager } from '@/lib/adminAuth'

   const link = AdminAuthManager.generateAdminLink('admin@example.com', 'https://yourdomain.com')
   // Send via email or other secure channel
   ```

3. **Check Auth Status**:

   ```typescript
   if (AdminAuthManager.isAuthenticated()) {
     const email = AdminAuthManager.getCurrentAdminEmail()
     // Admin is logged in
   }
   ```

4. **Debug Authentication Issues**:
   ```
   Visit any admin page and look for the yellow "🐛 Debug Admin Auth" button
   Shows: URL params, localStorage, validation status, timing info
   ```

### Navigation Structure

The admin panel now includes comprehensive navigation organized by category:

- **Dashboard** 🏠: Main admin overview
- **Management** ⚙️: Event containers, promo routes, reviews, access requests
- **Tools** 🔧: Test users and utilities
- **Testing** 🧪: Mock user flows, form validators, dynamic fields

## Security Considerations

### Advantages Over JWT

- **Server-side validation** - Secrets never exposed to client
- **No server state** - Stateless like JWT but simpler
- **Existing crypto** - Reuses proven hash system
- **Email verification** - Built-in out-of-band authentication
- **Audit trail** - Every access is logged and emailed
- **Environment control** - Admin list managed per deployment

### Protection Against Common Attacks

- **Session hijacking** - Hash tied to specific email, validated server-side
- **Secret exposure** - `GOOGLE_OAUTH_SECRET` never sent to browser
- **Replay attacks** - Time-based expiration (30 days)
- **Brute force** - Rate limiting on access requests
- **Information disclosure** - No hints about valid emails
- **CSRF** - Server-side validation prevents client-side manipulation

### Best Practices Implemented

- ✅ **Server-side validation** - Critical security logic on server
- ✅ Principle of least privilege (admin-only access)
- ✅ Defense in depth (multiple validation layers)
- ✅ Secure by default (deny access without valid session)
- ✅ Fail safely (clear errors, secure fallbacks)
- ✅ Audit logging (all access attempts recorded)
- ✅ Development debugging (secure debug tools)

## Recent Improvements

### Security Enhancements (August 2025)

1. **Moved hash validation to server-side** - Prevents client-side secret exposure
2. **Added server validation API** - `/api/admin/validate` endpoint for secure validation
3. **Updated session creation** - `createValidatedSession()` skips client-side validation
4. **Extended session duration** - 30 days for better UX while maintaining security

### User Experience Improvements

1. **Comprehensive navigation** - Categorized admin navigation with descriptions
2. **Multiple navigation variants** - Full, compact, and sidebar options
3. **Admin link CLI tool** - Easy command-line link generation
4. **Debug tools** - Visual debugging panel for development

### Developer Experience

1. **Centralized route definitions** - `authHeaderNavLinks.ts` for maintainability
2. **TypeScript improvements** - Better typing for auth components
3. **Environment variable handling** - Improved `.env.local` setup
4. **Documentation updates** - Comprehensive usage examples

## Integration with Existing System

The admin auth system integrates seamlessly with your current patterns:

- **Hash functions** - Uses existing `lib/hash.ts` (server-side only)
- **Email system** - Uses existing `lib/email` infrastructure
- **Rate limiting** - Follows same pattern as other API routes
- **Zod schemas** - Added to existing `lib/schema.ts`
- **Error handling** - Consistent with app patterns
- **TypeScript** - Fully typed for safety
- **Navigation patterns** - Consistent with existing Link components
- **Environment configuration** - Follows Next.js conventions

### Migration Notes

If upgrading from client-side validation:

1. **Server validation required** - Hash validation now happens server-side
2. **New API endpoint** - `/api/admin/validate` handles validation
3. **Updated session creation** - Use `createValidatedSession()` after server validation
4. **Environment variables** - Ensure `GOOGLE_OAUTH_SECRET` is set in server environment
5. **Navigation updates** - Replace hardcoded admin links with `AuthNav` components

This approach provides enterprise-level security while maintaining the simplicity and consistency of your existing codebase, with significant security improvements through server-side validation.
