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
  Calendar
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';

export default function HistoryView({ serviceHistory, onDownloadReport, onViewReport }) {
  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b border-slate-100">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <Badge className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Service Audit
             </Badge>
             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Database size={10} className="text-slate-300" />
                Total Entries: {serviceHistory?.length || 0}
             </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Maintenance Ledger</h2>
          <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
            Authorized repository of all maintenance interactions, diagnostic reports, and node restoration logs across the enterprise fleet.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">
             <Filter className="w-3.5 h-3.5 mr-2.5" strokeWidth={2.5} />
             Filter Stream
           </Button>
           <Button className="h-12 px-6 rounded-xl bg-slate-900 text-white hover:bg-black transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10">
             <FileDown className="w-3.5 h-3.5 mr-2.5" strokeWidth={2.5} />
             Export Ledger
           </Button>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
           <div className="relative w-full lg:max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                 <Search size={16} strokeWidth={2.5} />
              </div>
              <input 
                type="text"
                placeholder="Query Reference ID, Machine, or Expert..." 
                className="w-full pl-12 h-12 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:font-medium placeholder:text-slate-400 outline-none" 
              />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Log Status</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center gap-2">
                 <Calendar size={14} className="text-slate-300" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Time</span>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Junction Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Machine Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Service Provider</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Protocol Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Yield / Cost</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {serviceHistory.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">REF#{report.id + 1000}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Cpu size={14} />
                       </div>
                       <span className="font-bold text-slate-700 tracking-tight">{report.machine}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-[10px] shadow-lg shadow-blue-500/10">
                          {report.expert?.[0] || 'E'}
                       </div>
                       <span className="text-sm font-bold text-slate-600 tracking-tight">{report.expert}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border transition-all",
                      report.status === 'Completed' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500" 
                        : "bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                    )}>
                      {report.status?.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">₹{report.cost}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invoiced</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => onViewReport(report)} className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-premium flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"><FileText size={18} strokeWidth={2.5} /></button>
                       <button onClick={() => onDownloadReport(report)} className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-premium flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"><Download size={18} strokeWidth={2.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {serviceHistory.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <History className="text-slate-200" size={40} strokeWidth={1} />
                      </div>
                      <h4 className="text-slate-400 font-black uppercase tracking-widest">Ledger Entries Not Found</h4>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Audit Segment */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-emerald-500" />
              End-to-end encrypted maintenance ledger
           </div>
           <div className="flex gap-4">
              <button className="px-6 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 bg-white border border-slate-200 shadow-sm transition-all disabled:opacity-50">Previous Sector</button>
              <button className="px-6 py-2 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white bg-white border border-slate-200 shadow-sm transition-all disabled:opacity-50">Next Sector</button>
           </div>
        </div>
      </div>
    </div>
  );
}
