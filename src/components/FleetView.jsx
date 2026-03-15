import React from 'react';
import PageHeader from './PageHeader';
import StatsCards from './StatsCards';
import DashboardGrid from './DashboardGrid';
import QuickActions from './QuickActions';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Activity } from 'lucide-react';

const FleetView = ({ machines, notifications, earningsStats, chartData, avgContinuity, setShowAddMachineModal, onDecommission }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-12 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-100">
         <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={12} strokeWidth={3} />
                  Authorized Operator
               </div>
               <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Network Synchronized
               </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Fleet Ecosystem</h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
               Comprehensive administrative overview of industrial assets, real-time connectivity telemetry, and localized service requests.
            </p>
         </div>

         <div className="flex items-center gap-6 p-6 bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm">
            <div className="flex flex-col text-right">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Reliability</span>
               <span className="text-2xl font-black text-slate-900 tracking-tighter">99.98%</span>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Activity size={24} strokeWidth={2.5} />
            </div>
         </div>
      </div>

      <StatsCards machines={machines} />
      
      <div className="grid grid-cols-1 gap-12">
        <DashboardGrid machines={machines} notifications={notifications} />
        <QuickActions 
          onAddMachine={() => setShowAddMachineModal(true)} 
          onViewHistory={() => {}} // Placeholder for now
          onSendMessage={() => {}} // Placeholder for now
        />
      </div>
    </motion.div>
  );
};

export default FleetView;
