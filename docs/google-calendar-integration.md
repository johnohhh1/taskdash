# Google Calendar Integration

## Overview

The Auburn Hills Taskboard now includes full Google Calendar OAuth 2.0 integration, allowing users to add tasks directly to their Google Calendar.

## Files Created

### 1. `/c/Users/John/taskdash/src/lib/calendar.ts`
**Purpose**: Encryption utilities and token management

**Functions**:
- `encrypt(text: string)`: Encrypts sensitive data using AES-256-CBC
- `decrypt(text: string)`: Decrypts encrypted data
- `getAccessToken(refreshTokenEncrypted: string)`: Exchanges refresh token for access token

**Security Features**:
- AES-256-CBC encryption for refresh tokens
- Secure cookie storage with HttpOnly, Secure, and SameSite flags
- 32-character minimum encryption key requirement

### 2. `/c/Users/John/taskdash/src/app/api/calendar/auth/route.ts`
**Purpose**: OAuth 2.0 authorization flow handler

**Endpoints**:
- `GET /api/calendar/auth` (no code): Initiates OAuth flow
- `GET /api/calendar/auth?code=...`: Handles OAuth callback

**Flow**:
1. User clicks "Link Google Calendar" button
2. Redirects to Google OAuth consent screen
3. User grants calendar access
4. Google redirects back with authorization code
5. Server exchanges code for tokens
6. Refresh token is encrypted and stored in secure cookie

### 3. `/c/Users/John/taskdash/src/app/api/calendar/add/[id]/route.ts`
**Purpose**: Add tasks to Google Calendar

**Endpoint**:
- `POST /api/calendar/add/[taskId]`

**Features**:
- Validates task has a due date
- Creates 30-minute calendar event
- Sets timezone to America/Detroit (Auburn Hills, MI)
- Color-codes events by priority:
  - High: Red (colorId: 11)
  - Medium: Blue (colorId: 9)
  - Low: Gray (colorId: 8)
- Includes task details, source info, and tags in event description
- Sets reminders: 1 hour (email) and 15 minutes (popup)

## Environment Variables Required

Add these to your `.env.local`:

```bash
# Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/auth
GOOGLE_CALENDAR_ID=primary
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/calendar.events
GOOGLE_ENCRYPTION_KEY=your-32-character-minimum-encryption-key-here
```

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/calendar/auth`
   - For production: Add your production URL (e.g., `https://yourdomain.com/api/calendar/auth`)

### 2. Configure Environment Variables

Copy the Client ID and Client Secret from Google Cloud Console and add them to `.env.local`.

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use this output as your `GOOGLE_ENCRYPTION_KEY`.

### 4. Test the Integration

1. Start the development server: `npm run dev`
2. Click "Link Google Calendar" in the app header
3. Grant calendar access
4. Select a task with a due date
5. Click "Add to Calendar"

## API Usage Examples

### Start OAuth Flow
```bash
curl http://localhost:3000/api/calendar/auth
# Redirects to Google OAuth consent screen
```

### Add Task to Calendar
```bash
curl -X POST http://localhost:3000/api/calendar/add/[task-id] \
  -H "Cookie: gcal_refresh=..." \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "event": {
    "id": "event_id_from_google",
    "htmlLink": "https://calendar.google.com/calendar/event?...",
    "summary": "Task title",
    "start": { "dateTime": "2025-10-09T17:00:00-04:00" },
    "end": { "dateTime": "2025-10-09T17:30:00-04:00" }
  }
}
```

## Security Considerations

1. **Refresh Token Storage**: Stored in HTTP-only, secure cookies with encryption
2. **Access Token Handling**: Tokens are never stored; generated on-demand from refresh tokens
3. **Encryption**: AES-256-CBC encryption for all sensitive data
4. **Cookie Attributes**:
   - `HttpOnly`: Prevents JavaScript access
   - `Secure`: Only sent over HTTPS
   - `SameSite=Lax`: CSRF protection
   - `Max-Age=31536000`: 1-year expiration

## Error Handling

The integration includes comprehensive error handling for:
- Missing OAuth authorization
- Invalid or expired tokens
- Tasks without due dates
- Google Calendar API errors
- Token exchange failures

## Production Deployment

When deploying to production (e.g., Vercel):

1. Update `GOOGLE_REDIRECT_URI` to production URL
2. Add production redirect URI to Google Cloud Console
3. Ensure all environment variables are set in Vercel
4. Use a strong, randomly generated encryption key
5. Enable HTTPS (required for Secure cookies)

## Coordination Hooks Executed

- ✅ `pre-task` - Task preparation
- ✅ `session-restore` - Session context restoration
- ✅ `post-edit` - File change tracking
- ✅ `notify` - Completion notification
- ✅ `post-task` - Task completion logging

## Integration Status

🟢 **COMPLETE** - All files created and hooks executed successfully
