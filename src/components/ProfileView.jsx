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
    taxId: user.taxId || '',
    bankAccountNumber: user.bankAccountNumber || '',
    ifscCode: user.ifscCode || '',
    accountHolderName: user.accountHolderName || ''
  });

  const fileInputRef = useRef(null);

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto animate-fade-in pt-4">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
           <p className="text-sm font-medium text-slate-500 max-w-2xl">
              Manage your personal information, company details, and account settings.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           {!isEditing ? (
             <Button onClick={() => setIsEditing(true)} className="h-10 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold text-sm shadow-sm">
                Edit Profile
             </Button>
           ) : (
             <div className="flex gap-3">
                <Button onClick={() => setIsEditing(false)} variant="outline" className="h-10 px-4 rounded-lg border-[#E5E7EB] text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancel</Button>
                <Button onClick={handleSave} className="h-10 px-6 rounded-lg bg-slate-900 text-white hover:bg-black font-semibold text-sm shadow-sm">
                   Save Changes
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Bio & Identity Terminal */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
               {/* Decorative Background */}
               <div className="absolute top-0 inset-x-0 h-28 bg-[#F8FAFC] transition-all duration-500" />
               
               <div className="relative mb-6 mt-4 z-10 w-full flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md overflow-hidden relative group/photo">
                     {userPhoto ? (
                       <img src={userPhoto} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-105" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-100 text-blue-600">
                         <User size={48} strokeWidth={1.5} />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover/photo:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => fileInputRef.current.click()}>
                        <div className="flex flex-col items-center gap-1.5">
                           <Upload size={20} className="text-white" strokeWidth={2.5} />
                           <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Update</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={startCamera}
                    className="absolute right-[calc(50%-44px)] bottom-0 w-10 h-10 bg-white border border-[#E5E7EB] rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:scale-105 transition-all z-10"
                  >
                     <Camera size={18} strokeWidth={2.5} />
                  </button>
               </div>
               
               <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
               
               <div className="relative z-10 space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formData.firstName || user.firstName} {formData.lastName || user.lastName}</h3>
                  <p className="text-sm font-medium text-slate-500">{user.role === 'producer' ? 'Service Expert' : 'Fleet Operator'}</p>
               </div>

               <div className="w-full mt-8 pt-8 border-t border-[#E5E7EB] relative z-10 space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-slate-500 shrink-0">
                        <Mail size={16} strokeWidth={2.5} />
                     </div>
                     <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-xs font-semibold text-slate-400">Email</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{user.email || 'user@example.com'}</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-red-50/50 border border-red-100 rounded-[16px] p-8 flex flex-col gap-6 relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                   <AlertCircle size={16} strokeWidth={2.5} />
                   Delete Account
                 </h4>
                 <p className="text-sm text-red-700/80 leading-relaxed">This will permanently delete your account. This cannot be undone.</p>
               </div>
               <button onClick={onDeleteAccount} className="w-full h-10 rounded-lg font-semibold text-sm bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm transition-all relative z-10">
                  Delete Account
               </button>
            </div>
         </div>

         {/* Configuration Terminal */}
         <div className="lg:col-span-8">
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 lg:p-10 shadow-sm space-y-8 h-full">
               <div className="space-y-6">
                  <div className="border-b border-[#E5E7EB] pb-4">
                     <h3 className="text-lg font-semibold text-slate-900 leading-tight">Profile Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">First Name</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.firstName} 
                          onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                          className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Last Name</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.lastName} 
                          onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                          className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                        />
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Company Name</label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <Building size={16} strokeWidth={2} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.organization} 
                             onChange={e => setFormData({ ...formData, organization: e.target.value })} 
                             className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <Phone size={16} strokeWidth={2} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.phone} 
                             onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                             className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tax ID</label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <FileText size={16} strokeWidth={2} />
                           </div>
                           <input 
                             disabled={!isEditing} 
                             value={formData.taxId} 
                             onChange={e => setFormData({ ...formData, taxId: e.target.value })} 
                             className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                           />
                        </div>
                     </div>
                   </div>
                </div>

                {user.role === 'producer' && (
                  <div className="space-y-6 pt-6 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Fingerprint size={16} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 leading-tight">Bank Details</h3>
                    </div>
                    
                    <p className="text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      Your earnings and monthly salary will be transferred to this account via Razorpay.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Account Holder Name</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.accountHolderName} 
                          onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })} 
                          className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Bank Account Number</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.bankAccountNumber} 
                          onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })} 
                          className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                        <input 
                          disabled={!isEditing} 
                          value={formData.ifscCode} 
                          onChange={e => setFormData({ ...formData, ifscCode: e.target.value })} 
                          className="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
}
