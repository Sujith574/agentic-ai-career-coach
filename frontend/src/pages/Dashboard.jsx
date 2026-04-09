import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { 
  BarChart3, 
  CheckCircle2, 
  Timeline, 
  MessageCircle, 
  Target, 
  FileText,
  AlertCircle,
  TrendingUp,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const demoResume = {
  skills: ["HTML", "CSS"],
  missing_skills: ["DSA", "React"],
  projects: 1,
  experience_level: "Beginner",
  suggested_roles: ["Frontend Developer"],
  placement_probability: 55,
  resume_text: "Demo fallback candidate profile with no internships.",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    readinessScore: 0
  });

  useEffect(() => {
    async function initDashboard() {
      try {
        // In a real app, we'd fetch actual usage and user data here
        // For the demo, we'll try to load existing analysis or use demo
        const resumeData = await apiRequest("/api/v1/timeline", { method: "GET" }).catch(() => ({ events: [] }));
        
        // Mocking some data for the first load
        setAnalysis(demoResume);
        setTasks([
          { title: "Solve 10 DSA problems daily", priority: "High", status: "Pending" },
          { title: "Build 2 real-world projects", priority: "High", status: "Pending" },
          { title: "Apply to internships on LinkedIn", priority: "Medium", status: "Pending" },
        ]);
        setTimelineEvents([
           { stage: "analyze", message: "System initialized", created_at: new Date().toISOString() }
        ]);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  useEffect(() => {
    setStats({
      tasksCompleted: tasks.filter(t => t.status === "Completed").length,
      totalTasks: tasks.length,
      readinessScore: analysis?.placement_probability || 0
    });
  }, [tasks, analysis]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold text-white">Welcome, {user?.name}</h2>
          <p className="text-slate-400 mt-1">Here's your career progress overview for today.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="gap-2">
             <BarChart3 className="h-4 w-4" /> Reports
           </Button>
           <Button className="gap-2">
             <TrendingUp className="h-4 w-4" /> Goal Tracker
           </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="flex items-center gap-4 bg-indigo-600/10 border-indigo-500/20">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Readiness Score</p>
               <h3 className="text-2xl font-bold text-white">{stats.readinessScore}%</h3>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="flex items-center gap-4 bg-emerald-600/10 border-emerald-500/20">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Tasks Completed</p>
               <h3 className="text-2xl font-bold text-white">{stats.tasksCompleted}/{stats.totalTasks}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="flex items-center gap-4 bg-blue-600/10 border-blue-500/20">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div>
               <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Target Roles</p>
               <h3 className="text-lg font-bold text-white truncate max-w-[150px]">
                 {analysis?.suggested_roles?.[0] || "Frontend dev"}
               </h3>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Main Content Areas */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" /> Active Tasks
              </h3>
              <span className="text-xs text-slate-500 uppercase font-semibold">Updated Just Now</span>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div 
                  key={idx}
                  className="group flex items-center justify-between p-4 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${task.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span className={`text-sm ${task.status === "Completed" ? "text-slate-500 line-through" : "text-white"}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    task.priority === "High" ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
             <Card className="flex flex-col items-center justify-center text-center p-10 hover:border-indigo-500/30 transition-all cursor-pointer group">
                <div className="h-14 w-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Resume Feedback</h4>
                <p className="text-sm text-slate-500 mt-2">Get AI-powered analysis of your current resume profile.</p>
             </Card>

             <Card className="flex flex-col items-center justify-center text-center p-10 hover:border-emerald-500/30 transition-all cursor-pointer group">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Mock Interview</h4>
                <p className="text-sm text-slate-500 mt-2">Practice with real-time feedback from our AI mentor.</p>
             </Card>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
           <Card className="bg-slate-900/40 p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Clock className="h-4 w-4 text-indigo-400" /> Recent Activity
              </h3>
              
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-6">
                     <div className="absolute left-[-1px] top-1.5 h-2.5 w-2.5 rounded-full border border-indigo-500 bg-slate-900" />
                     <p className="text-xs text-indigo-400 font-medium mb-1 uppercase tracking-wider">
                       {event.stage}
                     </p>
                     <p className="text-sm text-white leading-snug">{event.message}</p>
                     <p className="text-[10px] text-slate-600 mt-1">{new Date(event.created_at || "").toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
           </Card>

           <Card className="bg-indigo-600/5 border-indigo-500/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-indigo-400" /> Tips For You
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Based on your profile, we recommend sharpening your React knowledge with a focus on state management.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
