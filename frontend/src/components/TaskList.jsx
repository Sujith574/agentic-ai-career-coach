function priorityClasses(priority) {
  if (priority === "High") return "bg-rose-500/20 text-rose-300";
  if (priority === "Medium") return "bg-amber-500/20 text-amber-300";
  return "bg-emerald-500/20 text-emerald-300";
}

export default function TaskList({ tasks, onToggleTask }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <h3 className="text-lg font-semibold text-white">Agentic Task List</h3>
      <div className="mt-4 space-y-3">
        {tasks.map((item, idx) => (
          <div
            key={`${item.task}-${idx}`}
            className="rounded-lg border border-slate-800 bg-slate-950 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-100">{item.task}</p>
              <span className={`rounded-full px-2 py-1 text-xs ${priorityClasses(item.priority)}`}>
                {item.priority}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`text-xs ${
                  item.status === "Completed" ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {item.status}
              </span>
              <button
                onClick={() => onToggleTask(idx)}
                className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                Mark {item.status === "Pending" ? "Completed" : "Pending"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
