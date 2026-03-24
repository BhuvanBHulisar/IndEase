import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Activity, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  AlertCircle,
  HardDrive,
  Trash2,
  ChevronRight
} from 'lucide-react';
import PageHeader from './PageHeader';
import { Button, Card, Badge } from './ui/base';

const MachineDetailView = ({ machine, onBack, onReportFault, onDecommission }) => {
  if (!machine) return null;

  const history = [
    { date: 'Oct 12, 2024', expert: 'Alex Rivera', task: 'Pressure Valve Maintenance', status: 'Completed' },
    { date: 'Sep 05, 2024', expert: 'Sarah Chen', task: 'Calibration Sync', status: 'Completed' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-[32px] pb-24"
    >
      {/* Header Segment */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Node Inspector</span>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{machine.name}</h2>
        </div>
      </div>

      {/* TOP: Machine Health Card */}
      <Card className="p-6 relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            <div className="w-40 h-40 rounded-full border-[8px] border-slate-50 flex items-center justify-center">
              <span className="text-4xl font-semibold text-slate-900 tracking-tight">{machine.condition_score}<sub className="text-sm text-slate-400 align-super">%</sub></span>
            </div>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="80" cy="80" r="76" 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="8" 
                strokeDasharray={477} 
                strokeDashoffset={477 * (1 - machine.condition_score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] rounded-lg border border-blue-100 text-[10px] font-semibold uppercase tracking-widest">Health Metric</span>
                {machine.condition_score > 80 && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-semibold uppercase tracking-widest">Optimal</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Machine Continuity Sync</h3>
              <p className="text-slate-500 font-normal text-sm leading-relaxed mt-2 max-w-2xl">
                Current spectral analysis indicates the {machine.machine_type} is operating within nominal safety parameters. No structural variance detected in the current telemetry cycle.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={onReportFault}
                className="h-10 px-6 rounded-[10px] bg-[#2563EB] text-white font-medium text-sm shadow-sm hover:bg-blue-700 transition-all"
              >
                Report Structural Fault
              </button>
              <button 
                onClick={onDecommission}
                className="w-10 h-10 rounded-[10px] bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* MIDDLE: History & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service & Registry History */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-[#2563EB]" />
              Service & Registry History
            </h3>
            <button className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {history.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-slate-400 group-hover:text-[#2563EB] transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{log.task}</h4>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{log.date} • {log.expert}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-semibold uppercase tracking-widest">
                  {log.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Technical Specifications */}
        <Card className="p-6 space-y-6">
           <h3 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
             <HardDrive size={20} className="text-[#2563EB]" />
             Technical Specifications
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
             {[
               { label: "Serial Node", value: `XN-${2020 + (machine.id || 0)}` },
               { label: "Category", value: machine.machine_type },
               { label: "OEM Source", value: machine.oem || 'Generic OEM' },
               { label: "Build Year", value: machine.model_year },
               { label: "Trust Score", value: "Verified // 100%" },
               { label: "Connectivity", value: "Active Mesh" }
             ].map((spec, i) => (
               <div key={i} className="flex flex-col gap-1 py-1">
                 <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{spec.label}</span>
                 <span className="text-sm font-semibold text-slate-900">{spec.value}</span>
               </div>
             ))}
           </div>
        </Card>
      </div>

      {/* BOTTOM: Obsolescence Risk */}
      <Card className="p-6 space-y-6">
         <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
             <AlertCircle size={20} className="text-amber-500" />
             Obsolescence Risk Analysis
           </h3>
           <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 border-emerald-100 bg-emerald-50">Low Risk</Badge>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           <div className="md:col-span-2 space-y-4">
             <div className="w-full h-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "25%" }}
                 transition={{ duration: 1, delay: 0.5 }}
                 className="h-full bg-[#2563EB] rounded-full" 
               />
             </div>
             <p className="text-sm font-normal text-slate-500 leading-relaxed">
               Part availability remains high within the legacy ecosystem. Predicted structural replacement lifecycle estimated at <strong className="text-slate-900 font-semibold">4.2 Years</strong>.
             </p>
           </div>
           <div className="flex justify-end">
             <button className="w-full md:w-auto h-10 px-6 rounded-[10px] border border-[#E5E7EB] text-slate-600 font-medium text-sm hover:bg-[#F9FAFB] transition-all">
               Run Full Diagnostic
             </button>
           </div>
         </div>
      </Card>
    </motion.div>
  );
};

export default MachineDetailView;
