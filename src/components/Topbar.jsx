import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, UserCircle, Command, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/base';

const Topbar = ({ user, notifications = [] }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const firstName = user?.firstName || 'User';
  const initial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-[100]">
      {/* Smart Search Bar */}
      <div className="relative group w-full max-w-xl">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className={cn("transition-colors", isSearchFocused ? "text-[var(--primary)]" : "text-slate-400")} />
        </div>
        <input
          type="text"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Command center search... (Alt + K)"
          className="w-full h-12 bg-slate-100/50 border border-slate-200/80 rounded-xl pl-12 pr-12 text-slate-900 font-bold text-sm focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all outline-none placeholder:text-slate-400 placeholder:font-medium"
        />
        <div className="absolute inset-y-0 right-4 flex items-center gap-1.5 pointer-events-none">
           <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
             <Command size={10} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-500">K</span>
           </div>
        </div>
      </div>

      {/* Action Cluster */}
      <div className="flex items-center gap-4">
        {/* Support Sparkle */}
        <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--accent-light)] rounded-xl hover:bg-emerald-100 transition-all group">
           <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Priority Assist</span>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl transition-all relative group",
              showNotif ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
            )}
          >
            <Bell size={20} strokeWidth={showNotif ? 2.5 : 2} className={cn("transition-colors", showNotif ? "text-white" : "text-slate-500 group-hover:text-[var(--primary)]")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
              >
                 <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Alerts</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--accent-soft)] px-3 py-1 rounded-lg border border-[var(--accent-light)]">{unreadCount} Active</span>
                    </div>
                 </div>
                 
                 <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                        <div key={i} className="px-6 py-5 border-b border-slate-50 hover:bg-slate-50/80 transition-all cursor-pointer group flex gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                              <AlertCircle size={18} className="text-[var(--primary)]" />
                           </div>
                           <div className="flex flex-col gap-1 flex-1">
                              <p className="text-sm text-slate-700 font-bold group-hover:text-slate-900 transition-colors leading-tight">{n.message}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{n.time || 'A moment ago'}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-16 text-center">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-slate-200" size={32} />
                         </div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Alerts</p>
                      </div>
                    )}
                 </div>
                 
                 <button className="w-full py-4 bg-white hover:bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all border-t border-slate-100">
                    Enter Alert Management Terminal
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Identity Segment */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-2 group cursor-pointer">
          <div className="relative">
             <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[var(--primary)]/20 group-hover:scale-105 transition-transform">
               {initial}
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--success)] border-2 border-white rounded-full" />
          </div>
          <div className="hidden xl:flex flex-col">
            <div className="flex items-center gap-1.5">
               <span className="text-sm font-black text-slate-900 leading-none">{firstName}</span>
               <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;