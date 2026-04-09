export default function SidebarNav({ current, onNavigate }) {
  const items = [
    { id: "student", label: "Student Dashboard", path: "/student-dashboard" },
    { id: "admin", label: "Admin Dashboard", path: "/admin-dashboard" },
  ];

  return (
    <aside className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-4 lg:w-64">
      <p className="text-xs uppercase tracking-wide text-slate-400">CareerOS</p>
      <h2 className="mt-1 text-lg font-semibold text-white">University Placement SaaS</h2>
      <nav className="mt-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              current === item.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-slate-800/70 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

