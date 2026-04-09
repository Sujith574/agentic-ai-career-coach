import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { Mail, Key, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    
    try {
      const res = await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage(res.message);
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await apiRequest("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to reset password. Please check your OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-8 bg-slate-900 border-white/5">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-slate-400">
              Recover access to your CareerOS account
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      required
                      className="pl-10"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? <Loader size="sm" /> : "Send Reset OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Verification Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        required
                        className="pl-10 tracking-[0.5em] font-bold"
                        placeholder="••••••"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">New Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        required
                        className="pl-10"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? <Loader size="sm" /> : "Confirm New Password"}
                </Button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                >
                  Back to email entry
                </button>
              </form>
            )}
            
            <div className="text-center pt-4 border-t border-white/5">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
