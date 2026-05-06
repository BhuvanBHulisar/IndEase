import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { 
   User, 
   Camera, 
   Upload, 
   AlertCircle, 
   Save, 
   Building,
   Mail,
   Phone,
   MapPin,
   Hash,
   CheckCircle2,
   Fingerprint,
   ChevronDown
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion } from 'framer-motion';

// ── India State → Cities map ──────────────────────────────────────────────────
const INDIA_STATES = {
  "Karnataka":                    ["Bengaluru","Mysuru","Mangaluru","Hubli","Belagavi"],
  "Maharashtra":                  ["Mumbai","Pune","Nagpur","Nashik","Aurangabad"],
  "Tamil Nadu":                   ["Chennai","Coimbatore","Madurai","Salem","Trichy"],
  "Telangana":                    ["Hyderabad","Warangal","Nizamabad","Karimnagar"],
  "Andhra Pradesh":               ["Visakhapatnam","Vijayawada","Guntur","Tirupati"],
  "Delhi":                        ["New Delhi","Dwarka","Rohini","Saket"],
  "Gujarat":                      ["Ahmedabad","Surat","Vadodara","Rajkot"],
  "Rajasthan":                    ["Jaipur","Udaipur","Jodhpur","Kota"],
  "Uttar Pradesh":                ["Lucknow","Kanpur","Noida","Varanasi","Agra"],
  "West Bengal":                  ["Kolkata","Howrah","Durgapur","Siliguri"],
  "Kerala":                       ["Kochi","Thiruvananthapuram","Kozhikode","Thrissur"],
  "Punjab":                       ["Ludhiana","Amritsar","Jalandhar","Patiala"],
  "Haryana":                      ["Gurgaon","Faridabad","Panipat","Ambala"],
  "Madhya Pradesh":               ["Bhopal","Indore","Gwalior","Jabalpur"],
  "Bihar":                        ["Patna","Gaya","Bhagalpur"],
  "Odisha":                       ["Bhubaneswar","Cuttack","Rourkela"],
  "Assam":                        ["Guwahati","Dibrugarh","Silchar"],
  "Jharkhand":                    ["Ranchi","Jamshedpur","Dhanbad"],
  "Chhattisgarh":                 ["Raipur","Bhilai","Bilaspur"],
  "Goa":                          ["Panaji","Margao","Vasco da Gama"],
  "Himachal Pradesh":             ["Shimla","Manali","Dharamshala"],
  "Uttarakhand":                  ["Dehradun","Haridwar","Nainital"],
  "Jammu and Kashmir":            ["Srinagar","Jammu"],
  "Ladakh":                       ["Leh","Kargil"],
  "Tripura":                      ["Agartala"],
  "Meghalaya":                    ["Shillong"],
  "Manipur":                      ["Imphal"],
  "Mizoram":                      ["Aizawl"],
  "Nagaland":                     ["Kohima","Dimapur"],
  "Sikkim":                       ["Gangtok"],
  "Puducherry":                   ["Puducherry"],
  "Chandigarh":                   ["Chandigarh"],
  "Andaman and Nicobar Islands":  ["Port Blair"],
  "Lakshadweep":                  ["Kavaratti"],
};

const SELECT_CLS = (disabled) =>
  `w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none appearance-none ${
    disabled ? 'bg-[#F8FAFC] text-slate-500 cursor-default' : 'cursor-pointer'
  }`;

const INPUT_CLS = `w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500`;
const INPUT_ICON_CLS = `w-full h-11 rounded-lg border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm font-medium text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none disabled:bg-[#F8FAFC] disabled:text-slate-500`;

