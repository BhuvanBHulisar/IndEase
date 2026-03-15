import React from 'react';
import { CheckCircle2, Wrench, PlusCircle, ChevronRight, Activity, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';

const defaultActivityItems = [
  {
    id: 1,
    text: 'Node restore successful: #MN-102 (Sector 4)',
    time: '2 hours ago',
    icon: CheckCircle2,
    color: '#16A34A',
    category: 'System'
  },
  {
    id: 2,
    text: 'Preventative maintenance scheduled: MN-089',
    time: 'Yesterday',
    icon: Wrench,
    color: '#FBBF24',
    category: 'Maintenance'
  },
  {
    id: 3,
    text: 'New industrial node integrated: MN-125',
    time: '2 days ago',
    icon: Cpu,
    color: '#3A86B7',
    category: 'Network'
  },
];

const serviceData = [
  { label: 'Operational', value: 79, count: 98, color: '#3A86B7' },
  { label: 'Maintenance', value: 11, count: 14, color: '#FBBF24' },
  { label: 'Decommissioned', value: 10, count: 12, color: '#ef4444' },
];

const DashboardGrid = ({ machines, notifications }) => {
  const machinesList = machines || [];
  const total = machinesList.length;
  const activeCount = machinesList.filter(m => m.condition_score > 50).length;
  const underRepairCount = machinesList.filter(m => m.condition_score > 20 && m.condition_score <= 50).length;
  const offlineCount = machinesList.filter(m => m.condition_score <= 20).length;

  const actualServiceData = total > 0 ? [
    { label: 'Operational', value: Math.round((activeCount/total)*100), count: activeCount, color: '#3A86B7' },
    { label: 'Maintenance', value: Math.round((underRepairCount/total)*100), count: underRepairCount, color: '#FBBF24' },
    { label: 'Decommissioned', value: Math.round((offlineCount/total)*100), count: offlineCount, color: '#ef4444' },
  ] : serviceData;

  const recentActivities = notifications && notifications.length > 0
    ? notifications.slice(0, 3).map((n, i) => {
        let icon = CheckCircle2;
        let color = '#16A34A';
        let category = 'System';
        if (n.type === 'critical' || n.type === 'warning') { icon = ShieldAlert; color = '#FBBF24'; category = 'Alert'; }
        else if (n.type === 'info') { icon = Terminal; color = '#3A86B7'; category = 'Log'; }
        
        return {
          id: n.id || i,
          text: n.msg || n.title || 'Broadcast telemetry update',
          time: n.time || '12 minutes ago',
          icon,
          color,
          category
        };
      })
    : defaultActivityItems;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* System Activity Feed */}
      <div className="lg:col-span-12 xl:col-span-7 bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm p-10 flex flex-col gap-10 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[var(--primary)] shadow-sm">
                <Terminal size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Telemetry Stream</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Node Interaction</p>
              </div>
           </div>
           <button className="px-4 py-2 bg-slate-50 hover:bg-white hover:border-[var(--primary)]/30 border border-transparent rounded-xl text-[10px] font-black text-slate-500 hover:text-[var(--primary)] uppercase tracking-widest transition-all">View Audit Terminal</button>
        </div>
        
        <div className="space-y-4 relative z-10">
          {recentActivities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-[var(--primary)]/10 hover:bg-white hover:shadow-premium transition-all group"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0 pr-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-[var(--primary)]/80 transition-colors">{item.category}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-blue-200" />
                       <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                    </div>
                    <span className="font-bold text-[15px] text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors truncate">
                      {item.text}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  <ChevronRight size={18} strokeWidth={3} className="text-slate-200 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 -mr-32 -mt-32 rounded-full pointer-events-none" />
      </div>

      {/* Fleet Ecosystem Status */}
      <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm p-10 flex flex-col items-center justify-center gap-12 overflow-hidden relative">
        <div className="w-full relative z-10">
           <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Connectivity Status</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Health Distribution</p>
        </div>
        
        <div className="flex flex-col items-center gap-12 w-full relative z-10">
          <DonutChart data={actualServiceData} />
          
          <div className="grid grid-cols-1 gap-4 w-full pt-4">
            {actualServiceData.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 bg-slate-50/50 group hover:border-slate-200 hover:bg-white transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.2)]" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {item.value}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle Decorative Gradient */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 -ml-24 -mb-24 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

function DonutChart({ data }) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativeOffset = 0;

  return (
    <div className="relative group">
      {/* Pulse Halo */}
      <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-full animate-ping group-hover:bg-[var(--primary)]/10 transition-colors duration-500 scale-90" />
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 relative z-10 filter drop-shadow-md">
        {data.map((item, index) => {
          const dashLength = (item.value / 100) * circumference;
          const dashOffset = circumference - cumulativeOffset;
          cumulativeOffset += dashLength;

          return (
            <motion.circle
              key={item.label}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
              transition={{ duration: 1.8, ease: "circOut", delay: index * 0.15 }}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-[stroke-width] duration-300 hover:stroke-[20px]"
            />
          );
        })}
      </svg>
      {/* Center Intelligence Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center relative z-20">
        <span className="text-5xl font-black text-slate-900 tracking-tighter transition-transform group-hover:scale-110 duration-500">
          {totalCount}
        </span>
        <div className="mt-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Active Nodes</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardGrid;
