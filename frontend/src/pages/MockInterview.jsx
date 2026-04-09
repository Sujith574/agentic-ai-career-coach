import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { 
  MessageCircle, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  BrainCircuit,
  Mic,
  Video,
  Monitor,
  Activity,
  Terminal,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MockInterview() {
  const [session, setSession] = useState("idle"); // idle, preparing, live
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (session === "preparing") {
       setLoadingProgress(0);
       interval = setInterval(() => {
         setLoadingProgress(prev => {
           if (prev >= 100) {
             clearInterval(interval);
             return 100;
           }
           return prev + 1;
         });
       }, 30);
    }
    return () => clearInterval(interval);
  }, [session]);

  const handleStart = async () => {
    setSession("preparing");
    setError("");
    try {
      const res = await apiRequest("/api/v1/mock-interview", { method: "GET" });
      setTimeout(() => {
        setQuestions(res);
        setSession("live");
      }, 3500);
    } catch (err) {
      setError("Unable to allocate AI compute resources. Backend connection dropped.");
      setSession("idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-white/5 pb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 mb-3">
               <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                 <BrainCircuit className="h-4 w-4 text-emerald-400" />
               </div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Simulator.Environment_Alpha</span>
             </div>
             <h2 className="text-4xl font-black text-white italic tracking-tight uppercase">Mock_Simulation</h2>
          </motion.div>
          
          <Button variant="secondary" onClick={() => window.close()} className="gap-2 bg-slate-900 border-white/5 hover:bg-slate-800">
             <ArrowLeft className="h-4 w-4" /> CLOSE_TERMINAL
          </Button>
        </header>

        <AnimatePresence mode="wait">
          {session === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
               <div className="space-y-8">
                  <h3 className="text-5xl font-black text-white leading-tight">MASTER THE <br/><span className="text-emerald-500 italic">CONVERSATION.</span></h3>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                    Our neural recruiters simulate real-world high-pressure interviews tailored to your unique carrier profile. 
                  </p>
                  
                  <div className="grid gap-6">
                     {[
                       { icon: Mic, label: "Voice Recognition Support", desc: "Native frequency analysis" },
                       { icon: Video, label: "Behavioral Monitoring", desc: "Posture & sentiment tracking" },
                       { icon: Monitor, label: "Live Code Execution", desc: "Integrated sandbox environment" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                             <item.icon className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-white uppercase">{item.label}</h4>
                             <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-6">
                     <Button 
                       size="lg" 
                       className="h-16 px-10 text-lg font-black uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                       onClick={handleStart}
                     >
                       START_SIMULATION
                     </Button>
                     {error && <p className="mt-4 text-xs font-bold text-rose-500 font-mono tracking-widest">{error}</p>}
                  </div>
               </div>

               <div className="hidden lg:block relative">
                 <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-[100px] opacity-20" />
                 <Card className="bg-slate-900 border-white/10 p-4 border-2 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                       <div className="h-3 w-3 rounded-full bg-rose-500" />
                       <div className="h-3 w-3 rounded-full bg-amber-500" />
                       <div className="h-3 w-3 rounded-full bg-emerald-500" />
                       <span className="ml-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Recruiter_Bot // ACTIVE</span>
                    </div>
                    <div className="space-y-6 py-8">
                       <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                             <Activity className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 max-w-[80%] leading-relaxed">
                             "Tell me about a time you handled a significant technical failure in production. What was your strategy?"
                          </div>
                       </div>
                       <div className="flex gap-3 justify-end">
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-100 max-w-[80%] leading-relaxed">
                             "I prioritized containment first. I identified the faulty microservice and used a fallback cache..."
                          </div>
                          <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                             <CheckCircle2 className="h-4 w-4 text-slate-500" />
                          </div>
                       </div>
                    </div>
                 </Card>
               </div>
            </motion.div>
          )}

          {session === "preparing" && (
            <motion.div 
               key="preparing" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="py-40 flex flex-col items-center justify-center"
            >
               <div className="relative mb-12">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl"
                  />
                  <div className="h-32 w-32 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center relative overflow-hidden">
                     <motion.div 
                       animate={{ rotate: [0, 90, 180, 270, 360] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 border-4 border-dashed border-emerald-500/40"
                     />
                     <Terminal className="h-10 w-10 text-white" />
                  </div>
               </div>
               
               <h3 className="text-2xl font-black text-white italic tracking-[0.2em] mb-4">ALLOCATING_VIRTUAL_SPACE...</h3>
               
               <div className="w-full max-w-md space-y-3">
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                       initial={{ width: 0 }}
                       animate={{ width: `${loadingProgress}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                     <span>Boutique.Heuristics</span>
                     <span>{loadingProgress}% COMPLETE</span>
                  </div>
               </div>
            </motion.div>
          )}

          {session === "live" && questions && (
            <motion.div 
               key="live" 
               initial={{ opacity: 0, y: 30 }} 
               animate={{ opacity: 1, y: 0 }}
               className="space-y-12 pb-32"
            >
               <div className="grid gap-12 lg:grid-cols-2">
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <div className="h-1 w-6 bg-indigo-500" /> Technical_Protocol
                     </h4>
                     <div className="grid gap-4">
                        {questions.technical.map((q, i) => (
                           <motion.div 
                             key={i} 
                             whileHover={{ x: 10 }}
                             className="flex items-center gap-6 p-6 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
                           >
                              <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                 {i + 1}
                              </div>
                              <p className="flex-1 text-sm font-bold text-white leading-relaxed">{q}</p>
                              <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-indigo-400" />
                           </motion.div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <div className="h-1 w-6 bg-emerald-500" /> Behavioral_Heuristics
                     </h4>
                     <div className="grid gap-4">
                        {questions.hr.map((q, i) => (
                           <motion.div 
                             key={i} 
                             whileHover={{ x: 10 }}
                             className="flex items-center gap-6 p-6 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
                           >
                              <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                 {i + 1}
                              </div>
                              <p className="flex-1 text-sm font-bold text-white leading-relaxed">{q}</p>
                              <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-emerald-400" />
                           </motion.div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-50">
                  <div className="max-w-4xl mx-auto flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-xl">
                     <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                           <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Live // 00:00:00</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                           <Mic className="h-3 w-3" /> INPUT_ACTIVE // PEAK: -12DB
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Button variant="secondary" className="bg-slate-950 border-white/5 uppercase text-[10px] font-black tracking-widest" onClick={() => setSession("idle")}>Abort_Simulation</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 uppercase text-[10px] font-black tracking-widest shadow-lg shadow-emerald-500/20">Submit_Logs</Button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
