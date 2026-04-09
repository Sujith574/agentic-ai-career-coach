import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { Mail, ShieldCheck, ArrowRight, AlertCircle, Sparkles, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const res = await sendOtp(email);
    if (res.success) {
      setStep(2);
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const res = await verifyOtp(email, otp);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Card className="p-8 bg-slate-900 border-white/5 shadow-2xl backdrop-blur-3xl">
          <div className="text-center mb-10">
            <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-indigo-500/20">
               <Fingerprint className="h-7 w-7 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">NEURAL_LINK</h1>
            <p className="mt-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Identity Verification Protocol</p>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-[11px] font-bold text-rose-400 border border-rose-500/20 uppercase tracking-tight"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>
            <div className="space-y-4">
              {step === 1 ? (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Institutional Email</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-500" />
                    <Input 
                      type="email" 
                      required 
                      className="pl-12 h-14 bg-slate-950/50 border-white/5 focus:border-indigo-500/50" 
                      placeholder="student@university.edu" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Access Code</label>
                      <button type="button" onClick={() => setStep(1)} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Change Email</button>
                   </div>
                  <div className="relative mt-2">
                    <Sparkles className="absolute left-4 top-4 h-4 w-4 text-indigo-500" />
                    <Input 
                      type="text" 
                      required 
                      maxLength={6}
                      className="pl-12 h-14 bg-slate-950/50 border-white/5 focus:border-indigo-500/50 tracking-[1em] text-lg font-black" 
                      placeholder="••••••" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    />
                  </div>
                  <p className="mt-4 text-[9px] text-slate-500 font-medium text-center">A transmission was sent to <span className="text-white font-bold">{email}</span></p>
                </motion.div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/10" disabled={isLoading}>
              {isLoading ? <Loader size="sm" /> : (
                <>
                  {step === 1 ? 'Generate Transmission' : 'Verify Neural Sync'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <footer className="mt-10 text-center border-t border-white/5 pt-8">
            <div className="inline-flex items-center gap-2 text-slate-600">
               <ShieldCheck className="h-3 w-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
          </footer>
        </Card>
      </motion.div>
    </div>
  );
}
