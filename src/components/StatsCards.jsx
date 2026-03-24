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
            className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${color}08`, color: color }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#F1F5F9] rounded-lg">
                <TrendingUp size={12} className={stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'} />
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest",
                  stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'
                )}>
                  {stat.trend}
                </span>
              </div>
            </div>

            <div className="text-left space-y-1">
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                {stat.title}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900 tracking-tight">
                  {values[idx].toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Units</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
