import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
            <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to your CareerOS account
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
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
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? <Loader size="sm" /> : <>Sign In <LogIn className="ml-2 h-4 w-4" /></>}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
          
          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
              DEMO: owner@agentic.local / demo-owner
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
