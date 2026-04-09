import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  MessageSquare, 
  UserCircle, 
  CreditCard, 
  Settings,
  Briefcase
} from "lucide-react";
import { cn } from "../ui/Base";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["student", "admin", "org_owner"] },
  { icon: FileText, label: "Resume Analysis", path: "/resume", roles: ["student"] },
  { icon: Target, label: "Mock Interview", path: "/interview", roles: ["student"] },
  { icon: MessageSquare, label: "AI Mentor", path: "/chat", roles: ["student"] },
  { icon: Briefcase, label: "Job Tracker", path: "/jobs", roles: ["student"] },
  { icon: CreditCard, label: "Billing", path: "/billing", roles: ["org_owner", "admin"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["student", "admin", "org_owner"] },
];

export function Sidebar({ role }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 hidden w-64 border-r border-white/5 bg-slate-950/20 backdrop-blur-sm lg:block">
      <div className="flex flex-col gap-2 p-4">
        {navItems
          .filter(item => item.roles.includes(role))
          .map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 shadow-sm" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
      </div>
    </aside>
  );
}