export default function ProfileView({ 
  user, 
  userPhoto, 
  onPhotoUpload, 
  onStartCamera, 
  onSave,
  onDeleteIdentity
}) {
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    firstName:          user?.firstName || '',
    lastName:           user?.lastName  || '',
    organization:       user?.extraInfo || '',
    phone:              user?.phone     || '',
    state:              user?.state     || '',
    city:               user?.city      || '',
    pincode:            user?.pincode   || '',
    bankAccountNumber:  user?.bankAccountNumber  || '',
    ifscCode:           user?.ifscCode           || '',
    accountHolderName:  user?.accountHolderName  || '',
    email:              user?.email || '',
    latitude:           user?.latitude || null,
    longitude:          user?.longitude || null
  });

  // Cities available for selected state
  const cities = formData.state ? (INDIA_STATES[formData.state] || []) : [];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          setFormData(prev => ({
            ...prev,
            firstName:    u.first_name  || u.firstName    || prev.firstName,
            lastName:     u.last_name   || u.lastName     || prev.lastName,
            email:        u.email       || prev.email,
            organization: u.company     || u.organization || prev.organization,
            phone:        u.phone       || u.phone_number || prev.phone,
            state:        u.state       || prev.state,
            city:         u.city        || prev.city,
            pincode:      u.pincode     || prev.pincode,
          }));
        }
        const res = await api.get('/auth/me');
        const u = res.data.user || res.data;
        setFormData(prev => ({
          ...prev,
          firstName:    u.first_name  || u.firstName    || prev.firstName,
          lastName:     u.last_name   || u.lastName     || prev.lastName,
          email:        u.email       || prev.email,
          organization: u.company     || u.organization || prev.organization,
          phone:        u.phone       || u.phone_number || prev.phone,
          state:        u.state       || prev.state,
          city:         u.city        || prev.city,
          pincode:      u.pincode     || prev.pincode,
        }));
        localStorage.setItem('user', JSON.stringify(u));
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      }, () => console.warn('GPS denied or failed'));
    }
  }, []);

  const fileInputRef = useRef(null);

  const handleSave = async () => {
    try {
      const res = await api.put('/profile/update', {
        first_name: formData.firstName,
        last_name:  formData.lastName,
        company:    formData.organization,
        phone:      formData.phone,
        state:      formData.state,
        city:       formData.city,
        pincode:    formData.pincode,
        latitude:   formData.latitude,
        longitude:  formData.longitude
      });
      if (res.data.success) {
        // Use the server's returned user object as the source of truth
        const updatedUser = res.data.user || {};
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...updatedUser,
          // Keep camelCase aliases in sync too
          first_name:   formData.firstName,
          last_name:    formData.lastName,
          organization: formData.organization,
          phone:        formData.phone,
          state:        formData.state,
          city:         formData.city,
          pincode:      formData.pincode,
        }));
        if (onSave) onSave(formData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.error || err.message;
      alert('Failed to update profile: ' + detail);
    }
  };

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  // When state changes, reset city
  const handleStateChange = (e) => {
    setFormData(prev => ({ ...prev, state: e.target.value, city: '' }));
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto animate-fade-in pt-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
          <p className="text-sm font-medium text-slate-500 max-w-2xl">
            Manage your personal information, company details, and account settings.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} className="h-10 px-6 rounded-lg bg-slate-900 text-white hover:bg-black font-semibold text-sm shadow-sm">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column — Avatar + delete */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-28 bg-[#F8FAFC]" />
            <div className="relative mb-6 mt-4 z-10 w-full flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md overflow-hidden relative group/photo">
                {userPhoto ? (
                  <img src={userPhoto} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-teal-600">
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
                onClick={onStartCamera}
                className="absolute right-[calc(50%-44px)] bottom-0 w-10 h-10 bg-white border border-[#E5E7EB] rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-teal-600 hover:scale-105 transition-all z-10"
              >
                <Camera size={18} strokeWidth={2.5} />
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={onPhotoUpload} hidden accept="image/*" />
            <div className="relative z-10 space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formData.firstName} {formData.lastName}</h3>
              <p className="text-sm font-medium text-slate-500">{user?.role === 'producer' ? 'Service Expert' : 'Fleet Operator'}</p>
            </div>
            <div className="w-full mt-8 pt-8 border-t border-[#E5E7EB] relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-slate-500 shrink-0">
                  <Mail size={16} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-semibold text-slate-400">Email</span>
                  <span className="text-sm font-medium text-slate-700 truncate">{formData.email || 'user@example.com'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-[16px] p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                <AlertCircle size={16} strokeWidth={2.5} />
                Delete Account
              </h4>
              <p className="text-sm text-red-700/80 leading-relaxed">This will permanently delete your account. This cannot be undone.</p>
            </div>
            <button onClick={onDeleteIdentity} className="w-full h-10 rounded-lg font-semibold text-sm bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm transition-all relative z-10">
              Delete Account
            </button>
          </div>
        </div>

        {/* Right column — Form */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 lg:p-10 shadow-sm space-y-8 h-full">
            <div className="space-y-6">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h3 className="text-lg font-semibold text-slate-900 leading-tight">Profile Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input disabled={!isEditing} value={formData.firstName} onChange={set('firstName')} className={INPUT_CLS} />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input disabled={!isEditing} value={formData.lastName} onChange={set('lastName')} className={INPUT_CLS} />
                </div>

                {/* Company — full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Company Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building size={16} strokeWidth={2} /></div>
                    <input disabled={!isEditing} value={formData.organization} onChange={set('organization')} className={INPUT_ICON_CLS} />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={16} strokeWidth={2} /></div>
                    <input disabled={!isEditing} value={formData.phone} onChange={set('phone')} className={INPUT_ICON_CLS} />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Pincode</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Hash size={16} strokeWidth={2} /></div>
                    <input
                      disabled={!isEditing}
                      value={formData.pincode}
                      onChange={set('pincode')}
                      maxLength={6}
                      placeholder="e.g. 560001"
                      className={INPUT_ICON_CLS}
                    />
                  </div>
                </div>

                {/* State dropdown — full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">State</label>
                  <div className="relative">
                    <select
                      disabled={!isEditing}
                      value={formData.state}
                      onChange={handleStateChange}
                      className={SELECT_CLS(!isEditing)}
                    >
                      <option value="">Select state…</option>
                      {Object.keys(INDIA_STATES).sort().map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronDown size={16} strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* City dropdown — full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <div className="relative">
                    <select
                      disabled={!isEditing || !formData.state}
                      value={formData.city}
                      onChange={set('city')}
                      className={SELECT_CLS(!isEditing || !formData.state)}
                    >
                      <option value="">{formData.state ? 'Select city…' : 'Select a state first'}</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronDown size={16} strokeWidth={2} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bank details — producers only */}
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
                    <input disabled={!isEditing} value={formData.accountHolderName} onChange={set('accountHolderName')} className={INPUT_CLS} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Bank Account Number</label>
                    <input disabled={!isEditing} value={formData.bankAccountNumber} onChange={set('bankAccountNumber')} className={INPUT_CLS} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                    <input disabled={!isEditing} value={formData.ifscCode} onChange={set('ifscCode')} className={INPUT_CLS} />
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
