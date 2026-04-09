import { useState } from "react";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { MessageCircle, Play, CheckCircle2, AlertCircle, ArrowLeft, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MockInterview() {
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    try {
      // For the demo we use a generic profile or existing analysis if we had shared state
      const res = await apiRequest("/api/v1/mock-interview", { method: "GET" });
      setQuestions(res);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-4">
      <header className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-white">AI Mock Interview</h2>
           <p className="text-slate-400 mt-2">Practice with real-time feedback from our intelligent recruiters.</p>
        </div>
        <Button variant="secondary" onClick={() => window.close()} className="gap-2">
           <ArrowLeft className="h-4 w-4" /> Close Tab
        </Button>
      </header>

      {!questions ? (
        <Card className="p-20 flex flex-col items-center justify-center bg-slate-900 border-white/5">
           <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
              <BrainCircuit className="h-12 w-12 text-emerald-400" />
           </div>
           <h3 className="text-2xl font-bold text-white mb-3">Initialize Interview Session</h3>
           <p className="text-sm text-slate-500 mb-10 max-w-sm text-center">
             Our AI will generate 5 targeted questions based on standard industry expectations for your role.
           </p>
           
           <Button 
              size="lg"
              className="w-full max-w-xs h-14 text-lg bg-emerald-600 hover:bg-emerald-500"
              onClick={handleStart}
              disabled={isLoading}
           >
              {isLoading ? <Loader size="sm" /> : <>Generate Session <Play className="ml-2 h-4 w-4" /></>}
           </Button>
           
           {error && <p className="mt-6 text-sm text-rose-400">{error}</p>}
        </Card>
      ) : (
        <div className="space-y-8 pb-20">
           <div className="grid gap-8">
              <section className="space-y-4">
                 <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Technical Assessment
                 </h4>
                 <div className="grid gap-4">
                    {questions.technical.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                      >
                         <Card className="p-6 bg-slate-900/60 border-white/5 hover:border-indigo-500/30 transition-all">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase mb-2 block">Part {i+1}</span>
                            <p className="text-lg text-white font-medium leading-relaxed">{q}</p>
                         </Card>
                      </motion.div>
                    ))}
                 </div>
              </section>

              <section className="space-y-4">
                 <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Behavioral & HR
                 </h4>
                 <div className="grid gap-4">
                    {questions.hr.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i+3) * 0.1 }}
                        key={i}
                      >
                         <Card className="p-6 bg-slate-900/60 border-white/5 hover:border-emerald-500/30 transition-all">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase mb-2 block">Cultural Fit {i+1}</span>
                            <p className="text-lg text-white font-medium leading-relaxed">{q}</p>
                         </Card>
                      </motion.div>
                    ))}
                 </div>
              </section>
           </div>

           <div className="text-center pt-10">
              <p className="text-sm text-slate-500 mb-6 italic">Answer these questions aloud or type them for self-review. Detailed AI feedback coming soon.</p>
              <Button variant="secondary" onClick={() => setQuestions(null)}>Generate New Session</Button>
           </div>
        </div>
      )}
    </div>
  );
}
