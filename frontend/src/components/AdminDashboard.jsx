function badgeClass(segment) {
  if (segment === "Ready") return "bg-emerald-500/20 text-emerald-300";
  if (segment === "Moderate") return "bg-amber-500/20 text-amber-300";
  return "bg-rose-500/20 text-rose-300";
}

function skillClass(status) {
  if (status === "Good") return "text-emerald-300";
  if (status === "Weak") return "text-amber-300";
  return "text-rose-300";
}

export default function AdminDashboard({ insights, students, selectedStudent, onSelectStudent }) {
  const total = insights?.total_students || 0;
  const avg = insights?.average_placement_probability || 0;
  const atRisk = insights?.at_risk_count || 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Avg Placement Probability</p>
          <p className="mt-2 text-3xl font-bold text-white">{avg}%</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">High Risk Students</p>
          <p className="mt-2 text-3xl font-bold text-rose-300">{atRisk}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Admin Alerts</h3>
        <div className="mt-3 space-y-2">
          {(insights?.alerts || []).map((alert, idx) => (
            <div
              key={`${alert}-${idx}`}
              className="rounded-lg border border-amber-300/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-3 py-2 text-sm text-amber-100"
            >
              {alert}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Student Overview</h3>
          <div className="mt-3 max-h-[460px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Probability</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Skills</th>
                </tr>
              </thead>
              <tbody className="text-slate-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/40"
                    onClick={() => onSelectStudent(student)}
                  >
                    <td className="py-2">{student.name}</td>
                    <td className="py-2">{student.placement_probability}%</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${badgeClass(student.segment)}`}>
                        {student.segment}
                      </span>
                    </td>
                    <td className={`py-2 text-xs ${skillClass(student.skill_status)}`}>{student.skill_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Student Drill-down</h3>
          {!selectedStudent ? (
            <p className="mt-3 text-sm text-slate-400">Select a student from the table to inspect details.</p>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-slate-200">
              <p>
                <span className="font-medium text-white">Name:</span> {selectedStudent.name}
              </p>
              <p>
                <span className="font-medium text-white">Placement Probability:</span>{" "}
                {selectedStudent.placement_probability}%
              </p>
              <p>
                <span className="font-medium text-white">Segment:</span> {selectedStudent.segment}
              </p>
              <div>
                <p className="font-medium text-white">Weak Areas</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedStudent.analysis?.missing_skills || []).map((skill) => (
                    <span key={skill} className="rounded-full bg-rose-500/20 px-2 py-1 text-xs text-rose-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-white">Action Plan</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {(selectedStudent.tasks || []).map((task, idx) => (
                    <li key={`${task.title}-${idx}`}>
                      {task.title} ({task.priority})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

