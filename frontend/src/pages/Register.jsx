import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { Mail, Lock, User, Building, UserPlus, AlertCircle, Key, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerStart, registerComplete } = useAuth();
  const navigate = useNavigate();

  const handleStartRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await registerStart(name, email);
      if (res.ok) {
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await registerComplete(name, email, password, otp, orgName);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Verification failed. Please check your OTP.");
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
            <h2 className="text-3xl font-extrabold text-white">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {step === 1 
                ? "Start your placement journey with CareerOS" 
                : `We've sent a code to ${email}`}
            </p>
          </div>
          
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
          </AnimatePresence>

          {step === 1 ? (
            <form className="mt-8 space-y-4" onSubmit={handleStartRegistration}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    className="pl-10"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">University / Organization</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    className="pl-10"
                    placeholder="LPU University"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    className="pl-10"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : "Continue to Verify"}
                </Button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={handleCompleteRegistration}>
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
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Create Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      className="pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : <>Complete Registration <UserPlus className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest mt-2"
              >
                Change registration details
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
