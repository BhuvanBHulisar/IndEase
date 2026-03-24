import React, { useState } from 'react';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  MessagesSquare, 
  FileQuestion, 
  ShieldAlert,
  Zap,
  CheckCircle,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Activity,
  Lock,
  Eye,
  Trash2,
  LifeBuoy
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion } from 'framer-motion';

export function SupportView({ onSubmitTicket }) {
  const [ticket, setTicket] = useState({ subject: 'General Support', description: '' });

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto animate-fade-in no-scrollbar">
      {/* Header Segment */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                 <LifeBuoy size={12} strokeWidth={3} />
                 Resource Center
              </Badge>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Assistance</span>
           </div>
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Support Terminal</h2>
           <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
              Direct access to our industrial engineering team. Submit technical dispatches or query our verified expert network for immediate resolution.
           </p>
        </div>
        
        <div className="h-12 px-6 flex items-center bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-black text-[10px] uppercase tracking-[0.15em] gap-3 shadow-sm">
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           Network Pulse: Nominal
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Dispatch Form Component */}
         <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Terminal size={20} className="text-blue-600" strokeWidth={2.5} />
                  Service Dispatch
               </h3>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Case ID: Auto-Generated</span>
            </div>
            
            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Context</label>
                  <div className="relative">
                     <select 
                       value={ticket.subject}
                       onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                       className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50/50 px-6 font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none"
                     >
                       {["General Support", "Machine Diagnosis Issue", "Expert Consultation", "Billing Inquiry", "Other"].map(s => (
                          <option key={s} value={s}>{s}</option>
                       ))}
                     </select>
                     <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>
               
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anomaly Narrative</label>
                  <textarea 
                    placeholder="Provide a comprehensive description of the operational issue..."
                    value={ticket.description}
                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                    className="w-full h-56 rounded-[1.5rem] border border-slate-200 bg-slate-50/50 p-8 font-medium text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all resize-none placeholder:text-slate-400"
                  />
               </div>
               
               <button onClick={onSubmitTicket} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 group">
                  Transmit Dispatch
                  <Send size={14} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
            </div>
         </div>

         {/* Secondary Support Channels */}
         <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm space-y-10 relative overflow-hidden group">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Direct Uplinks</h3>
               <div className="space-y-8">
                  <ContactItem icon={Phone} label="Crisis Hotline" value="+91 1800-ORIGI-HELP" />
                  <ContactItem icon={Mail} label="Comms Feed" value="support@originode.com" />
                  <ContactItem icon={MessagesSquare} label="Live Intercom" value="Authorized Channels Only" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="p-8 rounded-[1.5rem] bg-white border border-slate-200/60 hover:shadow-premium group transition-all duration-500 cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 -mr-8 -mt-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-white group-hover:scale-110 shadow-sm transition-all mb-6">
                     <Zap size={20} strokeWidth={2.5} />
                  </div>
                  <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1">Vault</h5>
                  <p className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 underline underline-offset-4 uppercase tracking-[0.2em] transition-colors">Read Specs</p>
               </div>
               <div className="p-8 rounded-[1.5rem] bg-white border border-slate-200/60 hover:shadow-premium group transition-all duration-500 cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 -mr-8 -mt-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-white group-hover:scale-110 shadow-sm transition-all mb-6">
                     <CheckCircle size={20} strokeWidth={2.5} />
                  </div>
                  <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1">Pulse</h5>
                  <p className="text-[9px] font-black text-slate-400 group-hover:text-emerald-600 underline underline-offset-4 uppercase tracking-[0.2em] transition-colors">Grid Status</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-6 group cursor-pointer">
       <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:scale-110 transition-all shadow-sm">
          <Icon size={20} strokeWidth={2.5} />
       </div>
       <div className="flex-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-500 transition-colors">{label}</p>
          <p className="text-[14px] font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{value}</p>
       </div>
       <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight size={18} strokeWidth={3} />
       </div>
    </div>
  );
}

// SettingsView removed per user request
