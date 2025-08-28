# Gmail API Integration Setup Guide

## Current Status: ❌ GMAIL ACCESS NOT CONFIGURED

Your current Google OAuth setup is scoped only for Calendar API. To access Gmail, you need to:

## Required Steps

### 1. Update Google Cloud Console OAuth Scopes

You need to add Gmail scopes to your existing Google OAuth application:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your existing OAuth 2.0 client (the one used for calendar access)
3. Update the scopes to include:
   - `https://www.googleapis.com/auth/calendar` (existing)
   - `https://www.googleapis.com/auth/gmail.readonly` (new - for reading emails)

### 2. Re-authorize Your Application

Since you're adding new scopes, you need to re-authorize:

1. **Clear existing refresh token** (optional but recommended for clean setup)
2. **Go through OAuth flow again** with the new scopes
3. **Update your `GOOGLE_OAUTH_REFRESH` environment variable** with the new refresh token

### 3. OAuth Re-authorization URL

Use this URL to re-authorize with Gmail scopes (replace YOUR_CLIENT_ID):

```
https://accounts.google.com/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/gmail.readonly&response_type=code&access_type=offline&approval_prompt=force
```

### 4. Test the Implementation

Once you've updated your scopes and refresh token, you can test the Gmail integration:

```bash
curl "http://localhost:3000/api/admin/gmail/soothe-bookings?maxResults=10"
```

## Implementation Details

### Files Created

1. **`/lib/gmail/getGmailAccessToken.ts`** - Gmail-specific access token retrieval
2. **`/lib/gmail/searchSootheEmails.ts`** - Core Gmail search and parsing logic
3. **`/app/api/admin/gmail/soothe-bookings/route.ts`** - API endpoint for retrieving Soothe booking emails

### API Endpoint

**GET** `/api/admin/gmail/soothe-bookings`

Query Parameters:

- `maxResults` (optional, default: 50) - Maximum number of emails to search

Response:

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
      "extraServices": ["hot stones", "scalp massage"],
      "rawMessage": { ... }
    }
  ]
}
```

### Data Extraction Patterns

The implementation searches for:

- **Client Name**: "client:", "customer:", "name:", "booking for:", "appointment with:"
- **Location**: "location:", "address:", "venue:", addresses starting with numbers
- **Payout**: "payout:", "payment:", "fee:", "earnings:", any dollar amounts
- **Notes**: "notes:", "special requests:", "comments:", "instructions:"
- **Extra Services**: "hot stones", "scalp massage", "deep tissue", "aromatherapy", etc.

## Security Considerations

- Uses Gmail's readonly scope for security
- Implements proper error handling and logging
- Filters sensitive information appropriately
- Uses existing OAuth infrastructure

## Next Steps

1. ✅ Update Google Cloud Console OAuth scopes
2. ✅ Re-authorize application with new scopes
3. ✅ Update `GOOGLE_OAUTH_REFRESH` environment variable
4. ✅ Test the API endpoint
5. ✅ Review and customize extraction patterns as needed

## Troubleshooting

### Common Issues:

1. **"Insufficient Permission" errors**: Your refresh token doesn't have Gmail scope
2. **"Invalid credentials"**: Need to re-authorize with new scopes
3. **Empty results**: Check if emails actually contain "soothe" keyword

### Testing Access Token Scopes

You can check what scopes your current token has:

```bash
curl "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=YOUR_ACCESS_TOKEN"
```
