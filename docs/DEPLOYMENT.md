# Deployment Guide

Complete guide for deploying Auburn Hills Taskboard to production.

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository created
- ✅ Vercel account ([vercel.com](https://vercel.com))
- ✅ Supabase account ([supabase.com](https://supabase.com))
- ✅ Google Cloud project (optional, for Calendar integration)
- ✅ Domain name (optional, for custom domain)

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `auburn-hills-taskboard`
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is sufficient to start
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase project, navigate to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase/schema.sql` from your repo
4. Paste into the editor
5. Click **"Run"** (green play button)
6. Verify success: "Success. No rows returned"

### Step 3: Apply Row-Level Security

1. Still in SQL Editor, click **"New Query"**
2. Copy contents of `supabase/policies.sql`
3. Paste and click **"Run"**
4. Verify tables are created:
   - Go to **Table Editor**
   - You should see: `tasks`, `sync_logs`, `profiles`

### Step 4: Get API Credentials

1. Navigate to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

### Step 5: Configure Storage (Optional)

If you plan to add file attachments later:

1. Go to **Storage** in Supabase dashboard
2. Click **"Create bucket"**
3. Name: `task-attachments`
4. Make public: **No** (private by default)
5. Update storage policies as needed

---

## Part 2: Google Cloud Setup (Optional)

Skip this section if you don't need Google Calendar integration.

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **"Select Project"** → **"New Project"**
3. Name: `Auburn Hills Taskboard`
4. Click **"Create"**

### Step 2: Enable Google Calendar API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click the result and click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: Auburn Hills Taskboard
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Search for `calendar.events`
   - Check: `.../auth/calendar.events`
   - Click **"Update"**
6. **Test users** (for development):
   - Add your email address
   - Add any other test users
7. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Auburn Hills Taskboard Web`
5. **Authorized redirect URIs**:
   - For development: `http://localhost:3000/api/calendar/auth`
   - For production: `https://your-domain.vercel.app/api/calendar/auth`
   - ⚠️ Add both if testing locally before deploy
6. Click **"Create"**
7. Copy and save:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`

---

## Part 3: Vercel Deployment

### Step 1: Prepare Repository

1. Ensure code is pushed to GitHub:
```bash
cd taskdash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Verify these files exist:
   - `.gitignore` (excludes `.env*`)
   - `package.json`
   - `next.config.mjs`

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Select your GitHub account
   - Find `johnohhh1/taskdash`
   - Click **"Import"**

### Step 3: Configure Environment Variables

In the **"Configure Project"** screen:

1. Expand **"Environment Variables"**
2. Add each variable (click **"Add Another"** after each):

**Required Variables**:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | ⚠️ Supabase service_role secret |
| `AI_SECRET_TOKEN` | `generate-random-64-char-string` | Use: `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_NAME` | `Auburn Hills Taskboard` | App title |
| `NEXT_PUBLIC_ACCENT_COLOR` | `#CC5500` | Theme color (orange) |

**Google Calendar Variables** (optional):

| Name | Value | Notes |
|------|-------|-------|
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxx` | Keep secret! |
| `GOOGLE_REDIRECT_URI` | `https://your-app.vercel.app/api/calendar/auth` | Update after deploy |
| `GOOGLE_CALENDAR_ID` | `primary` | Or specific calendar ID |
| `GOOGLE_OAUTH_SCOPES` | `https://www.googleapis.com/auth/calendar.events` | Don't change |
| `GOOGLE_ENCRYPTION_KEY` | `generate-32-char-minimum-key` | Use: `openssl rand -hex 16` |

3. Click **"Deploy"**

### Step 4: Wait for Deployment

- Initial build takes ~2-3 minutes
- Watch build logs for errors
- Vercel will show "Congratulations!" when complete

### Step 5: Update Google Redirect URI

1. Note your Vercel deployment URL: `https://your-app-xxxxx.vercel.app`
2. Go back to **Google Cloud Console** → **Credentials**
3. Edit your OAuth client
4. Update **Authorized redirect URIs**:
   - Replace `http://localhost:3000/api/calendar/auth`
   - With: `https://your-app-xxxxx.vercel.app/api/calendar/auth`
5. Click **"Save"**
6. In Vercel, go to **Settings** → **Environment Variables**
7. Edit `GOOGLE_REDIRECT_URI` to match production URL
8. **Redeploy** (Vercel dashboard → **Deployments** → **"Redeploy"**)

---

## Part 4: Custom Domain (Optional)

### Step 1: Add Domain in Vercel

1. In Vercel project, go to **Settings** → **Domains**
2. Enter your domain: `taskboard.yourdomain.com`
3. Click **"Add"**

### Step 2: Configure DNS

Vercel will show DNS records to add. In your domain registrar:

**Option A - CNAME (recommended for subdomain)**:
```
Type: CNAME
Name: taskboard
Value: cname.vercel-dns.com
```

**Option B - A Record (for apex domain)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: Wait for DNS Propagation

- Can take 5 minutes to 48 hours
- Vercel will auto-issue SSL certificate when ready
- Check status in **Domains** tab

### Step 4: Update Google OAuth

1. Go to Google Cloud Console → **Credentials**
2. Edit OAuth client
3. Add custom domain redirect URI:
   - `https://taskboard.yourdomain.com/api/calendar/auth`
4. Save

---

## Part 5: Automated Syncing (Cron Jobs)

Set up scheduled task synchronization from email or external systems.

### Step 1: Create Cron Job in Vercel

1. Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/ai-sync/cron",
      "schedule": "0 6,7,8,9,10,12,14,18 * * *"
    }
  ]
}
```

**Schedule Explanation**:
- `0 6,7,8,9,10,12,14,18 * * *`
- Runs at: 6am, 7am, 8am, 9am, 10am, 12pm, 2pm, 6pm (UTC)
- Adjust to your timezone
- [Cron syntax reference](https://crontab.guru/)

2. Create API route `src/app/api/ai-sync/cron/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireAiToken } from "@/lib/utils";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your email scanning logic or external API call
  // Example: Fetch tasks from external system
  const externalTasks = await fetchFromExternalSystem();

  // Push to AI sync endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai-sync`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AI_SECRET_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ tasks: externalTasks })
  });

  return Response.json({
    ok: true,
    synced: externalTasks.length
  });
}
```

3. Add environment variable in Vercel:
   - `CRON_SECRET`: Generate with `openssl rand -hex 32`
   - `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app`

4. Commit and push:
```bash
git add vercel.json src/app/api/ai-sync/cron/route.ts
git commit -m "Add cron job for automated sync"
git push
```

### Step 2: Verify Cron Execution

1. In Vercel, go to **Deployments** → **"Logs"**
2. Wait for scheduled time
3. Check logs for cron execution
4. Look for `/api/ai-sync/cron` requests

---

## Part 6: Monitoring & Analytics

### Step 1: Enable Vercel Analytics

1. In Vercel project, go to **Analytics** tab
2. Click **"Enable Analytics"**
3. Free tier includes:
   - Page views
   - Top pages
   - Top referrers
   - Unique visitors

### Step 2: Enable Vercel Speed Insights

1. Go to **Speed Insights** tab
2. Click **"Enable Speed Insights"**
3. Install package:
```bash
pnpm add @vercel/speed-insights
```

4. Add to `src/app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Step 3: Supabase Monitoring

