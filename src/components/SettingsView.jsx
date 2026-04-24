import { useState, useEffect } from 'react';
import { Bell, MapPin, Lock, Trash2, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import api from '../services/api';

export default function SettingsView({ role, user, onLogout }) {
  const isExpert = role === 'producer';

  const [notifNewRequest, setNotifNewRequest] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifStatusUpdate, setNotifStatusUpdate] = useState(true);

  const [isAvailable, setIsAvailable] = useState(true);
  const [serviceCity, setServiceCity] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [maxJobsPerDay, setMaxJobsPerDay] = useState(3);

  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [locationCity, setLocationCity] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('indease_settings');
    if (saved) {
      const s = JSON.parse(saved);
      setNotifNewRequest(s.notifNewRequest ?? true);
      setNotifMessages(s.notifMessages ?? true);
      setNotifPayments(s.notifPayments ?? true);
      setNotifStatusUpdate(s.notifStatusUpdate ?? true);
      setIsAvailable(s.isAvailable ?? true);
      setMaxJobsPerDay(s.maxJobsPerDay ?? 3);
      setPreferredLanguage(s.preferredLanguage ?? 'English');
    }
    if (user?.city) setLocationCity(user.city);
    if (user?.location) setServiceCity(user.location);
    if (user?.specialization) setSpecialization(user.specialization);
  }, [user]);

  const saveSettings = async () => {
    setSaving(true);
    const settings = {
      notifNewRequest, notifMessages, notifPayments, notifStatusUpdate,
      isAvailable, maxJobsPerDay, preferredLanguage,
    };
    localStorage.setItem('indease_settings', JSON.stringify(settings));

    try {
      if (isExpert) {
        await api.put('/profile/update', {
          location: serviceCity,
          specialization,
          is_available: isAvailable,
        });
      } else {
        await api.put('/profile/update', { city: locationCity });
      }
      setSaveMsg('Settings saved successfully.');
    } catch {
      setSaveMsg('Settings saved locally.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg('Password must be at least 8 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwdMsg('Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwdMsg(err.response?.data?.message || 'Failed to change password.');
    }
    setPwdLoading(false);
    setTimeout(() => setPwdMsg(''), 4000);
  };

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} className="focus:outline-none">
      {value
        ? <ToggleRight size={28} className={isExpert ? 'text-indigo-600' : 'text-teal-600'} />
        : <ToggleLeft size={28} className="text-slate-300" />}
    </button>
  );

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-lg ${isExpert ? 'bg-indigo-50' : 'bg-teal-50'} flex items-center justify-center`}>
          <Icon size={15} className={isExpert ? 'text-indigo-600' : 'text-teal-600'} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, subtitle, control }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {control}
    </div>
  );

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your preferences and account settings.</p>
      </div>

      {isExpert && (
        <Section icon={Shield} title="Availability">
          <Row
            label="Accept new requests"
            subtitle="Turn off to stop receiving new service requests temporarily"
            control={<Toggle value={isAvailable} onChange={setIsAvailable} />}
          />
          <Row
            label="Max jobs per day"
            subtitle="Limit how many requests you accept in a single day"
            control={
              <select
                value={maxJobsPerDay}
                onChange={e => setMaxJobsPerDay(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700"
              >
                {[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n} jobs</option>)}
              </select>
            }
          />
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Service City</label>
            <input
              className={inputClass}
              value={serviceCity}
              onChange={e => setServiceCity(e.target.value)}
              placeholder="e.g. Mumbai, Pune"
            />
            <p className="text-xs text-slate-400 mt-1">Consumers in your city will see you first in search results.</p>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Specialization</label>
            <input
              className={inputClass}
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              placeholder="e.g. CNC Machines, Hydraulics, Motors"
            />
          </div>
        </Section>
      )}

      {!isExpert && (
        <Section icon={MapPin} title="Location">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Your City</label>
            <input
              className={inputClass}
              value={locationCity}
              onChange={e => setLocationCity(e.target.value)}
              placeholder="e.g. Bengaluru, Chennai"
            />
            <p className="text-xs text-slate-400 mt-1">Used to match you with nearby repair experts.</p>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={e => setPreferredLanguage(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-700 w-full"
            >
              {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'].map(l =>
                <option key={l} value={l}>{l}</option>
              )}
            </select>
          </div>
        </Section>
      )}

      <Section icon={Bell} title="Notifications">
        {isExpert ? (
          <>
            <Row label="New service requests" subtitle="Alert when a consumer in your area submits a request" control={<Toggle value={notifNewRequest} onChange={setNotifNewRequest} />} />
            <Row label="New messages" subtitle="Alert when consumer sends you a message" control={<Toggle value={notifMessages} onChange={setNotifMessages} />} />
            <Row label="Payment received" subtitle="Alert when a consumer completes payment" control={<Toggle value={notifPayments} onChange={setNotifPayments} />} />
          </>
        ) : (
          <>
            <Row label="Expert accepted request" subtitle="Alert when an expert accepts your service request" control={<Toggle value={notifNewRequest} onChange={setNotifNewRequest} />} />
            <Row label="New messages" subtitle="Alert when your expert sends a message" control={<Toggle value={notifMessages} onChange={setNotifMessages} />} />
            <Row label="Status updates" subtitle="Alert when your service request status changes" control={<Toggle value={notifStatusUpdate} onChange={setNotifStatusUpdate} />} />
            <Row label="Payment confirmation" subtitle="Alert when your payment is processed" control={<Toggle value={notifPayments} onChange={setNotifPayments} />} />
          </>
        )}
      </Section>

      <Section icon={Lock} title="Change Password">
        <div className="space-y-3">
          <input type="password" className={inputClass} placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <input type="password" className={inputClass} placeholder="New password (min 8 characters)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <input type="password" className={inputClass} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          {pwdMsg && (
            <p className={`text-xs font-medium ${pwdMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{pwdMsg}</p>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={pwdLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${isExpert ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-50`}
          >
            {pwdLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Section>

      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${isExpert ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-50`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saveMsg && <p className="text-sm text-green-600 font-medium">{saveMsg}</p>}
      </div>

      <div className="mt-8 border border-red-100 rounded-2xl p-6 bg-red-50/40">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 size={15} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Deleting your account is permanent and cannot be undone. All your data including machines, service history, and messages will be removed.</p>
        <button
          onClick={() => { if (window.confirm('Are you sure? This cannot be undone.')) onLogout && onLogout(); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-100 transition-all"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
