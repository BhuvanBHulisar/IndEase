import React, { useState, useRef } from 'react';
import { 
   User, 
   Camera, 
   Upload, 
   ShieldCheck, 
   AlertCircle, 
   Save, 
   Trash2,
   Building,
   Mail,
   Phone,
   FileText,
   CheckCircle2,
   Fingerprint,
   Globe,
   ShieldAlert
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion } from 'framer-motion';

export default function ProfileView({ 
  user, 
  userPhoto, 
  handlePhotoUpload, 
  startCamera, 
  onSaveProfile,
  onDeleteAccount
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    organization: user.extraInfo || '',
    phone: user.phone || '',
    taxId: user.taxId || ''
  });

  const fileInputRef = useRef(null);

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto animate-fade-in">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                 <ShieldCheck size={12} strokeWidth={3} />
                 Identity Verified
              </Badge>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Profile</span>
           </div>
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Account Center</h2>
           <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
              Administrative control for your professional identity, organization credentials, and secure network synchronization.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           {!isEditing ? (
             <Button onClick={() => setIsEditing(true)} className="h-12 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">
                Modify Profile
             </Button>
           ) : (
             <div className="flex gap-3">
                <Button onClick={() => setIsEditing(false)} variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">Discard</Button>
                <Button onClick={handleSave} className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10">
                   Execute Update
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Bio & Identity Terminal */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
               {/* Decorative Background */}
               <div className="absolute top-0 inset-x-0 h-32 bg-slate-50 group-hover:h-36 transition-all duration-500" />
               
               <div className="relative mb-8 mt-4 z-10">
                  <div className="w-40 h-40 rounded-[2rem] bg-white border-4 border-white shadow-2xl overflow-hidden relative group/photo">
                     {userPhoto ? (
                       <img src={userPhoto} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-100 text-blue-600">
                         <User size={64} strokeWidth={1.5} />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover/photo:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => fileInputRef.current.click()}>
                        <div className="flex flex-col items-center gap-2">
                           <Upload size={24} className="text-white" strokeWidth={2.5} />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={startCamera}
                    className="absolute -right-2 -bottom-2 w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:scale-105 transition-all z-10"
                  >
                     <Camera size={20} strokeWidth={2.5} />
                  </button>
               </div>
               
               <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
               
               <div className="relative z-10 space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formData.firstName || user.firstName} {formData.lastName || user.lastName}</h3>
                  <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                     <Globe size={12} className="text-blue-600" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role || 'Enterprise Operator'}</span>
                  </div>
               </div>

               <div className="w-full mt-10 pt-10 border-t border-slate-100 relative z-10 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-blue-50/30 transition-colors border border-transparent hover:border-blue-100 group/link cursor-pointer">
                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover/link:shadow-md transition-all">
                        <Mail size={16} strokeWidth={2.5} />
                     </div>
                     <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Work Email</span>
                        <span className="text-xs font-bold text-slate-700 truncate">{user.email}</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-red-50/30 border border-red-100 rounded-[2rem] p-10 flex flex-col gap-6 relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                   <ShieldAlert size={14} strokeWidth={2.5} />
                   Danger Protocol
                 </h4>
                 <p className="text-xs font-medium text-red-900/60 leading-relaxed">Permanently terminate your administrative credentials and purge all associated node telemetry.</p>
               </div>
               <button onClick={onDeleteAccount} className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-xl hover:shadow-red-500/20 transition-all relative z-10">
                  Purge Account
               </button>
            </div>
         </div>

         {/* Configuration Terminal */}
         <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-12 shadow-sm space-y-12">
               <div className="space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Fingerprint size={28} className="text-blue-600" strokeWidth={2} />
                        Identity Attributes
                     </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal First Name</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.firstName} 
                          onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                          className="w-full h-14 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Last Name</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.lastName} 
                          onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                          className="w-full h-14 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                        />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization / Commercial Entity</label>
                        <div className="relative">
                           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                             <Building size={18} strokeWidth={2.5} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.organization} 
                             onChange={e => setFormData({ ...formData, organization: e.target.value })} 
                             className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-16 pr-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                           />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Contact Line</label>
                        <div className="relative">
                           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                             <Phone size={18} strokeWidth={2.5} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.phone} 
                             onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                             className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-16 pr-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                           />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compliance Tax Identifier</label>
                        <div className="relative">
                           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                             <FileText size={18} strokeWidth={2.5} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.taxId} 
                             onChange={e => setFormData({ ...formData, taxId: e.target.value })} 
                             className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-16 pr-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-slate-100 flex items-center gap-6 text-emerald-600 bg-emerald-50/30 p-8 rounded-2xl border border-emerald-100/50">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                     <CheckCircle2 size={28} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                     <h5 className="text-sm font-black uppercase tracking-widest">Network Synchronized</h5>
                     <p className="text-xs font-bold leading-relaxed text-emerald-900/60 transition-colors">
                        All identity modifications are encrypted and propagated through the origiNode distributed ledger for zero-trust verification.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
