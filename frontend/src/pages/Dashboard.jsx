import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { 
  BarChart3, 
  CheckCircle2, 
  Target, 
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  MessageCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const demoResume = {
  skills: ["HTML", "CSS"],
  missing_skills: ["DSA", "React"],
  projects: 1,
  experience_level: "Beginner",
  suggested_roles: ["Frontend Developer"],
  placement_probability: 55,
  resume_text: "Demo profile.",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(demoResume);
  const [tasks, setTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const timelineRes = await apiRequest("/api/v1/timeline", { method: "GET" }).catch(() => ({ events: [] }));
        setTimelineEvents(timelineRes.events || []);

        const taskRes = await apiRequest("/api/v1/tasks/generate", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: demoResume })
        }).catch(() => ({ tasks: [] }));
        setTasks(taskRes.tasks || []);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const openInNewTab = (path) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-2">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-black text-white italic">SESSION.ACTIVE_{user?.name?.toUpperCase()}</h2>
          <p className="text-slate-500 mt-2 font-mono text-xs uppercase tracking-[0.4em]">Career Trajectory Analysis // v2.0</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="gap-2 border-white/5 bg-slate-900 shadow-xl" onClick={() => openInNewTab("/resume-analysis")}>
             <ExternalLink className="h-4 w-4" /> Full Report
           </Button>
           <Button className="gap-2 shadow-indigo-600/20 shadow-lg" onClick={() => openInNewTab("/mock-interview")}>
             <PlayCircle className="h-4 w-4" /> Live Session
           </Button>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Readiness", val: `${analysis.placement_probability}%`, icon: BarChart3, color: "text-indigo-400" },
          { label: "Completed", val: `${tasks.filter(t=>t.status==='Completed').length}/${tasks.length}`, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Target", val: analysis.suggested_roles[0], icon: Target, color: "text-blue-400" }
        ].map((item, i) => (
          <Card key={i} className="bg-slate-900/50 border-white/5 backdrop-blur-3xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</p>
                 <h3 className="text-2xl font-black text-white">{item.val}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card className="bg-slate-900/40 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
                <Target className="h-5 w-5 text-indigo-500" /> Operational Tasks
              </h3>
            </div>
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${task.status === "Completed" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                    <span className={`text-sm font-bold ${task.status === "Completed" ? "text-slate-600 line-through" : "text-slate-200"}`}>{task.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{task.priority}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <div 
              onClick={() => openInNewTab("/resume-analysis")}
              className="cursor-pointer group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900 p-8 hover:border-indigo-500/50 transition-all"
            >
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <h4 className="text-xl font-black text-white uppercase">Analyze_Resume</h4>
              <p className="text-sm text-slate-500 mt-2">Open advanced scanner in new terminal.</p>
              <ExternalLink className="absolute top-6 right-6 h-4 w-4 text-slate-700 group-hover:text-indigo-400" />
            </div>

            <div 
              onClick={() => openInNewTab("/mock-interview")}
              className="cursor-pointer group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900 p-8 hover:border-emerald-500/50 transition-all"
            >
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h4 className="text-xl font-black text-white uppercase">Mock_Simulation</h4>
              <p className="text-sm text-slate-500 mt-2">Initialize AI interview environment.</p>
              <ExternalLink className="absolute top-6 right-6 h-4 w-4 text-slate-700 group-hover:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-950/80 p-6 border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Event_Registry
              </h3>
              <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-8">
                     <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border border-indigo-500/50 bg-slate-950 flex items-center justify-center">
                        <div className="h-1 w-1 bg-indigo-400 rounded-full" />
                     </div>
                     <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">{event.stage}</p>
                     <p className="text-sm text-slate-300 font-medium">{event.message}</p>
                     <p className="text-[9px] text-slate-600 mt-1 uppercase font-mono">{new Date(event.created_at).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function PlayCircle(props) {
  return <Circle {...props}><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" /></Circle>
}
function Circle({ children, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" />{children}</svg>
}
