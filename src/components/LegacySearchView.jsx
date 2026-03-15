import React, { useState } from 'react';
import { 
  Search, 
  History, 
  Database, 
  ArrowRight, 
  ShieldAlert,
  Archive,
  Cpu,
  Zap,
  Box,
  FileSearch,
  BookOpen,
  Settings2,
  Lock,
  Binary
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion } from 'framer-motion';

export default function LegacySearchView() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-20 space-y-16 max-w-6xl mx-auto animate-fade-in no-scrollbar">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
           <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-2xl transform scale-150 animate-pulse" />
           <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-xl relative z-10 transition-transform hover:scale-110">
              <Archive className="w-10 h-10 text-blue-600" strokeWidth={2.5} />
           </div>
        </div>
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">Data Archive</h2>
        <p className="text-slate-500 font-medium text-base max-w-xl mx-auto leading-relaxed">
           Deep-search through the origiNode historical vault. Query industrial telemetry logs and antique signals dating back to the legacy epoch.
        </p>
      </div>

      <div className="w-full bg-white border border-slate-200/60 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 focus-within:ring-8 focus-within:ring-blue-600/5 transition-all flex items-center gap-6 relative overflow-hidden group">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15] -z-10" />
        
        <div className="relative flex-1">
           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={24} strokeWidth={3} />
           </div>
           <input 
              placeholder="Query hex codes, Serial identifiers, or Signal patterns..."
              className="w-full pl-16 pr-6 h-14 rounded-2xl border-none bg-slate-50/50 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all outline-none"
              value={query}
              onChange={e => setQuery(e.target.value)}
           />
        </div>
        <button 
           onClick={handleSearch}
           className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-900 text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-black active:scale-95 disabled:opacity-50 flex items-center gap-3"
           disabled={isSearching}
        >
           {isSearching ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Binary size={14} strokeWidth={3} />}
           {isSearching ? "Synthesizing..." : "Execute Search"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
         {[
           { icon: Database, label: "Decommissioned Assets", desc: "Browse a detailed registry of legacy industrial nodes and hardware units no longer in rotation." },
           { icon: BookOpen, label: "Fault Pattern Logs", desc: "Historical records of anomalous signals and maintenance rituals documented across all core phases." },
           { icon: Settings2, label: "Antique Blueprints", desc: "Technical schematics and operational logic for antiquated PLC and I/O modules from earlier epochs." }
         ].map((item, i) => (
           <div
             key={i}
             className="p-10 rounded-[2rem] bg-white border border-slate-200/60 hover:bg-slate-50/50 hover:shadow-premium transition-all duration-500 group cursor-pointer relative overflow-hidden"
           >
              <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                 <item.icon className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-slate-900 mb-3 text-[14px] uppercase tracking-widest">{item.label}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">{item.desc}</p>
              
              <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                 <ArrowRight className="text-blue-600" size={20} />
              </div>
           </div>
         ))}
      </div>

      <div className="pt-24 flex flex-col items-center gap-6">
         <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <Lock size={20} />
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center max-w-sm leading-relaxed">
            All archived telemetry is secured by zero-trust architecture. Specialized clearance is required for raw data export.
         </p>
      </div>
    </div>
  );
}
