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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* System Activity Feed */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Terminal size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 leading-tight">Telemetry Stream</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Live Updates</p>
              </div>
           </div>
           <button className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">Audit Terminal</button>
        </div>
        
        <div className="space-y-3 flex-1">
          {recentActivities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-slate-50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}08`, color: item.color }}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm text-slate-800 truncate">
                      {item.text}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Ecosystem Status */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm flex flex-col h-full">
        <div className="mb-4">
           <h3 className="text-lg font-semibold text-slate-900 leading-tight">Connectivity Status</h3>
           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Network Distribution</p>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <DonutChart data={actualServiceData} />
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 w-full">
            {actualServiceData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function DonutChart({ data }) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativeOffset = 0;

  return (
    <div className="relative group">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 relative z-10">
        {data.map((item, index) => {
          const dashLength = (item.value / 100) * circumference;
          const dashOffset = circumference - cumulativeOffset;
          cumulativeOffset += dashLength;

          return (
            <motion.circle
              key={item.label}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
              transition={{ duration: 1.5, ease: "circOut", delay: index * 0.1 }}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-[stroke-width] duration-300 hover:stroke-[14px]"
            />
          );
        })}
      </svg>
      {/* Center Intelligence Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {totalCount}
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Nodes</span>
      </div>
    </div>
  );
}

export default DashboardGrid;
