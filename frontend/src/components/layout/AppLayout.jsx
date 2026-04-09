import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export function AppLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex pt-16">
        {user && <Sidebar role={user.role} />}
        <main className={`flex-1 ${user ? "lg:pl-64" : ""}`}>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
