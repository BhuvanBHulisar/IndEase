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
  Box
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
    <div className="flex flex-col items-center justify-center pt-20 pb-12 space-y-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-20 h-20 bg-slate-900 border-4 border-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-slate-900/40"
        >
          <Archive className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Legacy Archive Search</h2>
        <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">Access historical industrial telemetry dating back to the legacy network transition (circa 2021).</p>
      </div>

      <Card className="w-full rounded-[3rem] p-4 bg-white border-2 border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] group focus-within:border-primary transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
           <Zap className="w-40 h-40 -rotate-12 translate-x-12 -translate-y-12 text-primary" />
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex items-center gap-4 relative z-10"
        >
          <div className="relative flex-1">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
             <Input 
                placeholder="Query machine serials, antiquated part IDs or technician codes..."
                className="pl-16 h-20 rounded-[2rem] border-none text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0"
                value={query}
                onChange={e => setQuery(e.target.value)}
             />
          </div>
          <Button 
             className="h-16 px-10 rounded-3xl font-black bg-primary text-md shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group/btn"
             disabled={isSearching}
          >
             {isSearching ? "Decrypting Signal..." : "Execute Query"}
             {!isSearching && <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
         {[
           { icon: Database, label: "Asset Ledger", desc: "Full registry of retired industrial nodes." },
           { icon: History, label: "Incident History", desc: "Historical fault signals and repair protocols." },
           { icon: Cpu, label: "Legacy Logic", desc: "Technical schematics for antiquated PLC modules." }
         ].map((item, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 + i * 0.1 }}
           >
             <Card className="p-8 rounded-[2rem] bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group h-full">
                <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ring-1 ring-slate-100">
                   <item.icon className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">{item.label}</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
             </Card>
           </motion.div>
         ))}
      </div>

      <div className="pt-20 opacity-30 group flex flex-col items-center gap-4 hover:opacity-100 transition-opacity">
         <ShieldAlert className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Caution: Accessing legacy signals may trigger integrity warnings.<br/>Proceed with high-level clearance only. </p>
      </div>
    </div>
  );
}
