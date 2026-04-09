export default function Alerts({ tasks }) {
  const pendingCount = tasks.filter((task) => task.status === "Pending").length;
  const alerts = [];

  if (pendingCount > 0) {
    alerts.push(`You have ${pendingCount} incomplete tasks`);
  }
  if (pendingCount >= 2) {
    alerts.push("You missed your daily practice");
  }
  if (alerts.length === 0) {
    alerts.push("Great consistency. Keep this momentum.");
  }

  return (
    <div className="rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <h3 className="text-lg font-semibold text-white">Smart Alerts</h3>
      <div className="mt-4 space-y-2">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
          >
            {alert}
          </div>
        ))}
      </div>
    </div>
  );
}
