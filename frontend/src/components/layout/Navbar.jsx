import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Base";
import { LayoutDashboard, LogOut, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Career<span className="text-indigo-500">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                   <User className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