1. In Supabase dashboard, go to **Reports**
2. Monitor:
   - Database size
   - API requests
   - Auth users (when implemented)

### Step 4: Set Up Alerts

**Vercel Alerts**:
1. Go to **Settings** → **Notifications**
2. Enable email notifications for:
   - Deployment failures
   - Performance degradation

**Supabase Alerts**:
1. Go to **Settings** → **Database**
2. Set up alerts for:
   - High database size
   - Connection limits

---

## Part 7: Security Hardening

### Step 1: Rotate Secrets Regularly

Schedule quarterly rotation of:
- `AI_SECRET_TOKEN`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_ENCRYPTION_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (in Supabase dashboard)

### Step 2: Enable HTTPS Only

1. In Vercel **Settings** → **Domains**
2. Enable **"Force HTTPS"** (enabled by default)

### Step 3: Configure CORS (if needed)

If you have external services calling your API:

1. Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'https://trusted-domain.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Step 4: Implement Rate Limiting

1. Install Upstash rate limiting:
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

2. Create rate limiter in `src/lib/ratelimit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});
```

3. Add to Vercel environment:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Part 8: Backup & Disaster Recovery

### Step 1: Database Backups

**Supabase Automatic Backups**:
- Free tier: Daily backups (7 day retention)
- Pro tier: Point-in-time recovery

