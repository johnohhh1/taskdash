import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const priority = url.searchParams.get("priority") || undefined;

  const sb = supabaseAdmin();
  let query = sb
    .from("tasks")
    .select("*")
    .order("due", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

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

  const { data, error } = await sb
    .from("tasks")
    .upsert(
      parsed.map((t) => ({
        ...t,
        source: t.source ? t.source : null,
        tags: t.tags ?? null,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "id" }
    )
    .select("*");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ tasks: data });
}
