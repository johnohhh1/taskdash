import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  details: z.string().optional().nullable(),
  source: z.object({
    sender: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    message_id: z.string().optional().nullable()
  }).partial().optional().nullable(),
  due: z.string().datetime().optional().nullable(),
  priority: z.enum(["High","Med","Low"]).optional().nullable(),
  status: z.enum(["Todo","In Progress","Waiting","Done"]).default("Todo").optional(),
  owner: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable()
});

export type UpsertTask = z.infer<typeof TaskSchema>;

export function requireAiToken(headers: Headers) {
  const token = headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token || token !== process.env.AI_SECRET_TOKEN) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
