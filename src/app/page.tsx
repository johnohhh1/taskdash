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
