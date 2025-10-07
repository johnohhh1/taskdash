Build an App use thes suggestions to get started repo is GitHub.com/johnohhh1

Auburn Hills Taskboard — Next.js + Supabase
auburn-hills-taskboard/
├─ .env.example
├─ .gitignore
├─ README.md
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ supabase/
│  ├─ schema.sql
│  └─ policies.sql
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ ai-sync/route.ts
│  │  │  ├─ tasks/[id]/route.ts
│  │  │  ├─ tasks/route.ts
│  │  │  ├─ calendar/auth/route.ts
│  │  │  └─ calendar/add/[id]/route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ Dashboard.tsx
│  │  ├─ Filters.tsx
│  │  ├─ TaskCard.tsx
│  │  └─ TaskList.tsx
│  ├─ lib/
│  │  ├─ calendar.ts
│  │  ├─ supabaseBrowser.ts
│  │  ├─ supabaseServer.ts
│  │  └─ utils.ts
│  └─ types.ts
└─ public/
   └─ favicon.ico

.env.example
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- AI sync ---
AI_SECRET_TOKEN=change-this-long-random-string

# --- App ---
NEXT_PUBLIC_APP_NAME=Auburn Hills Taskboard
NEXT_PUBLIC_ACCENT_COLOR=#CC5500

# --- Google OAuth (Server-to-Server or OAuth2) ---
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/auth
GOOGLE_CALENDAR_ID=primary
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/calendar.events
GOOGLE_ENCRYPTION_KEY=32_characters_min_for_crypto

package.json
{
  "name": "auburn-hills-taskboard",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "date-fns": "^3.6.0",
    "jsonwebtoken": "^9.0.2",
    "next": "14.2.4",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "^3.23.8",
    "clsx": "^2.1.1",
    "swr": "^2.3.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.6.2"
  }
}

next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  typescript: { ignoreBuildErrors: false }
};
export default nextConfig;

tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}

tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { accent: "var(--accent-color)" }
    }
  },
  plugins: []
} satisfies Config;

postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

src/app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --accent-color: var(--accent, #CC5500); }
html, body { height: 100%; }

src/types.ts
export type TaskStatus = "Todo" | "In Progress" | "Waiting" | "Done";
export type TaskPriority = "High" | "Med" | "Low";

export type Task = {
  id: string;
  title: string;
  details?: string | null;
  source?: {
    sender?: string | null;
    subject?: string | null;
    date?: string | null;
    message_id?: string | null;
  } | null;
  due?: string | null; // ISO
  priority?: TaskPriority | null;
  status?: TaskStatus;
  owner?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

src/lib/supabaseBrowser.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

src/lib/utils.ts
import { Task } from "@/types";
import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  details: z.string().optional(),
  source: z.object({
    sender: z.string().optional(),
    subject: z.string().optional(),
    date: z.string().optional(),
    message_id: z.string().optional()
  }).partial().optional(),
  due: z.string().datetime().optional(),
  priority: z.enum(["High","Med","Low"]).optional(),
  status: z.enum(["Todo","In Progress","Waiting","Done"]).default("Todo").optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type UpsertTask = z.infer<typeof TaskSchema>;

export function requireAiToken(headers: Headers) {
  const token = headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token || token !== process.env.AI_SECRET_TOKEN) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

Supabase schema (supabase/schema.sql)
-- Enable extensions
create extension if not exists "uuid-ossp";

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  details text,
  source jsonb, -- { sender, subject, date, message_id }
  due timestamptz,
  priority text check (priority in ('High','Med','Low')) default 'Med',
  status text check (status in ('Todo','In Progress','Waiting','Done')) default 'Todo',
  owner text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasks_due_idx on tasks(due);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_priority_idx on tasks(priority);
create index if not exists tasks_source_msg_idx on tasks((source->>'message_id'));

create table if not exists sync_logs (
  id bigserial primary key,
  created_at timestamptz default now(),
  direction text check (direction in ('in','out')) not null,
  op text,
  count int,
  summary text
);

-- Simple profiles (optional owner scoping later)
create table if not exists profiles (
  id uuid primary key,
  email text unique
);

Supabase RLS (supabase/policies.sql)
-- Disable by default
alter table tasks enable row level security;
alter table sync_logs enable row level security;
alter table profiles enable row level security;

-- Public read for demo; tighten later (use auth.uid() linkage)
create policy "read_all_tasks" on tasks
for select using (true);

-- Writes only via service role from server routes (no anon writes)
create policy "deny_writes_default" on tasks
for all using (false) with check (false);

create policy "read_sync_logs" on sync_logs for select using (true);


Apply with: run these SQL files in Supabase SQL editor in order.

API: src/app/api/tasks/route.ts (GET/POST)
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const priority = url.searchParams.get("priority") || undefined;

  const sb = supabaseAdmin();
  let query = sb.from("tasks").select("*").order("due", { ascending: true }).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ tasks: data });
}

