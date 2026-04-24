import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  MoreHorizontal,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileDown,
  Database,
  Calendar,
  Cpu,
  Star
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { SkeletonTable } from './ui/Skeleton';

export default function HistoryView({ serviceHistory = [], loading, onDownloadReport, onViewReport, onRequestService }) {
  const getStatusLabel = (status, paymentStatus) => {
    const normalizedStatus = (status || "").toLowerCase();
    const normalizedPayment = (paymentStatus || "").toLowerCase();
    if (normalizedStatus === 'completed') return { label: 'Completed', color: 'green' };
    if (normalizedPayment === 'captured' || normalizedPayment === 'paid') return { label: 'Paid', color: 'green' };
    if (normalizedPayment === 'escrow' || normalizedPayment === 'pending') return { label: 'Payment Pending', color: 'amber' };
    if (normalizedStatus === 'in_progress') return { label: 'In Progress', color: 'blue' };
    if (normalizedStatus === 'accepted') return { label: 'Active', color: 'blue' };
    return { label: status || 'Active', color: 'gray' };
  };

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b border-[#E5E7EB]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <Badge className="bg-teal-50 text-[#0d9488] border border-teal-100 rounded-lg px-3 py-1 text-[10px] font-semibold tracking-widest">
                Service Records
             </Badge>
             <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 tracking-widest">
                <Database size={10} className="text-slate-400" />
                Total Entries: {serviceHistory?.length || 0}
             </div>
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Maintenance History</h2>
          <p className="text-slate-500 font-normal max-w-xl leading-relaxed">
            Track all repairs and service records for your machines.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm overflow-hidden relative">
        <div className="p-8 border-b border-[#E5E7EB] flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#F9FAFB]">
           <div className="relative w-full lg:max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                 <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text"
                placeholder="Search history..." 
                className="w-full pl-12 h-11 rounded-xl bg-white border border-[#E5E7EB] focus:border-[#0d9488] transition-all text-sm font-medium placeholder:font-normal placeholder:text-slate-400 outline-none" 
              />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 tracking-widest">Verified</span>
              </div>
           </div>
        </div>
        
        {loading ? (
          <div className="p-8">
            <SkeletonTable />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-100">Date / Machine</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-100">Expert Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-100">Service Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-100">Financial Summary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-100 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceHistory.map((record) => {
                const statusMeta = getStatusLabel(record.status, record.paymentStatus || record.payment_status);
                const displayAmount = record.paid_amount
                  || record.amount
                  || record.quoted_cost
                  || record.cost
                  || record.totalAmount
                  || 0;
                const formattedAmount = displayAmount
                  ? `₹${Number(displayAmount).toLocaleString('en-IN')}`
                  : 'Pending';
                const numericAmount = Number(displayAmount) || 0;
                return (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {record.date ? new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                    </p>
                    <div className="flex items-center gap-2">
                       <Cpu size={14} className="text-indigo-500" />
                       <span className="font-bold text-slate-900 tracking-tight">{record.machine_name || record.machine || record.machineName || 'Machine'}</span>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">{record.expert || record.expertName || 'Expert'}</span>
                          {(record.expertLevel || record.expert_level) && (
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                              (record.expertLevel || record.expert_level) === 'Elite' ? "bg-purple-100 text-purple-700" :
                              (record.expertLevel || record.expert_level) === 'Gold' ? "bg-amber-100 text-amber-700" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {record.expertLevel || record.expert_level}
                            </span>
                          )}
                       </div>
                       {statusMeta.label === 'Completed' && (
                         <div className="flex items-center gap-1 text-amber-500">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-black">{record.rating || '5.0'}</span>
                         </div>
                       )}
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                       <div className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border w-fit",
                        statusMeta.color === "green"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : statusMeta.color === "amber"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : statusMeta.color === "blue"
                              ? "bg-teal-50 text-teal-700 border-teal-100"
                              : "bg-slate-50 text-slate-700 border-slate-100"
                        )}>
                        {statusMeta.label}
                       </div>
                       <div className="flex items-center gap-1 text-slate-400">
                          <Clock size={10} />
                          <span className="text-[9px] font-bold uppercase tracking-tighter">Completed in 1.4 hrs</span>
                       </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                       <span className="text-base font-black text-slate-900">{formattedAmount}</span>
                       {statusMeta.label === 'Completed' && (
                         <div className="flex items-center gap-1 group/fee cursor-help relative">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-dotted border-slate-300">View Breakdown</span>
                            
                            {/* Simple hover tooltip simulation */}
                            <div className="hidden group-hover/fee:block absolute bottom-full left-0 mb-2 p-3 bg-slate-900 text-white rounded-xl shadow-xl w-48 z-20 pointer-events-none">
                               <div className="space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                     <span className="opacity-60">Expert Payout</span>
                                     <span className="font-bold">₹{Math.floor(numericAmount * 0.9).toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px]">
                                     <span className="opacity-60">Platform Fee</span>
                                     <span className="font-bold">₹{Math.floor(numericAmount * 0.1).toLocaleString('en-IN')}</span>
                                  </div>
                               </div>
                               <div className="mt-2 pt-2 border-t border-white/10 text-[8px] opacity-60 italic">
                                  Securely split by IndEase Route.
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => onViewReport?.(record)} className="w-9 h-9 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><FileText size={16} /></button>
                       <button onClick={() => onDownloadReport?.(record)} className="w-9 h-9 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              )})}
              {serviceHistory.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="text-slate-200" size={32} />
                      </div>
                      <h4 className="text-slate-900 font-bold tracking-tight mb-1">No maintenance records yet</h4>
                      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">All verified service logs will appear here after completion.</p>
                      {onRequestService && (
                        <Button onClick={onRequestService} className="bg-indigo-600 text-white rounded-xl px-6 h-10 text-xs font-bold tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Request New Service</Button>
                      )}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
