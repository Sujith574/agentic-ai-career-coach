import { Link } from "react-router-dom";
import { Button } from "../components/ui/Base";
import { 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  TrendingUp,
  FileSearch,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500/30 rounded-full blur-[128px]" />
        <div className="absolute top-20 -right-4 w-72 h-72 bg-emerald-500/20 rounded-full blur-[128px]" />
        
        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              Agentic Career Coaching v2.0
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            The Operating System for <br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              University Placements
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Empower your students with AI-driven career guidance, automated resume analysis, 
            and immersive mock interviews. All managed in one powerful SaaS platform.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="h-12 px-8 text-base text-slate-100">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            icon: Cpu,
            title: "Agentic AI Core",
            description: "Autonomous agents that analyze student profiles and suggest personalized growth paths."
          },
          {
            icon: ShieldCheck,
            title: "Enterprise Ready",
            description: "Role-based access, SSO integration, and detailed audit logs for universities."
          },
          {
            icon: FileSearch,
            title: "Smart Insights",
            description: "Comprehensive parsing and scoring of resumes based on real-world hiring standards."
          }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="group relative p-8 rounded-3xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="border-y border-white/5 py-12">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
           <div className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-emerald-400" />
             <span className="text-sm font-medium text-white uppercase tracking-widest">98% Success Rate</span>
           </div>
           <div className="flex items-center gap-2">
             <CheckCircle2 className="h-5 w-5 text-indigo-400" />
             <span className="text-sm font-medium text-white uppercase tracking-widest">10k+ Students Placed</span>
           </div>
           <div className="flex items-center gap-2">
             <Users className="h-5 w-5 text-blue-400" />
             <span className="text-sm font-medium text-white uppercase tracking-widest">50+ Partner Unis</span>
           </div>
        </div>
      </section>
    </div>
  );
}
