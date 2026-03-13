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
  AlertCircle
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Service History</h2>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Full industrial maintenance audit trail.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl flex items-center gap-2 h-11 px-5 border-2 hover:bg-slate-50 transition-all font-bold">
             <Filter className="w-4 h-4" />
             Filter Table
           </Button>
           <Button variant="outline" className="rounded-xl flex items-center gap-2 h-11 px-5 border-2 hover:bg-slate-50 transition-all font-bold">
             <Download className="w-4 h-4" />
             Export Audit
           </Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-slate-200/50 shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search records by ID, Expert or Machine..." className="pl-11 rounded-2xl h-12 border-slate-200 focus:border-primary transition-all text-sm font-medium" />
           </div>
           
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:flex">
              Total Records: <span className="text-slate-900 ml-1">{serviceHistory?.length || 0}</span>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 group hover:bg-slate-100/50 transition-colors">
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pl-10">Reference</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Industrial Node</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Certified Expert</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Integrity Status</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Service Cost</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceHistory.map((report, i) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 pl-10">
                    <div>
                      <p className="font-extrabold text-slate-900 group-hover:text-primary transition-colors">INV-{report.id + 2026}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">{report.date}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden group-hover:scale-110 transition-transform">
                          <Factory className="w-4 h-4 text-slate-500" />
                       </div>
                       <span className="font-bold text-slate-700">{report.machine}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] shrink-0">
                          {report.expert?.[0] || 'E'}
                       </div>
                       <span className="font-bold text-slate-600">{report.expert}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant={report.status === 'Completed' ? 'success' : 'default'} className="rounded-lg px-2.5 py-1.5 font-bold flex items-center gap-1.5 w-fit">
                      {report.status === 'Completed' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                      {report.status?.toUpperCase() || 'SIGNAL LOST'}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      ₹{report.cost}
                    </span>
                  </td>
                  <td className="p-6 text-right pr-10">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" variant="ghost" onClick={() => onViewReport(report)} className="rounded-xl hover:bg-slate-100 h-9 w-9 text-slate-400 hover:text-primary"><FileText size={18} /></Button>
                       <Button size="icon" variant="ghost" onClick={() => onDownloadReport(report)} className="rounded-xl hover:bg-slate-100 h-9 w-9 text-slate-400 hover:text-primary"><Download size={18} /></Button>
                       <Button size="icon" variant="ghost" className="rounded-xl hover:bg-slate-100 h-9 w-9 text-slate-400"><MoreHorizontal size={18} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {serviceHistory.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-20 text-center">
                      <History className="w-12 h-12 text-slate-200 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No industrial records found in local memory</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Digital Identity Ledger v2.4a</p>
           <div className="flex gap-2 pr-4">
              <Button size="sm" variant="ghost" className="rounded-lg text-slate-400 font-bold text-[10px] uppercase">Prev Signal</Button>
              <Button size="sm" variant="ghost" className="rounded-lg text-slate-900 font-bold text-[10px] uppercase bg-white shadow-sm ring-1 ring-slate-200">Transmit Data 1-10</Button>
              <Button size="sm" variant="ghost" className="rounded-lg text-slate-400 font-bold text-[10px] uppercase">Next Signal</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}

function Factory(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}
