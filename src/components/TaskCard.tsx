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
