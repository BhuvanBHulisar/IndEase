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
   FileText
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
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
           <Badge className="bg-primary/5 text-primary rounded-xl px-4 py-2 font-black mb-4 flex items-center gap-2 w-fit">
             <ShieldCheck size={16} />
             VERIFIED INDUSTRIAL IDENTITY
           </Badge>
           <h2 className="text-5xl font-extrabold text-slate-900 tracking-tighter">Digital Dossier</h2>
           <p className="text-slate-500 mt-2 font-medium max-w-md">Your professional identity within the industrial node network is protected by high-level encryption.</p>
        </div>
        <div className="flex items-center gap-3">
           {!isEditing ? (
             <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-2xl h-14 px-8 border-2 font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-200/40">
                Update Records
             </Button>
           ) : (
             <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl h-14 px-6 font-bold text-slate-400 hover:bg-slate-100 transition-all">Cancel</Button>
                <Button onClick={handleSave} className="rounded-2xl h-14 px-10 font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                   <Save size={18} />
                   Commit Sync
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Identity Card */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-[3rem] p-10 bg-slate-50 border-slate-100 shadow-2xl shadow-slate-200/40 border-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors" />
               <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-10 group-photo">
                    <div className="w-44 h-44 rounded-[3.5rem] bg-white shadow-2xl shadow-slate-200/60 p-2 ring-1 ring-slate-100 overflow-hidden relative">
                       {userPhoto ? (
                         <img src={userPhoto} alt="Profile" className="w-full h-full object-cover rounded-[3rem]" />
                       ) : (
                         <div className="w-full h-full bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                           <User className="w-20 h-20" />
                         </div>
                       )}
                       <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-photo:hover:opacity-100 transition-all backdrop-blur-sm flex items-center justify-center">
                          <button onClick={() => fileInputRef.current.click()} className="p-4 bg-white rounded-2xl text-slate-900 shadow-xl active:scale-90 transition-all">
                             <Upload size={24} />
                          </button>
                       </div>
                    </div>
                    <button 
                      onClick={startCamera}
                      className="absolute -right-2 -bottom-2 w-16 h-16 bg-white border-4 border-slate-50 rounded-[1.5rem] shadow-xl flex items-center justify-center text-primary group:hover:scale-110 active:scale-75 transition-all z-20"
                    >
                       <Camera size={24} />
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
                  
                  <h3 className="text-3xl font-black text-slate-900 mb-2 truncate max-w-full tracking-tight">{formData.firstName} {formData.lastName}</h3>
                  <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 max-w-full">
                     <Mail size={14} className="text-slate-400 shrink-0" />
                     <span className="text-xs font-bold text-slate-500 truncate" title={user.email}>{user.email}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-200 mt-2">
                     <div className="p-4 bg-white rounded-2xl text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                        <p className="text-sm font-black text-accent uppercase tracking-widest">Active</p>
                     </div>
                     <div className="p-4 bg-white rounded-2xl text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Clearance</p>
                        <p className="text-sm font-black text-primary uppercase tracking-widest">Level 4</p>
                     </div>
                  </div>
               </div>
            </Card>
            
            <Card className="p-8 rounded-[2.5rem] bg-red-50/30 border-2 border-dashed border-red-100/50 group hover:bg-red-50/50 transition-colors">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 group-hover:scale-110 transition-transform">
                     <Trash2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-red-600 uppercase tracking-widest">Wipe Dossier</h4>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Permanent account decommissioning.</p>
                  </div>
               </div>
               <Button onClick={onDeleteAccount} variant="outline" className="w-full rounded-2xl font-black text-xs uppercase tracking-widest py-6 h-14 border-2 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-400 transition-all">
                  Decommission Node Identity
               </Button>
            </Card>
         </div>

         {/* Form Details */}
         <div className="lg:col-span-2">
            <Card className="rounded-[3rem] p-12 bg-white shadow-2xl shadow-slate-200/40 relative overflow-hidden h-full flex flex-col">
               <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-50 border rounded-2xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                        <IdentificationIcon size={24} />
                     </div>
                     Authentication Information
                  </h3>
               </div>
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Given Name</label>
                     <Input 
                       disabled={!isEditing} 
                       value={formData.firstName} 
                       onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                       className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 disabled:border-transparent transition-all transition-colors"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Family Name</label>
                     <Input 
                       disabled={!isEditing} 
                       value={formData.lastName} 
                       onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                       className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 disabled:border-transparent transition-all transition-colors"
                     />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Building size={14} className="text-slate-400" />
                       Associated Industrial Organization
                     </label>
                     <Input 
                       disabled={!isEditing} 
                       value={formData.organization} 
                       onChange={e => setFormData({ ...formData, organization: e.target.value })} 
                       placeholder="Enter node cluster or corp name..."
                       className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 disabled:border-transparent transition-all transition-colors"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        Encrypted Line
                     </label>
                     <Input 
                       disabled={!isEditing} 
                       value={formData.phone} 
                       onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                       className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 disabled:border-transparent transition-all transition-colors"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        Industrial Tax ID
                     </label>
                     <Input 
                       disabled={!isEditing} 
                       value={formData.taxId} 
                       onChange={e => setFormData({ ...formData, taxId: e.target.value })} 
                       className="h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-primary disabled:bg-slate-200/20 disabled:border-transparent transition-all transition-colors"
                     />
                  </div>
               </div>

               <div className="mt-12 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent shadow-sm">
                        <ShieldCheck size={20} />
                     </div>
                     <p className="text-xs font-bold text-slate-500 tracking-tight leading-relaxed">
                        Data Integrity Module Active.<br/>
                        Signals encrypted with SHA-512 protocol.
                     </p>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Updated: 2h ago</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
  
function IdentificationIcon({ size, ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h10" />
        </svg>
    )
}
