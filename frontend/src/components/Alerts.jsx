export default function Alerts({ tasks, analysis }) {
  const pendingCount = tasks.filter((task) => task.status === "Pending").length;
  const alerts = [];

  if (pendingCount > 0) {
    alerts.push(`You have ${pendingCount} pending tasks`);
  }
  if (pendingCount >= 2) {
    alerts.push("You missed your daily practice");
  }
  if ((analysis?.placement_probability || 0) < 70) {
    alerts.push("Placement readiness is below 70%. Complete high-priority tasks today.");
  }
  if ((analysis?.missing_skills || []).length > 0) {
    alerts.push(`Critical gap detected: ${analysis.missing_skills.join(", ")}`);
  }
  if (alerts.length === 0) {
    alerts.push("Great consistency. Agent monitoring shows strong momentum.");
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h3 className="text-lg font-semibold text-white">Smart Alerts</h3>
      <div className="mt-4 space-y-2">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-amber-300/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-3 py-2 text-sm text-amber-100"
          >
            {alert}
          </div>
        ))}
      </div>
    </div>
  );
}
