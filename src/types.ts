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
