# Gmail API Integration Summary

## 📋 Current Status

**❌ Your existing secret is NOT sufficient for Gmail access**

Your current Google OAuth setup is scoped only for Calendar API (`https://www.googleapis.com/auth/calendar`). To query Gmail, you need to add Gmail scopes and re-authorize your application.

## 🛠️ What Has Been Implemented

### 1. Core Gmail Functionality

- **`/lib/gmail/getGmailAccessToken.ts`** - Gmail-specific access token retrieval
- **`/lib/gmail/searchSootheEmails.ts`** - Email search and parsing logic
- **`/app/api/admin/gmail/soothe-bookings/route.ts`** - API endpoint for retrieving bookings
- **`/app/admin/gmail-events/page.tsx`** - Admin interface for testing

### 2. Email Parsing Capabilities

The system automatically extracts:

- **Client Name** - From patterns like "client:", "customer:", "booking for:", etc.
- **Location** - From "location:", "address:", "venue:", or numbered addresses
- **Payout** - From "payout:", "payment:", "earnings:", or any dollar amounts
- **Notes** - From "notes:", "special requests:", "comments:", etc.
- **Extra Services** - Detects "hot stones", "scalp massage", "deep tissue", etc.

### 3. API Endpoint

**GET** `/api/admin/gmail/soothe-bookings?maxResults=25`

Returns JSON with parsed booking information:

```json
{
  "success": true,
  "totalFound": 25,
  "filteredCount": 18,
  "bookings": [
    {
      "clientName": "John Doe",
      "location": "123 Main St, San Francisco, CA",
      "payout": "$120.00",
      "notes": "Client prefers deep tissue",
      "extraServices": ["hot stones", "scalp massage"]
    }
  ]
}
```

### 4. Testing & Admin Interface

- Comprehensive test suite (10 tests passing)
- Admin page at `/admin/gmail-events` for easy testing
- Error handling with helpful setup guidance

## 🚨 Required Setup Steps

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Find your existing OAuth 2.0 client (used for calendar access)
3. Add Gmail scope: `https://www.googleapis.com/auth/gmail.readonly`

### 2. Re-authorize Application

Since you're adding new scopes, you must re-authorize:

**OAuth URL** (replace YOUR_CLIENT_ID):

```
https://accounts.google.com/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/gmail.readonly&response_type=code&access_type=offline&approval_prompt=force
```

### 3. Update Environment Variable

Update your `GOOGLE_OAUTH_REFRESH` with the new refresh token from re-authorization.

## 🧪 Testing Instructions

### 1. After Setup

Once you've completed the OAuth setup:

```bash
curl "http://localhost:3000/api/admin/gmail/soothe-bookings?maxResults=10"
```

### 2. Using Admin Interface

Visit `/admin/gmail-events` to use the visual interface with:

- One-click email searching
- Visual display of parsed data
- Raw JSON output for integration
- Error messages with setup guidance

### 3. Check Token Scopes

Verify your token has the right scopes:

```bash
curl "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=YOUR_ACCESS_TOKEN"
```

## 🔧 Customization Options

### Email Parsing Patterns

You can modify the extraction patterns in `/lib/gmail/searchSootheEmails.ts`:

```typescript
// Add new client name patterns
const patterns = [
  /client[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
  /your\s+new\s+pattern[:\s]+([a-zA-Z\s]+?)[\n\r,]/i, // Add custom patterns
]
```

### Search Query

Currently searches for "soothe" - modify in `searchSootheEmails()`:

```typescript
searchUrl.searchParams.set('q', 'your-custom-search-term')
```

## ⚠️ Security & Limitations

### Security

- Uses Gmail readonly scope for safety
- Proper error handling and logging
- No sensitive data stored permanently
- Leverages existing OAuth infrastructure

### Limitations

- Requires re-authorization with new scopes
- Gmail API quotas apply (250 quota units per user per second)
- Email parsing depends on consistent Soothe email formats
- Currently searches for "soothe" keyword only

## 🎯 Next Steps Checklist

- [ ] **Update Google Cloud Console OAuth scopes**
- [ ] **Re-authorize application with Gmail scope**
- [ ] **Update `GOOGLE_OAUTH_REFRESH` environment variable**
- [ ] **Test API endpoint with curl or admin interface**
- [ ] **Customize email parsing patterns if needed**
- [ ] **Integrate parsed data into your existing workflow**

## 📁 Files Created/Modified

### New Files

- `/lib/gmail/getGmailAccessToken.ts`
- `/lib/gmail/searchSootheEmails.ts`
- `/app/api/admin/gmail/soothe-bookings/route.ts`
- `/app/admin/gmail-events/page.tsx`
- `/lib/gmail/__tests__/getGmailAccessToken.test.ts`
- `/lib/gmail/__tests__/searchSootheEmails.test.ts`
- `/docs/GMAIL_API_SETUP.md`

### Modified Files

- `/components/AdminNavigation.tsx` - Added Gmail test link

The implementation is complete and tested - you just need to complete the OAuth re-authorization to enable Gmail access!