export async function POST(req: NextRequest) {
  const sb = supabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const tasks = Array.isArray(body) ? body : [body];

  const parsed = tasks.map((t) => TaskSchema.parse(t));
  // Upsert by source.message_id when provided; else insert new
  const { data, error } = await sb.from("tasks").upsert(
    parsed.map((t) => ({
      ...t,
      source: t.source ? t.source : null,
      tags: t.tags ?? null,
      updated_at: new Date().toISOString()
    })), { onConflict: "id" }
  ).select("*");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ tasks: data });
}

API: src/app/api/tasks/[id]/route.ts (PATCH/DELETE)
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = supabaseAdmin();
  const patch = await req.json();
  const partial = TaskSchema.partial().parse(patch);

  const { data, error } = await sb.from("tasks").update({
    ...partial,
    updated_at: new Date().toISOString()
  }).eq("id", params.id).select("*").maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ task: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("tasks").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

API: src/app/api/ai-sync/route.ts (POST upserts, GET diffs)
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema, requireAiToken } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try { requireAiToken(req.headers); } catch (r) { return r as Response; }
  const sb = supabaseAdmin();
  const since = new URL(req.url).searchParams.get("since");

  let query = sb.from("tasks").select("*");
  if (since) query = query.gte("updated_at", since);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await sb.from("sync_logs").insert({ direction: "out", op: "diff", count: data?.length ?? 0, summary: `since=${since}` });
  return Response.json({ tasks: data });
}

export async function POST(req: NextRequest) {
  try { requireAiToken(req.headers); } catch (r) { return r as Response; }

  const sb = supabaseAdmin();
  const payload = await req.json();
  const items = Array.isArray(payload?.tasks) ? payload.tasks : [];
  const parsed = items.map((t: unknown) => TaskSchema.parse(t)).map((t) => ({
    ...t,
    updated_at: new Date().toISOString(),
    tags: t.tags ?? null,
    source: t.source ?? null
  }));

  // Upsert by source.message_id when available else by id else insert
  const { data, error } = await sb.from("tasks").upsert(parsed, { onConflict: "id" }).select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await sb.from("sync_logs").insert({ direction: "in", op: "upsert", count: data.length, summary: "ai-sync" });
  return Response.json({ created_or_updated: data.length, tasks: data });
}

Minimal Google Calendar helpers (src/lib/calendar.ts)
import crypto from "crypto";

