import React from 'react';
import { LayoutGrid, CheckCircle2, Wrench, AlertCircle, TrendingUp, Cpu, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';

const defaultStats = [
  {
    title: 'Fleet Capacity',
    icon: Cpu,
    color: '#3A86B7',
    trend: '+12.4%',
  },
  {
    title: 'Operational Nodes',
    icon: CheckCircle2,
    color: '#16A34A',
    trend: '+5.2%',
  },
  {
    title: 'Maintenance Frequency',
    icon: Activity,
    color: '#FBBF24',
    trend: '-2.1%',
  },
  {
    title: 'High Priority Alerts',
    icon: Zap,
    color: '#EF4444',
    trend: 'Stable',
  },
];

const StatsCards = ({ machines }) => {
  const machinesList = machines || [];
  const total = machinesList.length || 124;
  const active = machinesList.filter(m => m.condition_score > 50).length || 98;
  const underRepair = machinesList.filter(m => m.condition_score > 20 && m.condition_score <= 50).length || 14;
  const offline = machinesList.filter(m => m.condition_score <= 20).length || 12;

  const values = [total, active, underRepair, offline];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {defaultStats.map((stat, idx) => {
        const Icon = stat.icon;
        const color = stat.color;
        
        return (
          <div
            key={stat.title}
            className="bg-white border border-slate-200/60 rounded-[1.5rem] p-8 shadow-sm hover:shadow-premium transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-[var(--accent-soft)]/50 transition-colors duration-500" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: `${color}10`, color: color }}
              >
                <Icon size={24} strokeWidth={2.5} />
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-white transition-colors">
                <TrendingUp size={12} className={stat.trend.startsWith('+') ? 'text-[var(--success)]' : 'text-slate-400'} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  stat.trend.startsWith('+') ? 'text-[var(--success)]' : 'text-slate-500'
                )}>
                  {stat.trend}
                </span>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-slate-500 transition-colors">
                {stat.title}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-[var(--primary)] transition-colors">
                  {values[idx].toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">Units</span>
              </div>
            </div>
            
            {/* Visual Progress Indicator */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden relative z-10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(values[idx] / (values[0] || 100)) * 100}%` }}
                 transition={{ duration: 1.5, ease: "circOut", delay: idx * 0.1 }}
                 className="h-full rounded-full shadow-[0_0_8px_rgba(58,134,183,0.2)]"
                 style={{ backgroundColor: color }}
               />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
