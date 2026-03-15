import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CheckCircle, 
  Star, 
  Zap, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ExternalLink,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Cpu,
  Activity,
  User,
  CheckCircle2,
  Radar,
  Terminal,
  Award
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Badge,
  Input,
  cn
} from '../components/ui/base';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProducerDashboard({ 
  stats, 
  radarJobs, 
  user,
  onAcceptJob,
  onViewDetails
}) {
  const [filter, setFilter] = useState('All');

  const filteredJobs = (radarJobs || []).filter(job => {
    if (filter === 'All') return true;
    if (filter === 'Critical') return job.priority === 'critical';
    if (filter === 'Standard') return job.priority !== 'critical';
    return true;
  });

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto animate-fade-in">
      {/* Premium Header Segment */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} strokeWidth={3} />
                Verified Specialist
              </Badge>
              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                 <Star className="fill-amber-500 text-amber-500" size={12} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{stats.rating.toFixed(1)} Rating</span>
              </div>
           </div>
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Expert Dashboard</h2>
           <p className="text-slate-500 font-medium max-w-2xl leading-relaxed flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Radar terminal online. Monitoring industrial network for authorized service signals.
           </p>
        </div>
        
        <div className="flex items-center gap-6 p-6 bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm">
           <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lifetime Yield</span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{stats.earnings.toLocaleString()}</span>
           </div>
           <div className="w-px h-10 bg-slate-100 mx-2" />
           <Button className="h-12 px-6 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
              Performance Terminal
              <TrendingUp size={14} className="ml-2.5" strokeWidth={3} />
           </Button>
        </div>
      </div>

      {/* Analytics & Broadcast Segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <StatsCard 
            label="Verified Revenue" 
            value={`₹${stats.earnings.toLocaleString()}`} 
            icon={Award} 
            color="#2563eb" 
            trend="+₹12,400"
         />
         <StatsCard 
            label="Resolved Nodes" 
            value={stats.completedJobs} 
            icon={CheckCircle2} 
            color="#10b981" 
            trend="98% Effectiveness"
         />
         
         <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl group border border-slate-800">
            {/* Pulsing Decorative Element */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all scale-[2] rotate-12 -translate-y-8 translate-x-8">
               <Radar size={160} strokeWidth={1} className="animate-pulse" />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <div className="flex items-center gap-2 mb-4 opacity-70">
                     <Terminal size={14} />
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Global Comms Feed</h4>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight max-w-sm mb-4">
                     Analyzing industrial signals across active sectors.
                  </h3>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xs">
                     Submit technical proposals to industrial nodes within your authorized service radius.
                  </p>
               </div>
               <div className="flex items-center gap-6 mt-10">
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active High-Demand Area</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Scan Range: 50.0km</span>
               </div>
            </div>
         </div>
      </div>

      {/* Radar Board Interface */}
      <div className="space-y-8 pt-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Radar Board</h3>
               {(radarJobs || []).length > 0 && (
                  <div className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm animate-fade-in flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    {radarJobs.length} New Broadcasts Accessibile
                  </div>
               )}
            </div>
            
            <div className="flex items-center p-1.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-sm">
               {['All', 'Critical', 'Standard'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      filter === t 
                        ? "bg-white text-blue-600 shadow-premium border border-slate-100" 
                        : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {t}
                  </button>
               ))}
            </div>
         </div>

         {/* Broadcast Interaction Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <AnimatePresence mode="popLayout">
               {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    index={i} 
                    onAccept={() => onAcceptJob(job)}
                  />
               )) : (
                  <div className="col-span-full py-48 bg-white border border-slate-200/60 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 hover:shadow-premium transition-all duration-500 group overflow-hidden relative">
                     {/* Concentric Signal Rings Decoration */}
                     <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-5">
                         <div className="w-[300px] h-[300px] border border-blue-600 rounded-full animate-ping" />
                         <div className="w-[200px] h-[200px] border border-blue-600 rounded-full absolute" />
                     </div>
                     
                     <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <Radar className="text-slate-300" size={40} strokeWidth={1.5} />
                     </div>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-3">All Sectors Optimized</h4>
                     <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                        No active service broadcasts detected in your immediate vicinity. Standing by for telemetry anomalies.
                     </p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, trend }) {
   return (
      <div className="p-10 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-premium group transition-all duration-500 cursor-pointer overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-blue-50/50 transition-all duration-500" />
         
         <div 
           className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-6 relative z-10"
           style={{ backgroundColor: `${color}10`, color: color }}
         >
            <Icon size={26} strokeWidth={2.5} />
         </div>
         
         <div className="space-y-2 relative z-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{label}</h4>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</h3>
            <div className="flex items-center gap-2 mt-6">
               <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  {trend}
               </div>
            </div>
         </div>
      </div>
   );
}

function JobCard({ job, index, onAccept }) {
  const distHash = String(job.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dist = 5 + (distHash % 45);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "backOut" }}
    >
      <div className={cn(
        "rounded-[2rem] p-10 bg-white border border-slate-200/60 shadow-xl shadow-slate-200/20 hover:shadow-premium transition-all duration-500 group relative overflow-hidden",
        job.priority === 'critical' && 'border-red-100/50 hover:border-red-500/10'
      )}>
         {/* Background Subtle Accent */}
         <div className={cn(
            "absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full transition-colors duration-700",
            job.priority === 'critical' ? 'bg-red-50/50 group-hover:bg-red-100/50' : 'bg-slate-50 group-hover:bg-blue-50/50'
         )} />

         <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  {job.client_name?.[0] || job.other_party?.[0] || "C"}
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase">Sector REF-{String(job.id).substring(0,6).toUpperCase()}</span>
                     <div className="w-1 h-1 rounded-full bg-slate-200" />
                     {job.priority === 'critical' && <span className="text-[9px] font-black text-red-600 uppercase tracking-widest border border-red-100 px-2 py-0.5 bg-red-50 rounded-lg">High Alert</span>}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{job.machine_name || 'Industrial Node'}</h3>
               </div>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-blue-600/10 transition-all flex flex-col items-end">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contract Value</p>
               <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-blue-700 transition-colors">₹{5000 + (distHash % 15000)}</span>
            </div>
         </div>

         <div className="space-y-8 mb-12 relative z-10">
            <div className="p-8 bg-slate-50/80 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-all text-[15px] font-medium leading-relaxed shadow-inset">
               <p className="text-slate-600 italic">"{job.issue_description || 'Formal diagnostic telemetry pending secure handshake.'}"</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:border-blue-100 transition-colors">
                  <MapPin className="text-blue-600" size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{dist}km Range</span>
               </div>
               <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:border-blue-100 transition-colors">
                  <Clock className="text-slate-400" size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Received {job.created_at ? new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '3m ago'}</span>
               </div>
               <div className="w-px h-6 bg-slate-100 mx-1" />
               <Badge className="bg-slate-100 text-slate-500 border border-slate-200 rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                  Standard Relay
               </Badge>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6 relative z-10 pt-8 border-t border-slate-100">
            <button className="h-14 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100 transition-all flex items-center justify-center">
               View Telemetry
            </button>
            <button onClick={onAccept} className="h-14 rounded-xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-black transition-all flex items-center justify-center gap-3">
               Connect Service
               <ChevronRight size={14} strokeWidth={3} />
            </button>
         </div>
      </div>
    </motion.div>
  );
}
