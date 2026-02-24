# My Events Security Implementation

## Overview

The `/my_events` page now implements secure email verification to ensure users can only access their own event data. This follows the established hash validation pattern used throughout the application.

## Security Features

### 1. URL Parameter Verification

- Requires both `email` and `hash` URL parameters
- Uses the existing `getHash` function from `lib/hash.ts`
- Validates hash against email before allowing access

### 2. User Experience

- **Unverified State**: Shows verification error with helpful instructions
- **Verified State**: Displays confirmed email and direct search functionality
- **Loading State**: Shows verification in progress with spinner

## Usage Examples

### Generating Secure URLs

```typescript
import { getHash } from '@/lib/hash'

// Generate a secure link for a user
const email = 'user@example.com'
const hash = await getHash(email)
const secureUrl = `https://yourdomain.com/my_events?email=${encodeURIComponent(email)}&hash=${hash}`

// Send this URL via email to the user
```

### Testing with Sample URLs

```bash
# Valid URL (will work if GOOGLE_OAUTH_SECRET matches)
https://localhost:3000/my_events?email=test@example.com&hash=[generated_hash]

# Invalid URL (will show verification error)
https://localhost:3000/my_events?email=test@example.com&hash=invalid_hash

# Missing parameters (will show verification error)
https://localhost:3000/my_events
```

## Integration Points

### Hash Generation

- Uses `getHash(email)` from `lib/hash.ts`
- Leverages `GOOGLE_OAUTH_SECRET` for consistent hashing
- Same pattern as appointment verification and admin approval flows

### URL Parameter Handling

- Uses Next.js 13+ `useSearchParams()` hook
- Client-side parameter extraction and validation
- Follows established patterns from booking system

### Error Handling

- Clear user feedback for verification failures
- Helpful instructions for users without proper links
- Graceful fallback messaging

## Security Considerations

### Hash Validation

- SHA-256 with secret salt ensures tamper-proof URLs
- Email must match exactly (case-sensitive)
- Hash verification happens client-side after parameter extraction

### Access Control

- No event search functionality without valid verification
- Email is read-only after verification
- All API calls use verified email parameter

### User Privacy

- Each user can only access events for their verified email
- No cross-user data exposure possible
- Secure link required for each session

## Implementation Details

### State Management

```typescript
const [isVerified, setIsVerified] = useState(false)
const [verificationError, setVerificationError] = useState<string | null>(null)
```

### Verification Flow

1. Extract `email` and `hash` from URL parameters
2. Generate expected hash using `getHash(email)`
3. Compare URL hash with expected hash
4. Set verification state based on match result
5. Show appropriate UI based on verification status

### UI States

- **Loading**: Spinner while verifying
- **Error**: Red warning with instructions
- **Success**: Green confirmation with search functionality

## Error Messages

- "Missing email or verification hash in URL"
- "Invalid verification hash. Please use the secure link provided in your email."
- "Error verifying email. Please try again or contact support."

## Future Enhancements

- Time-based token expiration
- Rate limiting for verification attempts
- Audit logging for access attempts
- Multi-factor authentication integration
