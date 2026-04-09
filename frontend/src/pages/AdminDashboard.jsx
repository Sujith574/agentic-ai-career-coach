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
  ChevronRight,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiRequest("/api/v1/admin/analytics");
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader size="lg" /></div>;

  const statusColors = {
    "Active": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "At Risk": "text-rose-400 bg-rose-500/10 border-rose-500/20",
    "Improving": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Agentic_Monitor // {data?.institution_name?.toUpperCase()}</span>
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Control_Center</h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="secondary" className="gap-2 bg-slate-900 border-white/5 uppercase text-[10px] font-black tracking-widest">Generate_Report</Button>
           <Button className="gap-2 shadow-indigo-500/20 shadow-lg uppercase text-[10px] font-black tracking-widest">Broadcast_Alert</Button>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", val: data?.total_students, icon: Users, color: "text-blue-400" },
          { label: "Active Nodes", val: data?.status_groups["Active"], icon: Activity, color: "text-emerald-400" },
          { label: "Current At Risk", val: data?.status_groups["At Risk"], icon: AlertTriangle, color: "text-rose-400" },
          { label: "Improving State", val: data?.status_groups["Improving"], icon: TrendingUp, color: "text-indigo-400" }
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
          {/* AI Insights Card */}
          <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20 p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <Brain className="h-40 w-40 text-indigo-400" />
             </div>
             <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <Zap className="h-3 w-3 fill-indigo-400" /> AGENTIC_INSIGHTS_AUTO_GENERATED
             </h3>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.insights.map((insight, idx) => (
                   <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                      <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic">"{insight}"</p>
                   </div>
                ))}
             </div>
          </Card>

          {/* Risk Profile Table */}
          <Card className="bg-slate-900/40 border-white/5 p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Critical_Risk_Profiles</h3>
               <Search className="h-4 w-4 text-slate-500" />
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Entity_Identity</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Sync_Status</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 text-right">Probability</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {data?.risk_profiles.map((s, idx) => (
                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="py-4 px-4 font-bold text-white text-sm">
                              {s.name} <br/><span className="text-[10px] text-slate-500 font-medium lowercase tracking-normal">{s.email}</span>
                           </td>
                           <td className="py-4 px-4">
                              <span className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase tracking-tighter">
                                 AT_RISK
                              </span>
                           </td>
                           <td className="py-4 px-4 text-right font-black text-rose-500">
                              {s.prob}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </Card>
        </div>

        {/* Side Panel status distribution */}
        <div className="space-y-8">
           <Card className="bg-slate-900 border-white/5 p-6 space-y-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Agent_Status_Distribution</h3>
              <div className="space-y-6">
                 {Object.entries(data?.status_groups).map(([label, count]) => (
                    <div key={label} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white">{count} NODES</span>
                       </div>
                       <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / data.total_students) * 100}%` }}
                            className={`h-full ${label === 'Active' ? 'bg-emerald-500' : label === 'At Risk' ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
              <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic text-center">
                 * Status dynamically determined by Autonomous Perception Layer based on 7-day activity metrics.
              </p>
           </Card>

           <Card className="bg-indigo-600 border-none p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                 </div>
                 <h4 className="text-white font-black text-lg uppercase tracking-tight mb-2">Sync_Body_Protocol</h4>
                 <p className="text-white/80 text-[10px] font-medium leading-relaxed mb-6">Force trigger a global Agent synchronization for all student nodes in this institution.</p>
                 <Button className="w-full bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100">Broadcast_Sync_Command</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
