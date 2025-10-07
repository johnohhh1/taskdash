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
