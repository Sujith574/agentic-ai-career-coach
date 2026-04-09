import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";
import { Card, Button } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { 
  Users, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Search, 
  Filter,
  TrendingUp,
  Brain,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await apiRequest("/api/v1/admin/dashboard");
        setStats(statsRes);
        
        const studentsRes = await apiRequest("/api/v1/admin/students");
        setStudents(studentsRes);
        
        const gapsRes = await apiRequest("/api/v1/admin/analytics");
        setSkillGaps(gapsRes.top_skill_gaps || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Control_Center // {stats?.org_name?.toUpperCase()}</span>
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Platform_Analytics</h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="secondary" className="gap-2 bg-slate-900 border-white/5 uppercase text-[10px] font-black tracking-widest">Generate_Report</Button>
           <Button className="gap-2 shadow-indigo-500/20 shadow-lg uppercase text-[10px] font-black tracking-widest">Broadcast_Alert</Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", val: stats?.total_students, icon: Users, color: "text-blue-400" },
          { label: "Avg Readiness", val: `${stats?.avg_readiness_score}%`, icon: Target, color: "text-indigo-400" },
          { label: "At Risk Count", val: stats?.high_risk_count, icon: AlertTriangle, color: "text-rose-400" },
          { label: "Placement Goal", val: "95%", icon: TrendingUp, color: "text-emerald-400" }
        ].map((item, i) => (
          <Card key={i} className="bg-slate-900/50 border-white/5 backdrop-blur-3xl p-6 group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
               </div>
               <BarChart3 className="h-4 w-4 text-slate-700" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
            <h3 className="text-3xl font-black text-white mt-2">{item.val}</h3>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <Card className="bg-slate-900/40 border-white/5 p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Active_Student_Base</h3>
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-3 w-3 text-slate-500" />
                     <input className="pl-8 bg-slate-950/50 border border-white/5 rounded-lg text-xs py-2 px-4 focus:outline-none focus:border-indigo-500/50" placeholder="Filter IDs..." />
                  </div>
                  <Button variant="secondary" size="sm" className="bg-slate-950 border-white/5"><Filter className="h-3 w-3" /></Button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Student_Identity</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Readiness</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Primary_Focus</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-right">Operation</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {students.map(s => (
                        <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="py-4 px-4 font-bold text-white text-sm">
                              {s.name} <br/><span className="text-[10px] text-slate-500 font-medium lowercase tracking-normal">{s.email}</span>
                           </td>
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full ${s.probability > 70 ? 'bg-emerald-500' : s.probability > 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${s.probability}%` }} />
                                 </div>
                                 <span className="text-xs font-black text-white">{s.probability}%</span>
                              </div>
                           </td>
                           <td className="py-4 px-4">
                              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                 {s.skills[0] || "Neutral"}
                              </span>
                           </td>
                           <td className="py-4 px-4 text-right">
                              <Button variant="secondary" size="sm" className="bg-slate-950 border-white/5 hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">Inspect</Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-900 border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Brain className="h-40 w-40 text-indigo-500" />
              </div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Skill_Gaps_Aggregate</h3>
              <div className="space-y-6">
                 {skillGaps.map(([skill, count]) => (
                   <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-widest">
                         <span>{skill}</span>
                         <span className="text-indigo-400">{count} GAPS</span>
                      </div>
                      <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-indigo-500" style={{ width: `${(count / students.length) * 100}%` }} />
                      </div>
                   </div>
                 ))}
                 {skillGaps.length === 0 && <p className="text-xs text-slate-600 font-medium italic">No critical gaps detected.</p>}
              </div>
              <Button className="w-full mt-10 bg-white/5 border-white/5 uppercase text-[9px] font-black tracking-widest hover:bg-white/10">Design_Curriculum_Patch</Button>
           </Card>

           <Card className="bg-indigo-600 border-none relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10">
                 <h4 className="text-white font-black text-xl mb-3 tracking-tighter uppercase italic">Institutional_ROI</h4>
                 <p className="text-white/80 text-xs leading-relaxed font-medium mb-6">
                    Placement probability is trending <span className="text-white font-bold tracking-tight">+12% higher</span> this month across the student base.
                 </p>
                 <div className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp className="h-3 w-3" /> Growth Detected
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
