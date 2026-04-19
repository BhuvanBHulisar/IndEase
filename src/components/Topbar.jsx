import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, UserCircle, Command, Sparkles, AlertCircle, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/base';

const Topbar = ({ user, notifications = [], role, onMarkAsRead, onMarkAllRead, onSearch, searchResults = [], onResultClick, isDemo, onMenuClick }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((currentTime - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 min ago';
    if (diff < 60) return `${diff} mins ago`;
    const hours = Math.floor(diff / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };
  const [showNotif, setShowNotif] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if(onSearch) onSearch(val);
  };
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const firstName = user?.firstName || 'User';
  const initial = firstName.charAt(0).toUpperCase();
  const isExpert = role === 'producer';
  const primaryColor = isExpert ? 'indigo-600' : '[#0d9488]';
  const primaryText = isExpert ? 'text-indigo-600' : 'text-[#0d9488]';
  const primaryRing = isExpert ? 'indigo-500/10' : 'teal-500/10';

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-[50]">
      <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none rounded-lg hover:bg-slate-50"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Smart Search Bar */}
        <div className="relative group w-full max-w-[200px] sm:max-w-xs md:max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className={cn("transition-colors", isSearchFocused ? primaryText : "text-slate-400")} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={(e) => {
             // Delay blur to allow clicking a result
             setTimeout(() => setIsSearchFocused(false), 200);
          }}
          placeholder="Search..."
          className={cn(
            "w-full h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-10 pr-4 text-slate-900 font-semibold text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 placeholder:text-slate-400",
            isSearchFocused ? `border-${isExpert ? 'indigo-600' : '[#0d9488]'} ring-${primaryRing}` : ""
          )}
        />
        
        <AnimatePresence>
          {searchQuery && isSearchFocused && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-y-auto z-50 max-h-80"
            >
               {searchResults.length > 0 ? searchResults.map((res, i) => (
                  <div 
                    key={res.id || i} 
                    onMouseDown={() => {
                        setSearchQuery('');
                        if(onSearch) onSearch('');
                        if (onResultClick) onResultClick(res);
                    }} 
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-[#E5E7EB] last:border-0 transition-colors"
                  >
                     <div className={`p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0 flex items-center justify-center`}>
                       {res.icon === 'machine' ? <HardDrive size={16} /> : <AlertCircle size={16} />}
                     </div>
                     <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-800 leading-tight">{res.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{res.subtitle}</div>
                     </div>
                  </div>
               )) : (
                  <div className="p-6 text-center text-slate-500 font-medium text-sm">No results found</div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* Action Cluster */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 ml-2 shrink-0">
        {/* Demo Mode Badge */}
        {isDemo && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Demo Mode</span>
          </div>
        )}
        {/* Support Sparkle */}
        <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all group">
           <Sparkles size={14} />
           <span className="text-[10px] font-semibold uppercase tracking-widest">Support</span>
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              if (!showNotif && onMarkAllRead) onMarkAllRead();
              setShowNotif(!showNotif);
            }}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group",
              showNotif ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border border-white text-[9px] font-bold text-white flex items-center justify-center pointer-events-none" aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-50"
              >
                 <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-[11px] font-semibold text-slate-500 tracking-widest">Notifications</h3>
                    <button onClick={() => onMarkAllRead && onMarkAllRead()} className="text-[10px] text-[#0d9488] font-semibold hover:underline">Mark all read</button>
                 </div>
                 
                 <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                         <div 
                           key={n.id || i} 
                           onClick={() => onMarkAsRead && onMarkAsRead(n.id)}
                           className={`px-5 py-4 border-b border-[#E5E7EB] hover:bg-slate-50 transition-all cursor-pointer group flex gap-3 relative ${!n.read ? 'bg-teal-50/30' : ''}`}
                         >
                            {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal-600" />}
                            <div className={`w-8 h-8 rounded-lg ${isExpert ? 'bg-indigo-50' : 'bg-teal-50'} flex items-center justify-center shrink-0`}>
                               <AlertCircle size={16} className={primaryText} />
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1">
                               <p className="text-xs text-slate-700 font-bold leading-tight tracking-tight">{n.message}</p>
                               <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{getTimeAgo(n.timestamp)}</p>
                            </div>
                         </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-500 text-xs">
                        No notifications
                      </div>
                    )}
                 </div>
                 {notifications.length > 0 && (
                    <div className="p-3 border-t border-[#E5E7EB] text-center bg-slate-50">
                       <button className="text-[11px] text-slate-500 hover:text-teal-600 font-semibold uppercase tracking-widest">View all</button>
                    </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Identity Segment */}
        <button aria-label={`Account menu for ${firstName}`} className="flex items-center gap-2 lg:gap-3 pl-3 sm:pl-4 lg:pl-6 border-l border-[#E5E7EB] h-10 group shrink-0">
          <div className={`w-8 h-8 rounded-lg bg-${isExpert ? 'indigo-600' : '[#0d9488]'} flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm`}>
            {initial}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-900 leading-none tracking-tight">{firstName}</span>
            <span className={`text-[10px] font-bold ${isExpert ? 'text-indigo-600' : 'text-[#0d9488]'} uppercase tracking-widest mt-1.5`}>{isExpert ? 'Service Expert' : 'Fleet Operator'}</span>
          </div>
          <ChevronDown size={14} className="hidden sm:block text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;