import { useEffect, useRef, useState } from "react";
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
  Upload
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
  const fileInputRef = useRef(null);
  
  const [analysis, setAnalysis] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [mockQuestions, setMockQuestions] = useState(null);
  const [isFetchingMock, setIsFetchingMock] = useState(false);

  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    readinessScore: 0
  });

  useEffect(() => {
    async function initDashboard() {
      try {
        const timelineRes = await apiRequest("/api/v1/timeline", { method: "GET" }).catch(() => ({ events: [] }));
        setTimelineEvents(timelineRes.events || []);

        // Load tasks or default
        const taskRes = await apiRequest("/api/v1/tasks/generate", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: demoResume })
        }).catch(() => ({ tasks: [] }));
        setTasks(taskRes.tasks || []);
        
        setAnalysis(demoResume);
      } catch (err) {
        console.error("Dashboard init error:", err);
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

  const handleToggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].status = newTasks[index].status === "Completed" ? "Pending" : "Completed";
    setTasks(newTasks);
    
    // Add event to timeline for visual feedback
    const newEvent = {
       stage: "act",
       message: `Task ${newTasks[index].status}: ${newTasks[index].title}`,
       created_at: new Date().toISOString()
    };
    setTimelineEvents([newEvent, ...timelineEvents]);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await apiRequest("/api/v1/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (res.analysis) {
        setAnalysis(res.analysis);
        // Refresh tasks based on new analysis
        const taskRes = await apiRequest("/api/v1/tasks/generate", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: res.analysis })
        });
        setTasks(taskRes.tasks || []);
        
        // Update timeline
        setTimelineEvents([{
          stage: "analyze",
          message: "New resume parsed and analyzed.",
          created_at: new Date().toISOString()
        }, ...timelineEvents]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartMock = async () => {
    setIsFetchingMock(true);
    setMockQuestions(null);
    try {
      const res = await apiRequest(`/api/v1/mock-interview?profile=${JSON.stringify(analysis)}`, {
        method: "GET"
      });
      setMockQuestions(res);
      setTimelineEvents([{
        stage: "decide",
        message: "Generated tailored mock interview questions.",
        created_at: new Date().toISOString()
      }, ...timelineEvents]);
    } catch (err) {
      console.error("Mock interview generation failed", err);
    } finally {
      setIsFetchingMock(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Welcome Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-black text-white tracking-tight">System.Ready({user?.name?.split(" ")[0]})</h2>
          <p className="text-slate-400 mt-2 font-medium">Monitoring your career trajectory in real-time.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="gap-2 border-white/5 bg-white/5 hover:bg-white/10">
             <BarChart3 className="h-4 w-4" /> Usage Stats
           </Button>
           <Button className="gap-2 shadow-lg shadow-indigo-600/20">
             <TrendingUp className="h-4 w-4" /> Optimize Profile
           </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2">
        {[
          { label: "Readiness Score", val: `${stats.readinessScore}%`, icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
          { label: "Tasks Completed", val: `${stats.tasksCompleted}/${stats.totalTasks}`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Target Role", val: analysis?.suggested_roles?.[0] || "Frontend dev", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`flex items-center gap-4 ${item.bg} ${item.border} backdrop-blur-xl`}>
              <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center border ${item.border}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                 <h3 className="text-2xl font-black text-white">{item.val}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] px-2">
        {/* Main Content Areas */}
        <div className="space-y-8">
          {/* Active Tasks */}
          <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-400" /> Improvement Roadmap
                </h3>
                <p className="text-xs text-slate-500 mt-1">AI-generated tasks based on your current skill gaps.</p>
              </div>
              <Button size="sm" variant="secondary" className="text-[10px] uppercase font-bold tracking-widest px-3 h-8">
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-4">
              {tasks.length > 0 ? tasks.map((task, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="group flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all cursor-pointer"
                  onClick={() => handleToggleTask(idx)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === "Completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-700"
                    }`}>
                      {task.status === "Completed" && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <span className={`font-bold block ${task.status === "Completed" ? "text-slate-500 line-through" : "text-white"}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">{task.priority} Priority</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                </motion.div>
              )) : (
                <div className="py-20 text-center opacity-50">No tasks generated. Upload a resume to start.</div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
             <Card 
               className="relative overflow-hidden flex flex-col items-center justify-center text-center p-12 hover:border-indigo-500/40 transition-all cursor-pointer group bg-gradient-to-br from-indigo-500/5 to-transparent"
               onClick={() => fileInputRef.current?.click()}
             >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  {isUploading ? <Loader size="md" /> : <Upload className="h-10 w-10 text-indigo-400" />}
                </div>
                <h4 className="text-xl font-black text-white italic">SCAN_RESUME</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium">Update your profile with AI analysis.</p>
             </Card>

             <Card 
                className="relative overflow-hidden flex flex-col items-center justify-center text-center p-12 hover:border-emerald-500/40 transition-all cursor-pointer group bg-gradient-to-br from-emerald-500/5 to-transparent"
                onClick={handleStartMock}
             >
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  {isFetchingMock ? <Loader size="md" /> : <MessageCircle className="h-10 w-10 text-emerald-400" />}
                </div>
                <h4 className="text-xl font-black text-white italic">START_MOCK</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium">Launch AI interview simulation.</p>
             </Card>
          </div>

          {/* Mock Interview Results Overlay/Modal replacement */}
          <AnimatePresence>
            {mockQuestions && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">Mock Interview Questions</h3>
                    <Button variant="secondary" size="sm" onClick={() => setMockQuestions(null)}>Close</Button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold uppercase mb-3 px-2">Technical Baseline</p>
                      <div className="space-y-2">
                        {mockQuestions.technical.map((q, i) => (
                           <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-sm text-slate-200">
                             {q}
                           </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-bold uppercase mb-3 px-2">HR & Behavioral</p>
                      <div className="space-y-2">
                        {mockQuestions.hr.map((q, i) => (
                           <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-sm text-slate-200">
                             {q}
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Activity & Tips */}
        <div className="space-y-8">
           <Card className="bg-slate-950/50 p-6 border-white/5 backdrop-blur-3xl min-h-[400px]">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-10 pb-4 border-b border-white/5">
                 <Clock className="h-4 w-4 text-indigo-400" /> Runtime Log
              </h3>
              
              <div className="space-y-10 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {timelineEvents.map((event, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative pl-10 group">
                     <div className="absolute left-[-3px] top-1.5 h-2.5 w-2.5 rounded-full border border-indigo-500 bg-slate-900 group-hover:scale-150 transition-transform" />
                     <p className="text-[10px] text-indigo-400 font-black mb-1 uppercase tracking-widest">
                       {event.stage}
                     </p>
                     <p className="text-sm text-slate-200 leading-snug font-medium">{event.message}</p>
                     <p className="text-[9px] text-slate-600 mt-2 font-mono uppercase">
                       {new Date(event.created_at || "").toLocaleTimeString()} // ID:{idx.toString(16).padStart(4, '0')}
                     </p>
                  </motion.div>
                ))}
                {timelineEvents.length === 0 && <div className="text-center py-20 text-slate-700 font-mono text-xs uppercase tracking-widest italic">Initializing...</div>}
              </div>
           </Card>

           <Card className="bg-indigo-600/5 border-indigo-500/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Growth Vector</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Analysis of high-performing {analysis?.suggested_roles?.[0]}s suggests increasing your focus on 
                <span className="text-indigo-400 font-bold"> cloud architecture </span> 
                and <span className="text-indigo-400 font-bold"> CI/CD workflows</span>.
              </p>
              <div className="mt-8 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 px-1">
                   <span>Skills Sync</span>
                   <span>82%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-indigo-500 rounded-full" />
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
