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
  Send
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
  const [ticket, setTicket] = useState({ subject: 'Machine Diagnosis Error', description: '' });

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Signal Interference?</h2>
          <p className="text-slate-500 mt-2 font-medium">Broadcast a support ticket directly to our technical node fleet.</p>
        </div>
        <div className="h-12 px-6 flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200">
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Technician Latency: 4ms</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <Card className="rounded-[3rem] p-12 bg-white shadow-2xl shadow-slate-200/40 border-slate-100 space-y-10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 transform rotate-12 translate-x-12 translate-y-12 opacity-5 scale-150">
               <FileQuestion size={100} className="text-primary" />
            </div>
            
            <div className="relative z-10 space-y-8">
               <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject Frequency</label>
                  <select 
                    value={ticket.subject}
                    onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                    className="w-full h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {["Machine Diagnosis Error", "Expert Connection Issue", "Billing / Invoice Dispute", "Account Verification", "Other"].map(s => (
                       <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
               </div>
               
               <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Anomaly Log (Detailed Description)</label>
                  <textarea 
                    placeholder="Describe the technical friction you are experiencing..."
                    value={ticket.description}
                    onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                    className="w-full h-64 rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 p-8 font-bold focus:border-primary outline-none transition-all resize-none shadow-sm"
                  />
               </div>
               
               <Button onClick={onSubmitTicket} className="w-full h-16 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group/btn">
                  Initialize Transmission
                  <Send size={20} className="ml-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
               </Button>
            </div>
         </Card>

         <div className="space-y-6">
            <Card className="rounded-[2.5rem] p-10 bg-slate-900 border-none relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all" />
               <div className="relative z-10">
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Urgent Restoration</h4>
                  <h3 className="text-3xl font-black text-white mb-6">Direct Encrypted Line</h3>
                  <div className="space-y-6">
                     <ContactItem icon={Phone} label="Emergency Voice" value="+91 1800-ORIGI-HELP" />
                     <ContactItem icon={Mail} label="Secure Transmission" value="support@originode.com" />
                     <ContactItem icon={MessagesSquare} label="Mesh Chat" value="Live Terminal Access" />
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
               <Card className="p-8 rounded-[2rem] bg-slate-50 border-slate-100 hover:bg-white transition-all group border-none">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-6">
                     <Zap size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-1">Knowledge Base</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter transition-colors group-hover:text-primary underline cursor-pointer">Explore Schematics</p>
               </Card>
               <Card className="p-8 rounded-[2rem] bg-slate-50 border-slate-100 hover:bg-white transition-all group border-none">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-6">
                     <CheckCircle size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-1">Status Board</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter transition-colors group-hover:text-accent underline cursor-pointer">Check System Health</p>
               </Card>
            </div>

            <Card className="rounded-[2rem] h-full flex flex-col justify-center border-slate-100 p-10 bg-slate-50/50 border-2 border-dashed">
               <div className="flex items-center gap-6">
                  <Clock className="w-10 h-10 text-slate-200" />
                  <div>
                    <h5 className="text-sm font-black text-slate-900 tracking-tighter uppercase mb-1">Technician Queueing</h5>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Estimated broadcast restoration latency: 15-20 minutes depending on node availability.</p>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-5 group/item">
       <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/10 group-hover/item:bg-white/10 transition-colors">
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-white leading-none mt-1">{value}</p>
       </div>
       <ArrowUpRight className="ml-auto text-white/20 group-hover/item:text-white/100 transition-colors" size={24} />
    </div>
  );
}

export function SettingsView({ 
  is2FA, set2FA, 
  visibility, setVisibility, 
  onDeleteAccount 
}) {
  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
       <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Security Terminal</h2>
          <p className="text-slate-500 font-medium">Configure high-level node protocols and industrial visibility.</p>
       </div>

       <div className="space-y-8">
          <SettingsSection 
            title="Biometric & Factor Authentication"
            desc="Require dual-layered token verification for sensitive industrial signals."
          >
            <div className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all">
               <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">2-Factor Biological Protocol</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Enforce identity sync on every session</p>
               </div>
               <Switch enabled={is2FA} onChange={set2FA} />
            </div>
          </SettingsSection>

          <SettingsSection 
            title="Mesh Network Visibility"
            desc="Control how your industrial node is broadcasted across the expert board."
          >
             <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                {["Public Network", "Private Mesh", "Encrypted Tunnel"].map((mode, i) => (
                   <button 
                     key={mode}
                     onClick={() => setVisibility(mode)}
                     className={cn(
                       "w-full flex items-center justify-between p-8 border-b last:border-0 border-slate-50 transition-all group text-left",
                       visibility === mode ? "bg-slate-50" : "hover:bg-slate-50/50"
                     )}
                   >
                     <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all",
                          visibility === mode ? "border-primary bg-primary" : "border-slate-200"
                        )}>
                          {visibility === mode && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <h4 className={cn("font-bold text-lg mb-0.5", visibility === mode ? "text-slate-900" : "text-slate-500")}>{mode}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Protocol Type: {mode === 'Public Network' ? '0x01' : '0x09'}</p>
                        </div>
                     </div>
                     <p className="text-xs font-bold text-slate-300 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Optimize Signal</p>
                   </button>
                ))}
             </div>
          </SettingsSection>

          <SettingsSection 
            title="Account Integrity"
            desc="Permanent management of your industrial presence."
          >
             <Card className="rounded-[2.5rem] p-8 border-red-100/50 bg-red-50/20 shadow-none border-2 border-dashed flex items-center justify-between gap-6 group hover:bg-red-50/50 transition-colors">
                <div className="flex items-center gap-6 flex-1">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 shrink-0 group-hover:rotate-12 transition-transform">
                      <ShieldAlert size={28} />
                   </div>
                   <div>
                      <h4 className="font-black text-red-600 uppercase tracking-widest text-sm mb-1">Decommission System Identity</h4>
                      <p className="text-xs font-bold text-slate-400">Warning: This action initiates a full industrial ledger purge. This process is irreversible.</p>
                   </div>
                </div>
                <Button onClick={onDeleteAccount} variant="outline" className="rounded-2xl h-14 px-8 border-2 border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 font-black text-xs uppercase transition-all whitespace-nowrap">
                   Deactivate Node
                </Button>
             </Card>
          </SettingsSection>
       </div>
    </div>
  );
}

function SettingsSection({ title, desc, children }) {
   return (
      <div className="space-y-6">
         <div>
            <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium">{desc}</p>
         </div>
         {children}
      </div>
   );
}

function Switch({ enabled, onChange }) {
   return (
      <button 
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-14 h-8 rounded-full transition-all relative ring-4 ring-transparent flex items-center p-1 cursor-pointer",
          enabled ? "bg-primary" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "h-6 w-6 bg-white rounded-full shadow-lg transition-all transform",
          enabled ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
   );
}
