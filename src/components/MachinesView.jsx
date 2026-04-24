import React from 'react';
import { Plus, HardDrive, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SkeletonMachineCard } from './ui/Skeleton';

const MachinesView = ({ machines, loading, setShowAddMachineModal, onViewMachine, setActiveJobMachine, setShowReportIssueModal, activeRequests = [], setActiveTab }) => {
  const machineHasActiveRequest = (machineId) =>
    activeRequests.some(
      (r) =>
        r.machine_id === machineId &&
        ['pending', 'broadcast', 'accepted', 'in_progress'].includes(r.status)
    );
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-[32px] pb-24 animate-fade-in"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
         <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
               <span className="p-2 bg-teal-50 text-[#0d9488] rounded-[10px]">
                 <HardDrive size={24} />
               </span>
               My Machines
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-2xl">
               View and manage all your registered machines.
            </p>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={() => setShowAddMachineModal(true)}
               className="h-10 px-6 rounded-[10px] bg-[#0d9488] text-white font-medium text-sm shadow-sm hover:bg-teal-700 transition-all flex items-center gap-2"
             >
                <Plus size={18} />
                Add Machine
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <>
            <SkeletonMachineCard />
            <SkeletonMachineCard />
            <SkeletonMachineCard />
          </>
        ) : machines && machines.length > 0 ? machines.map(m => (
          <div 
            key={m.id || m._id} 
            className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => { if(typeof onViewMachine === 'function') onViewMachine(m) }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#0d9488] transition-colors group-hover:bg-[#0d9488] group-hover:text-white">
                <HardDrive size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest border ${
                m.condition_score > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                m.condition_score > 50 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                'bg-red-50 text-red-600 border-red-100'
              }`}>
                {m.condition_score > 80 ? 'Optimal' : m.condition_score > 50 ? 'Warning' : 'Critical'}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-slate-900 tracking-tight mb-1">{m.name}</h4>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{m.machine_type || 'Industrial Asset'} ({m.model_year || '2024'})</p>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
              {machineHasActiveRequest(m.id || m._id) ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof setActiveTab === 'function') setActiveTab('my-requests');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  View Request →
                </button>
              ) : (
                <button
                  className="h-10 px-4 rounded-[10px] bg-[#0d9488] text-white text-xs font-medium hover:bg-teal-700 transition-colors z-10 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    if(typeof setActiveJobMachine === 'function') setActiveJobMachine(m);
                    if(typeof setShowReportIssueModal === 'function') setShowReportIssueModal(true);
                  }}
                >
                  Request Service
                </button>
              )}
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowUpRight size={18} className="group-hover:text-[#0d9488] transition-colors" />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 bg-slate-50/30 rounded-[16px] border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-4">
              <HardDrive size={32} />
            </div>
            <p className="text-slate-500 font-normal max-w-xs px-10">You haven't added any machines yet. Add your first machine to get started.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MachinesView;
