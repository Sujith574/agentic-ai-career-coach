function stageClasses(stage) {
  if (stage === "analyze") return "bg-blue-500/20 text-blue-200 border-blue-400/30";
  if (stage === "decide") return "bg-violet-500/20 text-violet-200 border-violet-400/30";
  return "bg-emerald-500/20 text-emerald-200 border-emerald-400/30";
}

export default function AgentTimeline({ events }) {
  const latest = events[0];

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Agent Decision Timeline</h3>
        <span className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-300">
          {events.length} events
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <p className="text-xs text-emerald-200">Agent monitoring progress every 15s</p>
        </div>
        <p className="text-[10px] text-emerald-100/80">
          Last pulse: {latest ? new Date(latest.timestamp).toLocaleTimeString() : "waiting..."}
        </p>
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">Timeline appears after resume analysis.</p>
      ) : (
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
          {events.map((event, idx) => (
            <div
              key={`${event.timestamp}-${idx}`}
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${stageClasses(
                    event.stage
                  )}`}
                >
                  {event.stage}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-slate-100">{event.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

