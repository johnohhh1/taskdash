import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema, requireAiToken, UpsertTask } from "@/lib/utils";

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
  const parsed = items.map((t: unknown) => TaskSchema.parse(t)).map((t: UpsertTask) => ({
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