**Manual Backup**:
```bash
# Install Supabase CLI
pnpm add -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Backup
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Step 2: Environment Variables Backup

Export all Vercel env vars:

1. In Vercel CLI:
```bash
npx vercel env pull .env.production
```

2. Store securely (encrypted, offline)

### Step 3: Code Repository

- Keep GitHub repository private
- Enable branch protection on `main`
- Require pull request reviews
- Enable status checks before merge

---

## Part 9: Performance Optimization

### Step 1: Enable Edge Functions

Move API routes to Edge Runtime for faster response:

```typescript
// src/app/api/tasks/route.ts
export const runtime = 'edge';
```

⚠️ **Note**: Edge Runtime has limitations (no Node.js APIs like `crypto`)

### Step 2: Optimize Database Queries

1. In Supabase SQL Editor:
```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
```

### Step 3: Enable ISR (Incremental Static Regeneration)

For dashboard pages:

```typescript
// src/app/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### Step 4: Optimize Images

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Auburn Hills"
/>
```

---

## Part 10: Troubleshooting Deployments

### Build Errors

**Error: "Cannot find module 'xyz'"**
- Solution: Run `pnpm install` locally, commit `pnpm-lock.yaml`

**Error: "Type error in file.ts"**
- Solution: Fix TypeScript errors locally, test with `npm run build`

**Error: "Environment variable not defined"**
- Solution: Double-check all env vars in Vercel settings

### Runtime Errors

**Error: "Failed to connect to Supabase"**
- Check `NEXT_PUBLIC_SUPABASE_URL` matches project URL
- Verify anon key is correct
- Check Supabase project is not paused

**Error: "Unauthorized" on /api/ai-sync**
- Verify `AI_SECRET_TOKEN` matches between client and Vercel
- Check `Authorization: Bearer <token>` header format

**Error: "Google Calendar not authorized"**
- Re-run OAuth flow at `/api/calendar/auth`
- Check redirect URI matches exactly in Google Console
- Verify cookie `gcal_refresh` is set (browser DevTools)

### Performance Issues

**Slow API responses**
- Add database indexes (see Part 9)
- Enable Edge Runtime where possible
- Check Supabase region matches Vercel region

**High database usage**
- Archive old completed tasks
- Optimize RLS policies
- Consider upgrading Supabase plan

---

## Part 11: Scaling Considerations

### When to Upgrade Plans

**Vercel Pro ($20/mo)**:
- Needed when:
  - More than 100GB bandwidth/month
  - Team collaboration required
  - Advanced analytics needed

**Supabase Pro ($25/mo)**:
- Needed when:
  - More than 500MB database
  - More than 2GB file storage
  - More than 50k monthly active users

### Horizontal Scaling

1. **Database Connection Pooling**:
   - Supabase handles this automatically
   - Use `pgBouncer` in connection string

2. **Caching Layer**:
   - Add Redis for session storage
   - Cache frequent queries

3. **CDN for Assets**:
   - Vercel handles this automatically
   - Static assets served from Edge network

---

## Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database schema and policies applied in Supabase
- [ ] Google OAuth redirect URI matches production URL
- [ ] Custom domain configured and SSL active
- [ ] Cron jobs scheduled and tested
- [ ] Analytics and monitoring enabled
- [ ] Error tracking configured
- [ ] Backup strategy implemented
- [ ] Security headers reviewed
- [ ] Rate limiting configured
- [ ] Performance optimization applied
- [ ] Documentation updated with production URLs
- [ ] Test all critical user flows
- [ ] Load testing completed (optional)

---

## Post-Deployment Testing

### Smoke Tests

```bash
# Replace with your production URL
PROD_URL="https://your-app.vercel.app"

# Test homepage
curl -I $PROD_URL

# Test API
curl $PROD_URL/api/tasks

# Test AI sync authentication
curl -H "Authorization: Bearer wrong-token" $PROD_URL/api/ai-sync
# Should return 401

# Test task creation (requires service role - use Vercel logs)
```

### User Acceptance Testing

1. [ ] Create task via UI
2. [ ] Update task status
3. [ ] Filter by priority
4. [ ] Add task to Google Calendar
5. [ ] Verify cron job runs
6. [ ] Test mobile responsiveness

---

## Rollback Procedure

If deployment fails:

1. In Vercel dashboard → **Deployments**
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**
4. Monitor for 5 minutes to ensure stability

---

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Google OAuth Guide**: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

---

## Conclusion

You now have a production-ready Auburn Hills Taskboard deployment with:
- ✅ Secure database and API
- ✅ Google Calendar integration
- ✅ Automated task synchronization
- ✅ Monitoring and analytics
- ✅ Backup and recovery strategy

For questions or issues, refer to the [main README](./README.md) or open an issue on GitHub.

**Happy task managing! 🚀**
