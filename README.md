# Auburn Hills Taskboard

Next.js 14 + Supabase dashboard with AI sync endpoints and optional Google Calendar integration.

## 1) Install

```bash
npm install   # or pnpm install / yarn
cp .env.example .env.local
```

Fill `.env.local` with your Supabase project values and an `AI_SECRET_TOKEN`.

## 2) Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Open the SQL editor in your Supabase dashboard
3. Run `supabase/schema.sql` to create the database schema
4. Run `supabase/policies.sql` to set up Row Level Security policies
5. In Project Settings → API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 3) Development

```bash
npm run dev
```

Visit http://localhost:3000

## 4) AI Sync API

### POST - Upsert Tasks

```bash
curl -X POST http://localhost:3000/api/ai-sync \
 -H "Authorization: Bearer $AI_SECRET_TOKEN" \
 -H "content-type: application/json" \
 -d '{
  "tasks":[
    {
      "title":"Send vendor report",
      "details":"Allen Woods requested Q4 numbers",
      "source":{
        "sender":"allen.woods@brinker.com",
        "subject":"Q4 report",
        "message_id":"<abc123>",
        "date":"2025-10-07T12:00:00Z"
      },
      "due":"2025-10-09T17:00:00Z",
      "priority":"High",
      "status":"Todo",
      "tags":["Brinker","Allen Woods"]
    }
  ]
 }'
```

### GET - Retrieve Diffs

```bash
curl -H "Authorization: Bearer $AI_SECRET_TOKEN" \
  "http://localhost:3000/api/ai-sync?since=2025-10-07T00:00:00Z"
```

## 5) Google Calendar Integration (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI to: `http://localhost:3000/api/calendar/auth`
6. Copy Client ID and Client Secret to your `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/auth
GOOGLE_CALENDAR_ID=primary
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/calendar.events
GOOGLE_ENCRYPTION_KEY=your-32-character-encryption-key
```

7. Start the dev server and visit `/api/calendar/auth` to authorize
8. After authorization, you can click "Add to Calendar" on tasks with due dates

## 6) Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project into [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in Vercel's project settings
4. Deploy!

### Optional: Set up Cron Jobs

In Vercel, you can configure cron jobs to hit your `/api/ai-sync` endpoint for automated task synchronization.

Example schedule (in `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/ai-sync",
      "schedule": "0 6-10,12,14,18 * * *"
    }
  ]
}
```

## Project Structure

```
auburn-hills-taskboard/
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ ai-sync/route.ts        # AI sync endpoint
│  │  │  ├─ tasks/route.ts          # Tasks CRUD (GET/POST)
│  │  │  ├─ tasks/[id]/route.ts     # Individual task (PATCH/DELETE)
│  │  │  ├─ calendar/auth/route.ts  # Google OAuth flow
│  │  │  └─ calendar/add/[id]/route.ts # Add task to calendar
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ Filters.tsx       # Status & priority filters
│  │  ├─ TaskCard.tsx      # Individual task display
│  │  └─ TaskList.tsx      # Task grid layout
│  ├─ lib/
│  │  ├─ calendar.ts       # Encryption utils for Google tokens
│  │  ├─ supabaseBrowser.ts # Client-side Supabase
│  │  ├─ supabaseServer.ts  # Server-side Supabase
│  │  └─ utils.ts          # Validation & utilities
│  └─ types.ts             # TypeScript types
├─ supabase/
│  ├─ schema.sql           # Database schema
│  └─ policies.sql         # Row Level Security policies
└─ public/
```

## Features

- **Task Management**: Create, update, and delete tasks with status tracking
- **Priority & Status Filters**: Filter tasks by priority (High/Med/Low) and status (Todo/In Progress/Waiting/Done)
- **AI Sync API**: RESTful API for programmatic task creation and updates
- **Google Calendar Integration**: One-click calendar event creation
- **Email Source Tracking**: Track task origins from email (sender, subject, message ID)
- **Tags & Due Dates**: Organize tasks with tags and deadlines
- **Real-time Updates**: SWR-based data fetching for responsive UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Validation**: Zod
- **Calendar**: Google Calendar API
- **TypeScript**: Full type safety

## License

MIT