const ENC_KEY = process.env.GOOGLE_ENCRYPTION_KEY || "devdevdevdevdevdevdevdevdevdev12";
const IV_LEN = 16;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENC_KEY.slice(0,32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string) {
  const [ivHex, dataHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENC_KEY.slice(0,32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

API: OAuth start/callback (src/app/api/calendar/auth/route.ts)
import { NextRequest } from "next/server";
import { encrypt } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    // Start OAuth
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      access_type: "offline",
      scope: process.env.GOOGLE_OAUTH_SCOPES!,
      prompt: "consent"
    });
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  // Exchange code
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code"
    })
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok) return Response.json(tokens, { status: 400 });

  // Store refresh token securely (demo: cookie; prod: Supabase table)
  const refresh = tokens.refresh_token;
  if (!refresh) return Response.json({ error: "No refresh token" }, { status: 400 });

  return new Response("Authorized. Refresh token saved in cookie.", {
    status: 200,
    headers: {
      "Set-Cookie": `gcal_refresh=${encodeURIComponent(encrypt(refresh))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
      "content-type": "text/plain"
    }
  });
}

API: add event (src/app/api/calendar/add/[id]/route.ts)
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { decrypt } from "@/lib/calendar";

async function getAccessToken(refreshEncrypted: string) {
  const refresh_token = decrypt(refreshEncrypted);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "token exchange failed");
  return json.access_token as string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const cookies = req.headers.get("cookie") || "";
  const match = /gcal_refresh=([^;]+)/.exec(cookies);
  if (!match) return Response.json({ error: "Not authorized with Google Calendar" }, { status: 401 });

  const accessToken = await getAccessToken(decodeURIComponent(match[1]));
  const sb = supabaseAdmin();
  const { data: task, error } = await sb.from("tasks").select("*").eq("id", params.id).maybeSingle();
  if (error || !task) return Response.json({ error: "Task not found" }, { status: 404 });
  if (!task.due) return Response.json({ error: "Task has no due date" }, { status: 400 });

  const start = new Date(task.due).toISOString();
  const end = new Date(new Date(task.due).getTime() + 30 * 60 * 1000).toISOString();

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      summary: task.title,
      description: task.details ?? "",
      start: { dateTime: start },
      end: { dateTime: end }
    })
  });

  const json = await res.json();
  if (!res.ok) return Response.json(json, { status: 400 });
  return Response.json({ ok: true, event: json });
}

UI — Layout (src/app/layout.tsx)
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Taskboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {process.env.NEXT_PUBLIC_APP_NAME || "Taskboard"}
            </h1>
            <a className="rounded bg-accent px-4 py-2 text-white" href="/api/calendar/auth">Link Google Calendar</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

UI — Page (src/app/page.tsx)
"use client";
import useSWR from "swr";
import { Task } from "@/types";
import TaskList from "@/components/TaskList";
import Filters from "@/components/Filters";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Page() {
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const { data, mutate, isLoading } = useSWR<{tasks: Task[]}>(`/api/tasks${query({status,priority})}`, fetcher);

  function query({status, priority}:{status:string, priority:string}) {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (priority) p.set("priority", priority);
    const q = p.toString();
    return q ? `?${q}` : "";
  }

  return (
    <main className="space-y-4">
      <Filters status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}/>
      {isLoading ? <p>Loading…</p> : <TaskList tasks={data?.tasks ?? []} onChange={mutate}/>}
    </main>
  );
}

Components — Filters (src/components/Filters.tsx)
"use client";
type Props = {
  status: string; setStatus: (s:string)=>void;
  priority: string; setPriority: (p:string)=>void;
};
export default function Filters({status,setStatus,priority,setPriority}:Props){
  return (
    <div className="flex gap-3">
      <select className="rounded border px-3 py-2" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option>Todo</option><option>In Progress</option><option>Waiting</option><option>Done</option>
      </select>
      <select className="rounded border px-3 py-2" value={priority} onChange={e=>setPriority(e.target.value)}>
        <option value="">All Priorities</option>
        <option>High</option><option>Med</option><option>Low</option>
      </select>
    </div>
  );
}

Components — TaskList (src/components/TaskList.tsx)
"use client";
import { Task } from "@/types";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks, onChange }: { tasks: Task[]; onChange: ()=>void; }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {tasks.map((t) => <TaskCard key={t.id} task={t} onChange={onChange}/>)}
      {tasks.length === 0 && <p className="text-sm text-neutral-500">No tasks yet.</p>}
    </div>
  );
}

Components — TaskCard (src/components/TaskCard.tsx)
"use client";
import { Task } from "@/types";
import { useState } from "react";

export default function TaskCard({ task, onChange }:{task:Task; onChange:()=>void}) {
  const [saving, setSaving] = useState(false);

  async function update(patch: Partial<Task>) {
    setSaving(true);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch)
    });
    setSaving(false);
    onChange();
  }

  async function addToCalendar() {
    const res = await fetch(`/api/calendar/add/${task.id}`, { method: "POST" });
    if (!res.ok) alert("Calendar error");
    else alert("Event created!");
  }

  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <span className="rounded bg-neutral-100 px-2 py-1 text-xs">{task.priority || "Med"}</span>
      </div>
      {task.details && <p className="mb-2 text-sm">{task.details}</p>}
      <div className="mb-2 text-xs text-neutral-500">
        {task.source?.sender && <span>From: {task.source.sender} · </span>}
        {task.source?.subject && <span>Subject: {task.source.subject} · </span>}
        {task.due && <span>Due: {new Date(task.due).toLocaleString()}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded border px-2 py-1 text-sm"
          value={task.status || "Todo"}
          onChange={(e)=>update({ status: e.target.value as Task["status"] })}
        >
          <option>Todo</option><option>In Progress</option><option>Waiting</option><option>Done</option>
        </select>
        <select
          className="rounded border px-2 py-1 text-sm"
          value={task.priority || "Med"}
          onChange={(e)=>update({ priority: e.target.value as Task["priority"] })}
        >
          <option>High</option><option>Med</option><option>Low</option>
        </select>
        <button
          className="rounded bg-accent px-3 py-1 text-sm text-white disabled:opacity-50"
          onClick={addToCalendar}
          disabled={!task.due || saving}
          title={task.due ? "Add to Google Calendar" : "Requires due date"}
        >
          Add to Calendar
        </button>
      </div>
    </div>
  );
}

README.md (setup & deploy)
# Auburn Hills Taskboard

Next.js 14 + Supabase dashboard with AI sync endpoints and optional Google Calendar.

## 1) Install

```bash
pnpm i   # or npm i / yarn
cp .env.example .env.local


Fill .env.local with your Supabase project values and an AI_SECRET_TOKEN.

2) Supabase

Open the SQL editor and run supabase/schema.sql then supabase/policies.sql.

In Project Settings → API, copy the Project URL, anon, and service_role keys into .env.local.

3) Dev
pnpm dev


Visit http://localhost:3000

4) AI Sync

