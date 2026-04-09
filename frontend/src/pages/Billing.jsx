import { useState, useEffect } from "react";
import { Button, Card } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { Check, Zap, Crown, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchBilling() {
      try {
        const data = await apiRequest("/api/v1/billing/subscription", { method: "GET" })
          .catch(() => ({ 
            subscription: { plan: "free", status: "active" }, 
            limits: {}, 
            usage: [] 
          }));
        setSubscription(data);
      } finally {
        setLoading(false);
      }
    }
    fetchBilling();
  }, []);

  const plans = [
    {
      name: "Free",
      id: "free",
      price: "$0",
      icon: Zap,
      features: ["3 Resume Analyses / mo", "Basic AI Chat", "Community Support"],
      buttonText: "Current Plan",
      variant: "secondary"
    },
    {
      name: "Pro",
      id: "pro",
      price: "$29",
      icon: Crown,
      features: ["Unlimited Analyses", "Priority AI Mentor", "Mock Interviews", "Email Support"],
      buttonText: "Upgrade to Pro",
      variant: "primary",
      highlight: true
    },
    {
      name: "Enterprise",
      id: "enterprise",
      price: "Custom",
      icon: Shield,
      features: ["Team Management", "SSO & SCIM", "Dedicated Support", "Custom AI Models"],
      buttonText: "Contact Sales",
      variant: "secondary"
    }
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-bold text-white">Subscription & Billing</h2>
        <p className="text-slate-400 mt-1">Manage your plan and organization limits.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const isCurrent = (subscription?.subscription?.plan || "free") === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative flex flex-col h-full bg-slate-900 overflow-hidden ${
                plan.highlight ? "border-indigo-500/50 ring-1 ring-indigo-500/20" : "border-white/5"
              }`}>
                {plan.highlight && (
                   <div className="absolute top-0 right-0 bg-indigo-500 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-[0.2em] rounded-bl-xl">
                     Recommended
                   </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    plan.highlight ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xl font-bold text-white">{plan.price}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                   {plan.features.map((feature, fIdx) => (
                     <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-400">
                       <Check className="h-4 w-4 text-emerald-500" />
                       {feature}
                     </li>
                   ))}
                </ul>

                <Button 
                  variant={plan.variant} 
                  disabled={isCurrent}
                  className="w-full"
                  onClick={() => !isCurrent && (window.location.href = "https://business.paytm.com/")}
                >
                  {isCurrent ? "Current Plan" : plan.buttonText}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-slate-900/40 border-white/5">
         <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Usage History</h3>
         <div className="text-sm text-slate-500 text-center py-10">
            No recent billing activity to show.
         </div>
      </Card>
    </div>
  );
}
