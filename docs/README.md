# Auburn Hills Taskboard

A modern, production-ready task management dashboard built with Next.js 14 and Supabase, featuring AI-powered task synchronization and Google Calendar integration.

## Features

- **Task Management**: Create, update, filter, and track tasks with status and priority
- **AI Sync Endpoints**: REST API for AI agents to push/pull task data
- **Google Calendar Integration**: One-click event creation from tasks
- **Real-time Updates**: SWR-powered data fetching with automatic revalidation
- **Secure Authentication**: OAuth 2.0 flow for Google Calendar access
- **Email Source Tracking**: Track tasks generated from email sources
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Type Safety**: Full TypeScript coverage with Zod validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Google OAuth 2.0
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Data Fetching**: SWR
- **Encryption**: Node crypto (AES-256-CBC)

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- Supabase account ([supabase.com](https://supabase.com))
- Google Cloud project (for Calendar integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/johnohhh1/taskdash.git
cd taskdash

# Install dependencies
pnpm install
# or: npm install / yarn install

# Setup environment variables
cp .env.example .env.local
```

### Environment Setup

Edit `.env.local` with your credentials:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Sync (required)
AI_SECRET_TOKEN=your-secure-random-token-here

# App Configuration
NEXT_PUBLIC_APP_NAME=Auburn Hills Taskboard
NEXT_PUBLIC_ACCENT_COLOR=#CC5500

# Google Calendar (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/auth
GOOGLE_CALENDAR_ID=primary
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/calendar.events
GOOGLE_ENCRYPTION_KEY=32-character-minimum-encryption-key
```

### Database Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the SQL scripts in order:
   - First: `supabase/schema.sql`
   - Second: `supabase/policies.sql`

### Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
auburn-hills-taskboard/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── ai-sync/      # AI integration endpoints
│   │   │   ├── calendar/     # Google Calendar OAuth
│   │   │   └── tasks/        # Task CRUD operations
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── Dashboard.tsx     # Main dashboard component
│   │   ├── Filters.tsx       # Task filters
│   │   ├── TaskCard.tsx      # Individual task display
│   │   └── TaskList.tsx      # Task list container
│   ├── lib/
│   │   ├── calendar.ts       # Calendar utilities
│   │   ├── supabaseBrowser.ts # Client-side Supabase
│   │   ├── supabaseServer.ts  # Server-side Supabase
│   │   └── utils.ts          # Shared utilities
│   └── types.ts              # TypeScript definitions
├── supabase/
│   ├── schema.sql            # Database schema
│   └── policies.sql          # Row-level security
├── docs/                     # Documentation
│   ├── README.md             # This file
│   ├── API.md                # API documentation
│   └── DEPLOYMENT.md         # Deployment guide
└── public/                   # Static assets
```

## Core Concepts

### Task Schema

Tasks support rich metadata including:
- Email source tracking (sender, subject, message ID)
- Due dates with timezone support
- Priority levels (High/Med/Low)
- Status tracking (Todo/In Progress/Waiting/Done)
- Owner assignment
- Tag arrays

### AI Sync Architecture

The `/api/ai-sync` endpoint enables AI agents to:
- **Push tasks**: Bulk upsert with conflict resolution
- **Pull changes**: Get differential updates since timestamp
- **Audit trail**: All sync operations logged to `sync_logs`

### Security Model

- **Row-Level Security (RLS)**: Enabled on all tables
- **Service Role**: Server-side API routes use privileged access
- **Token Auth**: AI sync requires bearer token
- **Encrypted Storage**: Google refresh tokens encrypted with AES-256
- **HttpOnly Cookies**: Secure credential storage

## Google Calendar Integration

### Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
2. Configure redirect URI: `http://localhost:3000/api/calendar/auth`
3. Enable Google Calendar API
4. Add credentials to `.env.local`

### Usage

1. Click "Link Google Calendar" in the app header
2. Complete OAuth consent flow
3. Click "Add to Calendar" on any task with a due date
4. Event created with 30-minute duration

## Development Workflow

### Adding a New Feature

1. Define types in `src/types.ts`
2. Update database schema in `supabase/schema.sql`
3. Create API route in `src/app/api/`
4. Build UI component in `src/components/`
5. Test with curl or Postman

### Database Migrations

Run new SQL in Supabase SQL Editor:

```sql
-- Example: Add new column
ALTER TABLE tasks ADD COLUMN estimate_hours INTEGER;
```

Update TypeScript types accordingly.

## Testing

### API Testing

```bash
# Health check
curl http://localhost:3000/api/tasks

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "priority": "High",
    "status": "Todo"
  }'

# AI sync (requires token)
curl -X POST http://localhost:3000/api/ai-sync \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"tasks":[{"title":"AI task","status":"Todo"}]}'
```

## Troubleshooting

### Common Issues

**Supabase Connection Error**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local`
- Check project is not paused in Supabase dashboard

**Google Calendar "Not Authorized"**
- Complete OAuth flow at `/api/calendar/auth`
- Check cookie `gcal_refresh` is set (inspect in DevTools)
- Verify redirect URI matches Google Console exactly

**AI Sync 401 Unauthorized**
- Ensure `Authorization: Bearer <token>` header is sent
- Token must match `AI_SECRET_TOKEN` in `.env.local`

**Tasks Not Appearing**
- Check browser console for API errors
- Verify RLS policies in Supabase (should allow public read)
- Inspect network tab for failed requests

## Performance

- **SWR Caching**: Automatic request deduplication
- **Database Indexes**: On status, priority, due date
- **Efficient Queries**: Filtered at database level
- **Optimistic Updates**: Instant UI feedback

## Security Best Practices

- Never commit `.env.local` or `.env`
- Rotate `AI_SECRET_TOKEN` regularly
- Use HTTPS in production
- Enable Supabase RLS for user-scoped data
- Validate all inputs with Zod schemas
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/johnohhh1/taskdash/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnohhh1/taskdash/discussions)

## Roadmap

- [ ] User authentication with Supabase Auth
- [ ] Task assignment and collaboration
- [ ] Email webhook integration
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Mobile app (React Native)
- [ ] Slack/Teams notifications
- [ ] Advanced analytics dashboard
- [ ] AI-powered task prioritization
- [ ] Voice input support

## Acknowledgments

Built with modern web technologies:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**Auburn Hills Taskboard** - Streamline your workflow with AI-powered task management.
