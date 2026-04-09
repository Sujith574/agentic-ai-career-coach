import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  MessageSquare, 
  UserCircle, 
  CreditCard, 
  Settings,
  Briefcase,
  Users,
  BarChart,
  ShieldAlert
} from "lucide-react";
import { cn } from "../ui/Base";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", roles: ["student", "admin"] },
  
  // Student specific
  { icon: FileText, label: "Resume Analysis", path: "/resume-analysis", roles: ["student"] },
  { icon: Target, label: "Mock Interviews", path: "/mock-interview", roles: ["student"] },
  { icon: MessageSquare, label: "AI Career Coach", path: "/dashboard", roles: ["student"] },
  { icon: Briefcase, label: "Opportunities", path: "/dashboard", roles: ["student"] },
  
  // Admin specific
  { icon: Users, label: "Student Catalog", path: "/dashboard", roles: ["admin"] },
  { icon: ShieldAlert, label: "Risk Management", path: "/dashboard", roles: ["admin"] },
  { icon: BarChart, label: "System Reports", path: "/dashboard", roles: ["admin"] },
  
  // Shared
  { icon: CreditCard, label: "University Billing", path: "/billing", roles: ["student", "admin"] },
  { icon: Settings, label: "System Settings", path: "/dashboard", roles: ["student", "admin"] },
];

export function Sidebar({ role }) {
  const location = useLocation();
  const userRole = role === "org_owner" ? "admin" : role;

  return (
    <aside className="fixed left-0 top-16 bottom-0 hidden w-64 border-r border-white/5 bg-slate-950/20 backdrop-blur-3xl lg:block">
      <div className="flex flex-col gap-2 p-6">
        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 italic">Navigation.Core</p>
        {navItems
          .filter(item => item.roles.includes(userRole))
          .map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-300")} />
                {item.label}
              </Link>
            );
          })}
      </div>
      
      <div className="absolute bottom-10 left-6 right-6">
         <div className="p-4 rounded-2xl bg-slate-900 border border-white/5">
            <h5 className="text-[10px] font-black text-white uppercase mb-2">Neural Link</h5>
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mb-2">
               <div className="h-full bg-indigo-500 w-2/3 animate-pulse" />
            </div>
            <p className="text-[8px] text-slate-500 font-mono uppercase">Sync_Status: High</p>
         </div>
      </div>
    </aside>
  );
}
