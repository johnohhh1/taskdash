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
