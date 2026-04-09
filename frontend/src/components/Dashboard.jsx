import Alerts from "./Alerts";
import AgentTimeline from "./AgentTimeline";
import ChatBox from "./ChatBox";
import TaskList from "./TaskList";

function ProgressBar({ value }) {
  return (
    <div className="mt-3">
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={`h-full rounded-full transition-all ${
            value >= 70
              ? "bg-gradient-to-r from-emerald-500 to-lime-400"
              : value >= 50
              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
              : "bg-gradient-to-r from-rose-500 to-orange-400"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}%</p>
      <p className="text-xs text-slate-400">Placement Probability</p>
    </div>
  );
}

export default function Dashboard({
  analysis,
  tasks,
  onToggleTask,
  chatMessages,
  onChatSend,
  chatLoading,
  onStartMockInterview,
  mockQuestions,
  mockLoading,
  timelineEvents,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-400/20 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Placement Readiness</h2>
          <div className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
            AI-calculated score
          </div>
        </div>
        <ProgressBar value={analysis.placement_probability || 0} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Resume Summary</h3>
          <div className="mt-3 space-y-3 text-sm">
            <p className="text-slate-300">
              <span className="font-medium text-white">Experience:</span>{" "}
              {analysis.experience_level || "Beginner"}
            </p>
            <p className="text-slate-300">
              <span className="font-medium text-white">Projects:</span> {analysis.projects || 0}
            </p>
            <p className="text-slate-300">
              <span className="font-medium text-white">Suggested Roles:</span>{" "}
              {(analysis.suggested_roles || []).join(", ") || "Not available"}
            </p>
            <div>
              <p className="font-medium text-white">Skills Detected</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-white">Skill Gaps</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.missing_skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-rose-500/20 px-2 py-1 text-xs text-rose-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <TaskList tasks={tasks} onToggleTask={onToggleTask} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChatBox messages={chatMessages} onSend={onChatSend} loading={chatLoading} />
        <div className="space-y-5">
          <AgentTimeline events={timelineEvents} />
          <Alerts tasks={tasks} analysis={analysis} />
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Mock Interview</h3>
              <button
                onClick={onStartMockInterview}
                disabled={mockLoading}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-70"
              >
                {mockLoading ? "Loading..." : "Start Mock Interview"}
              </button>
            </div>
            {mockQuestions ? (
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div>
                  <p className="font-medium text-white">Technical (3)</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {mockQuestions.technical.map((q, idx) => (
                      <li key={`t-${idx}`}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white">HR (2)</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {mockQuestions.hr.map((q, idx) => (
                      <li key={`h-${idx}`}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Generate questions based on resume profile.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
