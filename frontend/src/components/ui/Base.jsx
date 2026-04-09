import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300",
    outline: "bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all",
        className
      )}
      {...props}
    />
  );
}
