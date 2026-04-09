import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { Mail, Lock, User, Building, UserPlus, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await register(name, email, password, orgSlug, role);
      if (res.success) {
        navigate("/login");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="p-8 bg-slate-900 border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white italic tracking-tight">AI.CareerOS</h1>
            <p className="mt-2 text-slate-500 font-medium uppercase tracking-widest text-xs">Initialize System Access</p>
          </div>
          
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input required className="pl-10" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">University Slug</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input required className="pl-10" placeholder="lpu" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input type="email" required className="pl-10" placeholder="student@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input type="password" required className="pl-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Role Selection</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setRole("student")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${role === 'student' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/5'}`}
                >
                  Student
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole("admin")}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${role === 'admin' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/5'}`}
                >
                  Admin
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-sm font-black uppercase tracking-widest" disabled={isLoading}>
              {isLoading ? <Loader size="sm" /> : <>Create Account <UserPlus className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
              Already a user? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Authorize Session</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
