import { useState, useRef, useEffect } from "react";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  BarChart, 
  Zap,
  ShieldCheck,
  Search,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, scanning, done
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (status === "scanning") {
       setScanProgress(0);
       interval = setInterval(() => {
         setScanProgress(prev => {
           if (prev >= 100) {
             clearInterval(interval);
             return 100;
           }
           return prev + 2;
         });
       }, 50);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await apiRequest("/api/v1/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (res.analysis) {
        setStatus("scanning");
        // Simulate deep AI scan legacy effect
        setTimeout(() => {
          setAnalysis(res.analysis);
          setStatus("done");
        }, 3000);
      } else {
        setError("AI analysis failed to interpret document. Please try a standard professional format.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Network protocols interrupted. Check backend connectivity.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-white/5 pb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 mb-3">
               <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                 <Cpu className="h-4 w-4 text-indigo-400" />
               </div>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Core.Neural_Scanner v4.2</span>
             </div>
             <h2 className="text-4xl font-black text-white italic tracking-tight">RESUME_ANALYZER</h2>
          </motion.div>
          
          <Button variant="secondary" onClick={() => window.close()} className="gap-2 bg-slate-900 border-white/5 hover:bg-slate-800">
             <ArrowLeft className="h-4 w-4" /> TERMINATE_SESSION
          </Button>
        </header>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Card className="p-16 flex flex-col items-center justify-center border-dashed border-2 border-slate-800 bg-slate-900/10 backdrop-blur-3xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="h-28 w-28 rounded-full bg-indigo-500/10 flex items-center justify-center mb-10 border border-indigo-500/20 relative z-10"
                 >
                    <Upload className="h-12 w-12 text-indigo-400" />
                 </motion.div>
                 
                 <h3 className="text-2xl font-black text-white mb-4 z-10">INITIALIZE_UPLOAD</h3>
                 <p className="text-sm text-slate-500 mb-10 max-w-sm text-center leading-relaxed font-medium z-10">
                   Feed the neural network your professional data. We accept <span className="text-slate-300 font-bold">.PDF</span>, <span className="text-slate-300 font-bold">.DOCX</span>, and <span className="text-slate-300 font-bold">.RTF</span> formats.
                 </p>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   onChange={handleFileChange}
                   accept=".pdf,.doc,.docx"
                 />
                 
                 <div className="flex flex-col items-center gap-6 w-full max-w-sm z-10">
                   <div 
                      className="w-full p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between cursor-pointer hover:border-indigo-500/30 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                   >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <span className="text-sm font-bold text-slate-400 truncate max-w-[200px]">
                          {file ? file.name : "Select_Carrier_Medium"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Browse</span>
                   </div>
                   
                   <Button 
                      className="w-full h-14 text-sm font-black tracking-widest uppercase shadow-[0_0_30px_rgba(99,102,241,0.2)] bg-indigo-600 hover:bg-indigo-500"
                      onClick={handleUpload}
                      disabled={!file}
                   >
                      ACTIVATE_SCANNER
                   </Button>
                 </div>
                 
                 {error && (
                   <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold z-10">
                     <AlertCircle className="h-4 w-4" /> {error}
                   </div>
                 )}
              </Card>
            </motion.div>
          )}

          {(status === "uploading" || status === "scanning") && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center"
            >
               <div className="relative h-40 w-40 mb-12">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20" 
                  />
                  <div className="absolute inset-4 rounded-full border-2 border-indigo-500 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                     <motion.div 
                       animate={{ y: ["-100%", "100%", "-100%"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent h-20 w-full"
                     />
                     <Search className="h-10 w-10 text-white relative z-10" />
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-white italic tracking-widest mb-4">
                  {status === "uploading" ? "UPLOADING_DATA..." : "NEURAL_PROCESSING..."}
               </h3>
               
               <div className="w-full max-w-md h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                  />
               </div>
               <p className="mt-4 font-mono text-[10px] text-slate-500 uppercase tracking-[0.4em]">Heuristics.Matching / {scanProgress}%</p>
            </motion.div>
          )}

          {status === "done" && analysis && (
            <motion.div 
              key="done"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
               <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                  <Card className="bg-slate-900 border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Zap className="h-32 w-32 text-indigo-500" />
                     </div>
                     
                     <div className="flex items-center gap-6 mb-12">
                        <div className="h-20 w-20 rounded-2xl bg-indigo-500 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/30">
                           <span className="text-[10px] font-black text-white/50 uppercase">Score</span>
                           <span className="text-3xl font-black text-white">{analysis.placement_probability}</span>
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-white uppercase tracking-tight">ANALYSIS_COMPLETE</h3>
                           <div className="flex items-center gap-2 mt-2">
                             <ShieldCheck className="h-4 w-4 text-emerald-400" />
                             <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Industry Standard Verified</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid gap-10 md:grid-cols-2">
                        <section>
                           <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                              <div className="h-1 w-4 bg-indigo-500 rounded-full" /> CORE_STRENGTHS
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {analysis.skills.map(skill => (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  key={skill} 
                                  className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 uppercase"
                                >
                                  {skill}
                                </motion.span>
                              ))}
                           </div>
                        </section>

                        <section>
                           <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                              <div className="h-1 w-4 bg-rose-500 rounded-full" /> CRITICAL_GAPS
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {analysis.missing_skills.map(skill => (
                                <motion.span 
                                  whileHover={{ scale: 1.05 }}
                                  key={skill} 
                                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-black text-rose-400 uppercase"
                                >
                                  {skill}
                                </motion.span>
                              ))}
                           </div>
                        </section>
                     </div>

                     <div className="mt-12 pt-10 border-t border-white/5">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">OPTIMAL_PATHWAYS</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                           {analysis.suggested_roles.map((role, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                 <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                    <BarChart className="h-4 w-4 text-slate-400" />
                                 </div>
                                 <span className="text-sm font-bold text-white uppercase tracking-tight">{role}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>

                  <div className="space-y-8">
                     <Card className="bg-indigo-600 border-none relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10">
                           <h4 className="text-white font-black text-xl mb-4 italic uppercase">Executive_Summary</h4>
                           <p className="text-white/80 text-sm leading-relaxed font-medium">
                              Your profile resonates at a <span className="text-white font-bold">{analysis.experience_level}</span> frequency. 
                              The neural network suggests immediate focus on building projects involving <span className="bg-white/10 px-1 rounded">{analysis.missing_skills[0]}</span> 
                              to achieve peak market readiness.
                           </p>
                        </div>
                     </Card>

                     <Card className="bg-slate-900 border-white/5">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">NEXT_OPERATIONS</h4>
                        <ul className="space-y-4">
                           <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                              <span className="text-xs text-slate-400">Initialize <span className="text-white">AI Mock Interview</span> session for {analysis.suggested_roles[0]}.</span>
                           </li>
                           <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                              <span className="text-xs text-slate-400">Activate <span className="text-white">Skill Sync</span> to track goal completion.</span>
                           </li>
                        </ul>
                        <Button 
                          className="w-full mt-8 bg-white/5 hover:bg-white/10 border-white/5 text-[10px] font-black uppercase tracking-[0.2em]"
                          onClick={() => setStatus("idle")}
                        >
                          DOWNLOAD_DATA_PACK // JSON
                        </Button>
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
