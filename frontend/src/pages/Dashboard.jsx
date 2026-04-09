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
  ExternalLink,
  Zap,
  PlayCircle,
  Activity,
  Cpu,
  RefreshCcw,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple utility for tailwind classes
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Initializing CareerOS... Neural link established. Agentic loop in operation." }
  ]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const profileRes = await apiRequest("/api/v1/student/profile").catch(() => null);
        setProfile(profileRes);

        const taskRes = await apiRequest("/api/v1/student/tasks").catch(() => []);
        setTasks(taskRes || []);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleTaskComplete = async (taskId) => {
    setIsSyncing(true);
    try {
      await apiRequest(`/api/v1/student/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Completed" })
      });
      // Refresh tasks
      const taskRes = await apiRequest("/api/v1/student/tasks");
      setTasks(taskRes || []);
      
      // AI simulated reaction
      setChatHistory(prev => [...prev, { 
        role: "ai", 
        text: "Task completion detected. Adjusting career trajectory... Agent cycle updated." 
      }]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setIsSending(true);

    try {
      const res = await apiRequest("/api/v1/student/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg })
      });
      setChatHistory(prev => [...prev, { role: "ai", text: res.text }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Neural latency detected. Re-establishing link..." }]);
    } finally {
      setIsSending(false);
    }
  };

  const openInNewTab = (path) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  const analysis = profile?.resume_data || { 
    placement_probability: 20, 
    skills: [], 
    missing_skills: ["Data Structures", "Web Dev"], 
    suggested_roles: ["Incomplete Profiling"] 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-40 px-6">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Autonomous_Agent // Online</span>
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Student_Interface // {user?.name?.toUpperCase()}</span>
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Command_Center</h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="secondary" className="gap-2 bg-slate-900 border-white/5 uppercase text-[10px] font-black tracking-widest shadow-xl" onClick={() => openInNewTab("/resume-analysis")}>
             <FileText className="h-4 w-4" /> Analyze_Resume
           </Button>
           <Button className="gap-2 shadow-indigo-600/20 shadow-lg uppercase text-[10px] font-black tracking-widest" onClick={() => openInNewTab("/mock-interview")}>
             <Zap className="h-4 w-4 fill-current" /> Simulator
           </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Placement readiness", val: `${profile?.placement_probability || analysis.placement_probability}%`, icon: Target, color: "text-indigo-400" },
          { label: "Sync Tasks", val: `${tasks.filter(t=>t.status==='Completed').length}/${tasks.length}`, icon: RefreshCcw, color: "text-emerald-400" },
          { label: "AI Prediction", val: analysis.placement_probability > 70 ? "High" : "Low", icon: Cpu, color: "text-blue-400" },
          { label: "System Health", val: "Operational", icon: Shield, color: "text-slate-400" }
        ].map((item, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-3xl p-6 hover:border-white/20 transition-all">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                   <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                  <h3 className="text-2xl font-black text-white uppercase mt-0.5 tracking-tighter">{item.val}</h3>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          {/* Main Agent Operations */}
          <Card className="bg-slate-950/40 border-white/5 p-8 relative">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                 <div className="h-1 w-8 bg-indigo-500 rounded-full" /> Agent_Action_Queue
               </h3>
               {isSyncing && <Loader size="sm" />}
            </div>
            
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task, idx) => (
                <motion.div 
                   key={task.id || idx}
                   className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                       onClick={() => task.status !== "Completed" && handleTaskComplete(task.id)}
                       className={cn(
                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer",
                        task.status === "Completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-700 hover:border-indigo-500"
                      )}
                    >
                       {task.status === "Completed" && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className={cn("text-sm font-bold", task.status === "Completed" ? "text-slate-600 line-through" : "text-white")}>
                       {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className={cn("text-[9px] font-black uppercase tracking-widest", task.priority === 'High' ? 'text-rose-500' : 'text-slate-600')}>
                        Priority::{task.priority}
                     </span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                   <Activity className="h-8 w-8 text-slate-800 mx-auto mb-4" />
                   <p className="text-xs text-slate-600 font-bold uppercase tracking-widest italic">Perception Layer: Waiting for Identity Data (Resume)</p>
                   <Button variant="secondary" className="mt-6 uppercase text-[9px] font-black tracking-widest" onClick={() => openInNewTab("/resume-analysis")}>Upload_Now</Button>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Action Hub */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900/50 p-10 rounded-[2.5rem] border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group" onClick={() => openInNewTab("/resume-analysis")}>
               <div className="h-20 w-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-indigo-500 transition-all">
                  <FileText className="h-10 w-10 text-indigo-400 group-hover:text-white" />
               </div>
               <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity_Sync</h4>
               <p className="text-xs text-slate-500 mt-2 leading-relaxed">Refresh your neural profile with a new resume snapshot.</p>
            </Card>

            <Card className="bg-slate-900/50 p-10 rounded-[2.5rem] border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer group" onClick={() => openInNewTab("/mock-interview")}>
               <div className="h-20 w-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-emerald-500 transition-all">
                  <Zap className="h-10 w-10 text-emerald-400 group-hover:text-white" />
               </div>
               <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Stress_Tests</h4>
               <p className="text-xs text-slate-500 mt-2 leading-relaxed">Execute simulated interviews to refine your neural responses.</p>
            </Card>
          </div>
        </div>

        {/* Side bar - Agent Memory & History */}
        <div className="space-y-8">
           <Card className="bg-slate-900/60 p-8 border-white/5 h-[650px] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                 <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Agent_Comms</h3>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest">Active</span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                 {chatHistory.map((msg, i) => (
                    <motion.div 
                       key={i} 
                       className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={cn(
                          "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                          msg.role === 'user' 
                            ? "bg-indigo-600 text-white font-medium shadow-lg" 
                            : "bg-slate-950 border border-white/5 text-slate-300 font-medium"
                       )}>
                          {msg.text}
                       </div>
                    </motion.div>
                 ))}
                 {isSending && <div className="text-[10px] text-slate-600 font-black animate-pulse uppercase tracking-[0.3em] pl-2">Agent_Heuristics::Thinking...</div>}
              </div>

              <form onSubmit={handleSendMessage} className="mt-8 transition-all">
                 <div className="relative">
                    <input 
                       disabled={isSending}
                       className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700 h-14"
                       placeholder="Inquire Career Optimization Metrics..." 
                       value={chatMessage}
                       onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <button 
                       type="submit" 
                       disabled={isSending || !chatMessage.trim()}
                       className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-all text-white shadow-lg"
                    >
                       <ChevronRight className="h-5 w-5" />
                    </button>
                 </div>
              </form>
           </Card>

           <Card className="bg-slate-950 border-white/5 p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Cpu className="h-32 w-32 text-indigo-500" />
              </div>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 relative z-10">Neural_History_Metrics</h3>
              <div className="space-y-6 relative z-10">
                 {[
                   { label: "Identity_Sync_Complete", time: "02h ago", status: "ok" },
                   { label: "Decision_Layer_Execution", time: "05h ago", status: "ok" },
                   { label: "Operation_Risk_Detected", time: "1d ago", status: "warn" }
                 ].map((log, i) => (
                    <div key={i} className="flex justify-between items-center group/log cursor-default">
                       <div className="flex items-center gap-3">
                          <div className={cn("h-1.5 w-1.5 rounded-full", log.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-500 shadow-[0_0_5px_#f59e0b]')} />
                          <span className="text-[10px] font-black text-slate-500 group-hover/log:text-white transition-colors">{log.label}</span>
                       </div>
                       <span className="text-[10px] text-slate-700 font-mono italic">{log.time}</span>
                    </div>
                 ))}
                 <p className="pt-4 text-[9px] text-slate-700 font-medium italic border-t border-white/5">
                   * Adaptive planning protocol running continuously in background layer.
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
