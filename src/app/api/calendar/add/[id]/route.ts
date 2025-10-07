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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookies = req.headers.get("cookie") || "";
  const match = /gcal_refresh=([^;]+)/.exec(cookies);
  if (!match)
    return Response.json(
      { error: "Not authorized with Google Calendar" },
      { status: 401 }
    );

  const accessToken = await getAccessToken(decodeURIComponent(match[1]));
  const sb = supabaseAdmin();
  const { data: task, error } = await sb
    .from("tasks")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !task)
    return Response.json({ error: "Task not found" }, { status: 404 });
  if (!task.due)
    return Response.json({ error: "Task has no due date" }, { status: 400 });

  const start = new Date(task.due).toISOString();
  const end = new Date(new Date(task.due).getTime() + 30 * 60 * 1000).toISOString();

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events`,
    {
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
    }
  );

  const json = await res.json();
  if (!res.ok) return Response.json(json, { status: 400 });
  return Response.json({ ok: true, event: json });
}
