import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  Wallet, 
  Star, 
  Clock, 
  CheckCircle2, 
  XSquare,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';
import api from '../services/api';

const LEVEL_META = {
  Starter: { accent: '#6b7280', cardClass: 'border-slate-200 bg-slate-50', progressClass: 'bg-slate-500', nextLevel: 'Bronze', nextPoints: 100 },
  Bronze: { accent: '#0d9488', cardClass: 'border-teal-200 bg-teal-50', progressClass: 'bg-teal-600', nextLevel: 'Silver', nextPoints: 300 },
  Silver: { accent: '#16a34a', cardClass: 'border-emerald-200 bg-emerald-50', progressClass: 'bg-emerald-600', nextLevel: 'Gold', nextPoints: 600 },
  Gold: { accent: '#d97706', cardClass: 'border-amber-200 bg-amber-50', progressClass: 'bg-amber-500', nextLevel: 'Elite', nextPoints: 1000 },
  Elite: { accent: '#7c3aed', cardClass: 'border-violet-200 bg-violet-50', progressClass: 'bg-violet-600', nextLevel: null, nextPoints: null }
};

export default function PerformanceView({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!userId || userId === 'IND-00000') { setLoading(false); return; }
      try {
        const res = await api.get(`/providers/${userId}/performance`);
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error('Performance fetch error:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else if (err.response?.status === 404) {
          // Treat as empty — new expert
          setData({
            points: 0, level: 'Starter', salary: 0, levelSalary: 0,
            jobsCompleted: 0, rating: 5.0, acceptanceRate: '100%',
            avgCompletionTime: '0 hrs', totalJobsDeclined: 0,
            totalJobEarnings: 0, monthJobEarnings: 0, totalSalaryPaid: 0,
            lifetimeEarnings: 0, recentPointEvents: [],
            nextSalaryDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
            isEmpty: true
          });
          setError(null);
        } else {
          setError(null);
          setData({
            points: 0, level: 'Starter', salary: 0, levelSalary: 0,
            jobsCompleted: 0, rating: 5.0, acceptanceRate: '100%',
            avgCompletionTime: '0 hrs', totalJobsDeclined: 0,
            totalJobEarnings: 0, monthJobEarnings: 0, totalSalaryPaid: 0,
            lifetimeEarnings: 0, recentPointEvents: [],
            nextSalaryDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
            isEmpty: true
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [userId]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center font-bold text-slate-400">
      Loading metrics...
    </div>
  );

  if (error) return (
    <div className="h-96 flex flex-col items-center justify-center gap-3 text-center px-6">
      <Activity size={40} className="text-slate-300" />
      <p className="font-bold text-red-500">{error}</p>
    </div>
  );

  if (!data || data.isEmpty) return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto mt-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Start earning points
        </h2>
        <p className="text-slate-500 font-medium max-w-2xl text-sm">
          Build your reputation on the platform to unlock higher tiers and larger bonuses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="rounded-[20px] bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
               <CheckCircle2 size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-base">Complete a job</h3>
               <span className="inline-block mt-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">+20 points</span>
            </div>
         </div>
         <div className="rounded-[20px] bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
               <Star size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-base">Get a 5-star rating</h3>
               <span className="inline-block mt-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">+15 points</span>
            </div>
         </div>
         <div className="rounded-[20px] bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
               <Zap size={24} />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 text-base">Respond fast (under 1 hr)</h3>
               <span className="inline-block mt-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">+5 points</span>
            </div>
         </div>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-200 rounded-[20px]">
        <p className="text-slate-600 font-medium mb-4">Accept your first service request to begin!</p>
        <button onClick={() => window.location.href='/expert-dashboard'} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm">View Incoming Requests</button>
      </div>
    </div>
  );

  const meta = LEVEL_META[data.level] || LEVEL_META.Starter;
  const progressPercent = meta.nextPoints ? Math.min(100, (data.points / meta.nextPoints) * 100) : 100;

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={28} />
          My Performance
        </h2>
        <p className="text-slate-500 font-medium tracking-tight">Real-time breakdown of your reputation, service quality, and historical earnings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: Level Progress */}
        <div className={cn("col-span-1 lg:col-span-2 rounded-[24px] border p-8 shadow-sm flex flex-col justify-between", meta.cardClass)}>
           <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reputation Tier</span>
                <h3 className="text-3xl font-black text-slate-900">{data.level} Expert</h3>
              </div>
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center" style={{ color: meta.accent }}>
                 <Award size={36} strokeWidth={2.5} />
              </div>
           </div>

           <div className="mt-8 space-y-6">
              <div className="flex items-end justify-between">
                 <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">{data.points.toLocaleString()} Points Accumulated</p>
                    <p className="text-sm font-medium text-slate-500">
                      {meta.nextLevel ? `Need ${meta.nextPoints - data.points} more points to reach ${meta.nextLevel}` : 'Top Tier Reached'}
                    </p>
                 </div>
                 <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{Math.round(progressPercent)}%</span>
                 </div>
              </div>
              <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden border border-white/20">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", meta.progressClass)} 
                 />
              </div>
           </div>

           <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/80 border border-white p-4 rounded-2xl">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Salary</span>
                 <p className="text-xl font-bold text-slate-900">₹{data.salary?.toLocaleString()}</p>
              </div>
           </div>
        </div>

        {/* Section 4: Performance Stats */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engagement Metrics</h4>
           
           <div className="space-y-5">
              <StatRow icon={CheckCircle2} label="Acceptance Rate" value={data.acceptanceRate} color="text-indigo-600" bg="bg-indigo-50" />
              <StatRow icon={Star} label="Avg. Rating" value={`${data.rating}/5.0`} color="text-amber-600" bg="bg-amber-50" />
              <StatRow icon={Clock} label="Avg. Completion" value={data.avgCompletionTime} color="text-teal-600" bg="bg-teal-50" />
              <StatRow icon={CheckCircle2} label="Total Completed" value={data.jobsCompleted} color="text-emerald-600" bg="bg-emerald-50" />
              <StatRow icon={XSquare} label="Total Declined" value={data.totalJobsDeclined} color="text-rose-600" bg="bg-rose-50" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 2: Points History */}
        <div className="col-span-1 lg:col-span-2 rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <Activity size={18} className="text-indigo-600" />
                 Points History
              </h4>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Impact</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {data.recentPointEvents.map((event) => (
                       <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <span className="text-xs font-bold text-slate-900">
                                {new Date(event.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-medium text-slate-600">{event.reason}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className={cn(
                                "text-sm font-black tracking-tighter",
                                event.pointChange >= 0 ? "text-emerald-600" : "text-rose-600"
                             )}>
                                {event.pointChange >= 0 ? '+' : ''}{event.pointChange}
                             </span>
                          </td>
                       </tr>
                    ))}
                    {data.recentPointEvents.length === 0 && (
                       <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No historical activities logged.</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Section 3: Earnings Breakdown */}
        <div className="rounded-[24px] border border-indigo-100 bg-white p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet size={120} />
           </div>
           
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Earnings</h4>
           
           <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">Lifetime Earnings <ArrowUpRight size={10} /></span>
                 <p className="text-3xl font-black text-slate-900 tracking-tight">₹{data.lifetimeEarnings?.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <EarningLine label="Job Revenue (Total)" value={`₹${data.totalJobEarnings?.toLocaleString()}`} />
                 <EarningLine label="Job Revenue (This Month)" value={`₹${data.monthJobEarnings?.toLocaleString()}`} />
                 <EarningLine label="Salary Paid (Total)" value={`₹${data.totalSalaryPaid?.toLocaleString()}`} />
              </div>

              <div className="pt-4 border-t border-slate-100 mt-2">
                 <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Wallet size={18} />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Next Salary Payout</span>
                    </div>
                    <p className="text-2xl font-black tracking-tight mb-1">₹{data.salary?.toLocaleString()}</p>
                    <div className="flex items-center gap-2 opacity-80 mt-1">
                       <Calendar size={12} />
                       <span className="text-xs font-semibold">
                          Expected on {data.nextSalaryDate ? new Date(data.nextSalaryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Next month'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", bg, color)}>
             <Icon size={18} />
          </div>
          <span className="text-sm font-semibold text-slate-500">{label}</span>
       </div>
       <span className={cn("text-base font-black tracking-tight", color)}>{value}</span>
    </div>
  );
}

function EarningLine({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
