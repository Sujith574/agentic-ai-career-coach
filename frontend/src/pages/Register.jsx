import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { Mail, Lock, User, Building, UserPlus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await register(name, email, password, orgName);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to create account. Please check your connection.");
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
            <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start your placement journey with CareerOS
            </p>
          </div>
          
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? <Loader size="sm" /> : <>Get Started <UserPlus className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
