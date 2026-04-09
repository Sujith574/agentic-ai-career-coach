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
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Initializing CareerOS... Neural link established. How can I accelerate your placement today?" }
  ]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

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
      setChatHistory(prev => [...prev, { role: "ai", text: "Connection latency detected. Retrying neural sync..." }]);
    } finally {
      setIsSending(false);
    }
  };

  const openInNewTab = (path) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  const analysis = profile?.resume_data || { 
    placement_probability: 0, 
    skills: [], 
    missing_skills: [], 
    suggested_roles: ["Incomplete Profiling"] 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-40 px-6">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Student_Node // {user?.name?.toUpperCase()}</span>
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tight uppercase underline decoration-indigo-500 decoration-4 underline-offset-8">Career_Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="secondary" className="gap-2 bg-slate-900 border-white/5 uppercase text-[10px] font-black tracking-widest shadow-xl" onClick={() => openInNewTab("/resume-analysis")}>
             <ExternalLink className="h-4 w-4" /> Full_Analysis
           </Button>
           <Button className="gap-2 shadow-indigo-600/20 shadow-lg uppercase text-[10px] font-black tracking-widest" onClick={() => openInNewTab("/mock-interview")}>
             <Zap className="h-4 w-4 fill-current" /> Mock_Simulator
           </Button>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Placement Readiness", val: `${analysis.placement_probability}%`, icon: Target, color: "text-indigo-400" },
          { label: "Operational Tasks", val: `${tasks.filter(t=>t.status==='Completed').length}/${tasks.length}`, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Active Pathway", val: analysis.suggested_roles[0], icon: TrendingUp, color: "text-blue-400" }
        ].map((item, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                 <h3 className="text-3xl font-black text-white uppercase mt-1 tracking-tighter">{item.val}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Card className="bg-slate-950/40 border-white/5 p-8 relative">
            <h3 className="text-lg font-black text-white uppercase italic tracking-widest mb-8 flex items-center gap-4">
              <div className="h-1 w-8 bg-indigo-500 rounded-full" /> Agentic_Operations
            </h3>
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task, idx) => (
                <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={idx} 
                   className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${task.status === "Completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"}`} />
                    <span className={`text-sm font-bold ${task.status === "Completed" ? "text-slate-600 line-through" : "text-white"}`}>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-10">
                     <span className={`text-[9px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-rose-500' : 'text-slate-600'}`}>Priority::{task.priority}</span>
                     <ChevronRight className="h-4 w-4 text-slate-800" />
                  </div>
                </motion.div>
              )) : (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                   <p className="text-xs text-slate-600 font-bold uppercase tracking-widest italic">Upload resume to initialize operations</p>
                </div>
              )}
            </div>
            {tasks.length > 0 && (
              <Button variant="secondary" className="w-full mt-10 bg-white/5 border-white/5 uppercase text-[9px] font-black tracking-[0.3em] overflow-hidden group">
                 <span className="relative z-10">Expand_Task_Registry</span>
                 <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform" />
              </Button>
            )}
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <div 
              onClick={() => openInNewTab("/resume-analysis")}
              className="cursor-pointer group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/50 p-10 hover:border-indigo-500/50 transition-all shadow-2xl"
            >
              <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-indigo-500 group-hover:scale-110 transition-all">
                <FileText className="h-10 w-10 text-indigo-400 group-hover:text-white" />
              </div>
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">ANALYZE_PROFILE</h4>
              <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">Feed the neural core your history to optimize probability.</p>
              <ExternalLink className="absolute top-10 right-10 h-4 w-4 text-slate-700 group-hover:text-indigo-400" />
            </div>

            <div 
              onClick={() => openInNewTab("/mock-interview")}
              className="cursor-pointer group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/50 p-10 hover:border-emerald-500/50 transition-all shadow-2xl"
            >
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
                <PlayCircle className="h-10 w-10 text-emerald-400 group-hover:text-white" />
              </div>
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">INIT_SIMULATOR</h4>
              <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">Engage with industry calibrated recruiter bots.</p>
              <ExternalLink className="absolute top-10 right-10 h-4 w-4 text-slate-700 group-hover:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-900/60 p-8 border-white/5 h-[650px] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">AI_Mentor_Session</h3>
                 </div>
                 <span className="text-[9px] font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Connected</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 relative z-10 custom-scrollbar">
                 {chatHistory.map((msg, i) => (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
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
                 {isSending && <div className="text-[10px] text-slate-600 font-black animate-pulse uppercase tracking-[0.3em]">AI_Core::Thinking...</div>}
              </div>

              <form onSubmit={handleSendMessage} className="mt-8 relative z-10">
                 <div className="relative">
                    <input 
                       disabled={isSending}
                       className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                       placeholder="Inquire Career Optimization Metrics..." 
                       value={chatMessage}
                       onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <button 
                       type="submit" 
                       disabled={isSending || !chatMessage.trim()}
                       className="absolute right-3 top-3 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg"
                    >
                       <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                 </div>
              </form>
           </Card>

           <Card className="bg-slate-950 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Clock className="h-32 w-32 text-indigo-500" />
              </div>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 relative z-10">Neural_History</h3>
              <div className="space-y-8 relative z-10">
                 {[
                   { label: "Profile_Sync_Complete", time: "02h ago", status: "ok" },
                   { label: "Task_Registry_Updated", time: "05h ago", status: "ok" },
                   { label: "Simulator_Accessed", time: "1d ago", status: "warn" }
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-center group/log">
                      <div className="flex items-center gap-3">
                         <div className={`h-1.5 w-1.5 rounded-full ${log.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                         <span className="text-[11px] font-bold text-slate-400 group-hover/log:text-white transition-colors">{log.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-700 font-mono italic">{log.time}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