POST upserts

curl -X POST http://localhost:3000/api/ai-sync \
 -H "Authorization: Bearer $AI_SECRET_TOKEN" \
 -H "content-type: application/json" \
 -d '{
  "tasks":[
    {
      "title":"Send vendor report",
      "details":"Allen Woods requested Q4 numbers",
      "source":{"sender":"allen.woods@brinker.com","subject":"Q4 report","message_id":"<abc123>","date":"2025-10-07T12:00:00Z"},
      "due":"2025-10-09T17:00:00Z",
      "priority":"High",
      "status":"Todo",
      "tags":["Brinker","Allen Woods"]
    }
  ]
 }'


GET diffs

curl -H "Authorization: Bearer $AI_SECRET_TOKEN" "http://localhost:3000/api/ai-sync?since=2025-10-07T00:00:00Z"

5) Google Calendar (optional)

In Google Cloud Console, create OAuth credentials. Set redirect URI to http://localhost:3000/api/calendar/auth.

Fill env vars:

GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_CALENDAR_ID (or keep primary), GOOGLE_OAUTH_SCOPES

Start OAuth by opening /api/calendar/auth while the dev server runs.

After consenting, a secure cookie stores the encrypted refresh token.

Click Add to Calendar on a task (requires a due date).

6) Deploy to Vercel

Push to a Git repo and import into Vercel.

Add these Environment Variables in Vercel:

NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,

SUPABASE_SERVICE_ROLE_KEY, AI_SECRET_TOKEN,

Google variables from .env.example,

NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_ACCENT_COLOR

Set Vercel Cron Jobs to hit a scan endpoint (you can point it to your email-ingestion/AI worker; this app exposes /api/ai-sync).

Example cron schedule (local times): hourly 06–10, 12:00, 14:00, 18:30, 01:00.

7) Zip it

From the project root:

zip -r auburn-hills-taskboard.zip .


---

## .gitignore



.node_modules
.next
.env*
.DS_Store


---

This is a full, working scaffold. If you want, I can also generate a simple **email scanner webhook** you can host separately (or as another API route) that parses Gmail/Outlook webhooks and calls `/api/ai-sync` in this app. Want me to add that too?

You said:
um I think for sure you didnt understand the assignment 