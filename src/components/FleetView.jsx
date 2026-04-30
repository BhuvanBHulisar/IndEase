import React, { useMemo } from 'react';
import PageHeader from './PageHeader';
import StatsCards from './StatsCards';
import { motion } from 'framer-motion';
import { 
  Plus, 
  AlertCircle, 
  MessageSquare, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  User, 
  Star, 
  ArrowUpRight,
  Activity,
  HardDrive
} from 'lucide-react';
import { getServiceStageMeta, SERVICE_STEPS } from '../utils/serviceRequestStatus';

const MOCK_EXPERTS_FALLBACK = [
  { id: 1, name: 'Alex Rivera', rating: 4.9, status: 'Active', special: 'Hydraulics' },
  { id: 2, name: 'Sarah Chen', rating: 4.8, status: 'Idle', special: 'Precision CNC' }
];

function ServiceStatusStepper({ stageIndex }) {
  return (
    <div className="w-full pt-4 mt-1 border-t border-[#E5E7EB]">
      <div className="flex items-center w-full">
        {SERVICE_STEPS.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                className={`h-0.5 flex-1 min-w-[6px] transition-colors ${
                  stageIndex >= i ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
                aria-hidden
              />
            )}
            <div className="flex flex-col items-center gap-1.5 max-w-[25%] min-w-0 flex-1">
              <span
                className={`rounded-full shrink-0 transition-all ${
                  i < stageIndex
                    ? 'w-2.5 h-2.5 bg-emerald-500'
                    : i === stageIndex
                      ? 'w-3 h-3 bg-[#0d9488] ring-2 ring-teal-200'
                      : 'w-2.5 h-2.5 bg-slate-300'
                }`}
              />
              <span
                className={`text-[9px] font-semibold uppercase tracking-wide text-center leading-tight px-0.5 ${
                  i < stageIndex
                    ? 'text-emerald-600'
                    : i === stageIndex
                      ? 'text-[#0d9488]'
                      : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function statusBadgeClasses(variant) {
  if (variant === 'yellow') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (variant === 'green') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-teal-50 text-teal-700 border-teal-200';
}

const FleetView = ({ 
  machines, 
  machinesLoading,
  notifications, 
  activeRequests,
  setActiveJobMachine,
  transactionHistory, 
  chats, 
  setActiveTab,
  onViewMachine,
  setShowAddMachineModal, 
  setShowReportIssueModal,
  onCancelRequest,
  verifiedExperts = [],
  expertPresence = {}
}) => {
  const verifiedExpertsDisplay = useMemo(() => {
    const pres = expertPresence || {};
    if (verifiedExperts && verifiedExperts.length > 0) {
      return verifiedExperts.map(exp => ({
        id: exp.id,
        name: exp.name || 'Expert',
        rating: exp.rating || 4.9,
        special: exp.specialization || 'Verified Expert',
        online: pres[String(exp.id)] === true || pres[exp.id] === true || exp.status === 'active'
      })).slice(0, 5);
    }
    
    if (chats && chats.length > 0) {
      const out = [];
      const seen = new Set();
      for (const c of chats) {
        const uid = c.other_party_id || c.expertId;
        if (!uid || seen.has(String(uid))) continue;
        seen.add(String(uid));
        const nameMatch = (c.name || '').match(/\(([^)]+)\)/);
        const name = nameMatch ? nameMatch[1].trim() : (c.name || 'Expert');
        const online = pres[String(uid)] === true || pres[uid] === true;
        out.push({ id: uid, name, rating: 4.9, special: 'Verified', online });
        if (out.length >= 5) break;
      }
      if (out.length) return out;
    }
    return MOCK_EXPERTS_FALLBACK.map((e) => ({
      ...e,
      online: e.status === 'Active'
    }));
  }, [chats, expertPresence, verifiedExperts]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-[32px] pb-24"
    >
      {/* ROW 1: HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <PageHeader
          title="My Dashboard"
          subtitle="Welcome back. Here is your service overview."
        />
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowReportIssueModal(true)}
             className="h-10 px-6 rounded-[10px] bg-[#0d9488] text-white font-medium text-sm shadow-sm hover:bg-teal-700 transition-all flex items-center gap-2"
           >
              <AlertCircle size={18} />
              Report Issue
           </button>
        </div>
      </div>

      {/* ROW 2: ACTIVE REQUESTS & EXPERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Service Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-[#0d9488]" />
              Active Service Requests
            </h3>
            <button className="text-[10px] font-semibold text-[#0d9488] hover:underline">View History</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activeRequests.map(req => {
              const meta = getServiceStageMeta(req.rawStatus, req.status);
              return (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`p-3 rounded-xl shrink-0 ${
                          meta.stageIndex >= 2 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <Activity size={24} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-slate-900 font-semibold text-base leading-tight">{req.issue}</h4>
                        <p className="text-slate-500 text-xs mt-1 font-normal">
                          {req.machine} • {req.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start sm:self-center">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          Assigned
                        </p>
                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[160px]">{req.expert}</p>
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${statusBadgeClasses(
                          meta.badgeVariant
                        )}`}
                      >
                        {meta.label}
                      </div>

                      {req.rawStatus === 'pending' || req.rawStatus === 'broadcast' ? (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             if(window.confirm('Are you sure you want to cancel this request?')) {
                                if(onCancelRequest) onCancelRequest(req.id);
                             }
                          }}
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : null}

                      <ArrowUpRight
                        size={20}
                        className="text-slate-300 group-hover:text-[#0d9488] transition-colors shrink-0"
                      />
                    </div>
                  </div>

                  <ServiceStatusStepper stageIndex={meta.stageIndex} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Experts */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight px-2 flex items-center gap-2">
            <User size={20} className="text-[#0d9488]" />
            Verified Experts
          </h3>
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm overflow-hidden">
            {verifiedExpertsDisplay.map((exp, idx) => (
              <div key={exp.id} className={`p-6 flex items-center justify-between ${idx !== verifiedExpertsDisplay.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 text-xs">
                    {exp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-semibold text-sm leading-tight">{exp.name}</h4>
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{exp.special}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs mb-1">
                    <Star size={12} fill="currentColor" />
                    {exp.rating}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${exp.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              </div>
            ))}
            <div className="p-4 bg-slate-50/50">
              <button className="w-full py-2 text-[10px] font-semibold text-slate-500 hover:text-[#0d9488] transition-colors">Find More Experts</button>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: CHAT & PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight px-2 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#0d9488]" />
            Recent Chats
          </h3>
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm overflow-hidden min-h-[280px]">
            {chats && chats.length > 0 ? chats.slice(0, 3).map((chat, idx) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveTab('messages')}
                className={`p-6 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${idx !== 2 ? 'border-b border-[#E5E7EB]' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                  {chat.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-slate-900 font-semibold text-sm">{chat.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-400">{chat.lastTime || '12:45'}</span>
                  </div>
                  <p className="text-slate-500 text-sm truncate">{chat.lastMsg || chat.lastMessage || "Click to open conversation history..."}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-[280px] p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <MessageSquare size={32} />
                </div>
                <p className="text-slate-500 font-normal text-sm">No recent chats. Request a service to start chatting with an expert.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments & Invoices */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight px-2 flex items-center gap-2">
            <CreditCard size={20} className="text-[#0d9488]" />
            Settle & Invoices
          </h3>
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm overflow-hidden min-h-[280px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Identifier</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {transactionHistory && transactionHistory.length > 0 ? transactionHistory.slice(0, 4).map((tx, idx) => (
                    <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900 tracking-tight">INV-{2020 + tx.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900 tracking-tighter">₹{tx.cost}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                          tx.paid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {tx.paid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {tx.paid ? 'Paid' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-[#0d9488] transition-colors">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center text-slate-500 font-normal text-sm">
                        No financial records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      {/* ROW 5: MY MACHINES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <HardDrive size={20} className="text-[#0d9488]" />
              My Machines
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 mt-1">{machines?.length || 0} machines registered</span>
          </div>
          
          <button 
             onClick={() => setShowAddMachineModal(true)}
             className="h-10 px-5 rounded-[10px] bg-[#0d9488] text-white font-medium text-sm shadow-sm hover:bg-teal-700 transition-all flex items-center gap-2"
           >
              <Plus size={16} />
              Add Machine
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {machines && machines.length > 0 ? machines.map(m => (
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
                <button 
                  className="h-10 px-4 rounded-[10px] bg-[#0d9488] text-white text-xs font-medium hover:bg-teal-700 transition-colors"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(typeof setActiveJobMachine === 'function') setActiveJobMachine(m);
                    setShowReportIssueModal(true); 
                  }}
                >
                  Request Service
                </button>
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
      </div>
    </motion.div>
  );
};

export default FleetView;
