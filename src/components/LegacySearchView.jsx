import React, { useState } from 'react';
import { 
  Search, 
  History, 
  FileText,
  AlertCircle,
  Cpu,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { 
  Badge, 
  cn 
} from '../components/ui/base';

export default function LegacySearchView({ onDownloadReport }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveActiveCategory] = useState('All');

  const categories = ["All", "Service History", "Uploaded Reports", "Fault Records"];

  // Mock data for records
  const mockRecords = [
    { id: 1, machine: "Hydraulic Press #08", service: "Valve Seal Replacement", expert: "Alex Rivera", date: "Mar 12, 2026", status: "Completed", type: "Service History" },
    { id: 2, machine: "CNC Mill X-200", service: "System Calibration", expert: "Sarah Chen", date: "Mar 05, 2026", status: "Completed", type: "Uploaded Reports" },
    { id: 3, machine: "Backup Generator G-5", service: "Emergency Shutdown", expert: "Mike Ross", date: "Feb 28, 2026", status: "Failed", type: "Fault Records" },
    { id: 4, machine: "Hydraulic Press #08", service: "Pressure Sensor Check", expert: "Alex Rivera", date: "Feb 15, 2026", status: "Completed", type: "Service History" },
  ];

  const filteredRecords = mockRecords.filter(record => {
    const matchesQuery = record.machine.toLowerCase().includes(query.toLowerCase()) || 
                         record.service.toLowerCase().includes(query.toLowerCase()) || 
                         record.expert.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || record.type === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-10 pb-20 max-w-[1200px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Machine Records</h2>
        <p className="text-slate-500 font-normal text-base leading-relaxed">
          View past service records, reports, and machine data.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            aria-label="Search machine records"
            placeholder="Search by machine name, service, or expert..."
            className="w-full pl-12 pr-4 h-11 rounded-xl bg-white border border-[#E5E7EB] text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] outline-none transition-all"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                activeCategory === cat 
                  ? "bg-[#2563EB] text-white border-[#2563EB]" 
                  : "bg-white text-slate-500 border-[#E5E7EB] hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div 
              key={record.id}
              className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#2563EB] shrink-0">
                  {record.type === 'Service History' && <History size={24} />}
                  {record.type === 'Uploaded Reports' && <FileText size={24} />}
                  {record.type === 'Fault Records' && <AlertCircle size={24} />}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-slate-900">{record.machine}</h4>
                  <p className="text-sm text-slate-500">{record.service}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 md:justify-items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert</p>
                  <p className="text-sm font-medium text-slate-700">{record.expert}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                  <p className="text-sm font-medium text-slate-700">{record.date}</p>
                </div>
                <div className="space-y-1 hidden md:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <Badge className={cn(
                    "mt-1",
                    record.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    {record.status}
                  </Badge>
                </div>
              </div>

              <button 
                onClick={() => onDownloadReport?.(record)}
                aria-label={`View details for ${record.machine}`}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-[#2563EB] transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No records found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">We couldn't find any records matching your current search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
