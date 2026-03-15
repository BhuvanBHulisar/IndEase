import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Search,
  User,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';

const mainMenuItems = [
  { id: 'fleet', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'history', label: 'Service Logs', icon: History },
  { id: 'legacy', label: 'Data Archive', icon: Search },
];

const generalItems = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const firstName = user?.firstName || 'User';
  const role = user?.role || 'Administrator';

  return (
    <aside className="w-72 bg-white border-r border-slate-200/60 h-screen sticky top-0 flex flex-col z-[101]">
      {/* Premium Brand Area */}
      <div className="h-24 px-8 flex items-center gap-3.5 group cursor-pointer">
        <div className="relative">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-[var(--primary)]/20">
            <Shield className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--success)] border-2 border-white rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
            origiNode
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Enterprise
          </span>
        </div>
      </div>

      {/* Navigation Ecosystem */}
      <nav className="flex-1 px-4 py-6 space-y-10 overflow-y-auto no-scrollbar">
        {/* Main Workspace */}
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace</h4>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/20" />
          </div>
          <div className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                    isActive 
                      ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-[var(--primary)]")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-[var(--primary)]" />}
                  {isActive && <ChevronRight size={14} className="relative z-10 opacity-70" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Support & Configuration */}
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</h4>
            <Activity size={10} className="text-slate-300" />
          </div>
          <div className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </button>
              );
            })}
          </div>
        </section>
      </nav>

      {/* User Session Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--primary)] font-black text-xs shadow-sm">
             {firstName[0].toUpperCase()}
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-xs font-black text-slate-900 truncate">{firstName}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{role}</span>
           </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={14} strokeWidth={2.5} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
