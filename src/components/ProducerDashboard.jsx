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
  Cpu
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
    <div className="space-y-10 pb-20">
      {/* Expert Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div>
           <Badge className="bg-primary/5 text-primary rounded-xl px-4 py-2 font-black mb-4 flex items-center gap-2 w-fit">
             <ShieldCheck size={16} />
             CERTIFIED EXPERT NODE
           </Badge>
           <h2 className="text-5xl font-extrabold text-slate-900 tracking-tighter">Command Center</h2>
           <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
             <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
             Broadcasting availability to local mesh.
           </p>
        </div>
        
        <div className="p-4 bg-slate-900 rounded-[2rem] border-slate-800 shadow-2xl shadow-slate-900/40 border flex items-center gap-8 px-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Network Rank</span>
              <div className="flex items-center gap-1.5 text-white font-black text-xs leading-none">
                 <Star className="text-amber-400 fill-amber-400" size={12} />
                 {stats.rating.toFixed(1)}
              </div>
           </div>
           <div className="w-px h-10 bg-white/10" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Total Yield</span>
              <span className="text-white font-black text-lg leading-none">₹{stats.earnings.toLocaleString()}</span>
           </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="p-8 rounded-[2.5rem] bg-slate-50 border-none shadow-sm hover:translate-y-[-4px] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-colors">
               <TrendingUp size={80} className="text-primary" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Live Earnings</p>
            <h3 className="text-4xl font-extrabold text-slate-900 relative z-10 leading-none">₹{stats.earnings.toLocaleString()}</h3>
            <p className="text-[10px] font-bold text-accent mt-4 flex items-center gap-1 relative z-10">+₹12,400 this period</p>
         </Card>
         
         <Card className="p-8 rounded-[2.5rem] bg-slate-50 border-none shadow-sm hover:translate-y-[-4px] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-colors">
               <CheckCircle size={80} className="text-accent" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Jobs Completed</p>
            <h3 className="text-4xl font-extrabold text-slate-900 relative z-10 leading-none">{stats.completedJobs}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-4 relative z-10 uppercase tracking-widest">98% Satisfaction rating</p>
         </Card>

         <Card className="lg:col-span-2 rounded-[2.5rem] p-4 bg-primary text-white shadow-2xl shadow-primary/30 flex overflow-hidden group relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all scale-150 rotate-12 translate-x-12 -translate-y-12">
               <Zap size={150} className="text-white fill-white" />
            </div>
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-between">
               <div>
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Signal Broadcast Active</h4>
                  <h3 className="text-2xl font-black tracking-tight leading-snug">Accept and restore industrial nodes to maximize network yield.</h3>
               </div>
               <div className="flex items-center gap-3 pt-6">
                  <Badge className="bg-white/20 text-white rounded-lg px-3 py-1.5 border-none font-bold text-[10px]">OPERATIONAL: HIGH VOLUME</Badge>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Scan radius: 50km</p>
               </div>
            </div>
            <div className="w-40 shrink-0 bg-white/5 backdrop-blur-md hidden sm:flex items-center justify-center border-l border-white/10 group-hover:bg-white/10 transition-all">
               <ArrowUpRight size={48} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
         </Card>
      </div>

      {/* Main Board */}
      <div className="space-y-8 pt-6">
         <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               Radar Board
               {(radarJobs || []).length > 0 && (
                  <Badge className="bg-red-500 text-white border-none rounded-xl px-2 py-0.5 text-[10px] font-black">{radarJobs.length} NEW JUNCTION</Badge>
               )}
            </h3>
            
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               {['All', 'Critical', 'Standard'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      filter === t ? "bg-white text-primary shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {t}
                  </button>
               ))}
            </div>
         </div>

         {/* Jobs Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
               {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    index={i} 
                    onAccept={() => onAcceptJob(job)}
                  />
               )) : (
                  <div className="col-span-full py-40 border-4 border-dashed border-slate-50 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 group hover:bg-slate-50 transition-all">
                     <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Cpu className="w-12 h-12 text-slate-200" />
                     </div>
                     <h4 className="text-2xl font-black text-slate-900 mb-2">Silence on the Mesh</h4>
                     <p className="text-slate-400 font-bold max-w-xs leading-relaxed italic">The current sector is operational. All industrial signals are stable.</p>
                  </div>
               )}
            </AnimatePresence>
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className={cn(
        "rounded-[3rem] p-10 bg-white border-none shadow-2xl shadow-slate-100 hover:shadow-primary/10 transition-all group border-2 relative overflow-hidden",
        job.priority === 'critical' ? 'hover:border-red-100 border-transparent bg-red-50/5' : 'hover:border-primary/20 border-transparent'
      )}>
         <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-sm">
                  <div className="w-full h-full rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary">
                    {job.client_name?.[0] || "C"}
                  </div>
               </div>
               <div>
                  <h4 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">Signal Protocol #{String(job.id).substring(0,8).toUpperCase()}</h4>
                  <h3 className="text-2xl font-black text-slate-900">{job.machine_name || 'Industrial Node'}</h3>
               </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-primary/5 transition-colors">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Job Yield</p>
               <span className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">₹{5000 + (distHash % 15000)}</span>
            </div>
         </div>

         <div className="space-y-6 mb-12 relative z-10">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors min-h-[100px] flex items-center">
               <p className="text-slate-600 font-bold leading-relaxed italic">"{job.issue_description || 'No anomaly description provided.'}"</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <Badge variant={job.priority === 'critical' ? 'destructive' : 'secondary'} className="rounded-xl px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                  {job.priority?.toUpperCase() || 'STANDARD'}
               </Badge>
               <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  <MapPin className="text-primary" size={12} />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{dist}km away</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  <Clock className="text-slate-400" size={12} />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{job.created_at ? new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '3m ago'}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 relative z-10 pt-4 border-t border-slate-50 mt-4">
            <Button variant="outline" className="h-16 rounded-[1.5rem] border-2 border-slate-100 font-black text-xs uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all group-hover:bg-slate-50">
               Telemetry Detail
            </Button>
            <Button onClick={onAccept} className="h-16 rounded-[1.5rem] bg-slate-900 text-white font-xl font-black uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:bg-primary hover:shadow-primary/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-3">
               Restore Connection
               <ChevronRight size={20} />
            </Button>
         </div>
         
         {job.priority === 'critical' && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
         )}
      </Card>
    </motion.div>
  );
}
