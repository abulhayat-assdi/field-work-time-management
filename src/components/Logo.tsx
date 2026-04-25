import { GraduationCap, TrendingUp, BarChart3 } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3 bg-[#0f172a] px-4 py-2.5 rounded-2xl shadow-lg border border-slate-700/50 w-fit">
      <div className="relative flex items-end justify-center w-8 h-8 mr-1">
        <BarChart3 className="text-white w-7 h-7" strokeWidth={2.5} />
        <GraduationCap className="text-white w-7 h-7 absolute -top-4 -left-2 rotate-[-10deg] drop-shadow-md" strokeWidth={2.5} fill="currentColor" />
        <TrendingUp className="text-emerald-500 w-6 h-6 absolute -right-3 top-1" strokeWidth={4} />
      </div>
      <div className="flex flex-col items-start leading-[1.1]">
        <span className="text-white font-black text-[14px] tracking-widest uppercase">Sales</span>
        <span className="text-amber-500 font-black text-[14px] tracking-widest uppercase">Marketing</span>
      </div>
    </div>
  );
}
