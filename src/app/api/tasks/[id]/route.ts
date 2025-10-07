import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { TaskSchema } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = supabaseAdmin();
  const patch = await req.json();
  const partial = TaskSchema.partial().parse(patch);

  const { data, error } = await sb
    .from("tasks")
    .update({
      ...partial,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.id)
    .select("*")
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ task: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("tasks").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
