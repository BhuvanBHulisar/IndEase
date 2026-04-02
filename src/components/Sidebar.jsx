import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Search,
  HardDrive,
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

const getMainMenuItems = (role) => {
  if (role === 'producer') {
    return [
      { id: 'fleet', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'performance', label: 'My Performance', icon: Activity },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'history', label: 'Service Logs', icon: History },
      { id: 'legacy', label: 'Data Archive', icon: Search },
    ];
  }
  return [
    { id: 'fleet', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'My Machines', icon: HardDrive },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'history', label: 'Service Logs', icon: History },
  ];
};

const generalItems = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'support', label: 'Help & Support', icon: HelpCircle },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout, user, role }) => {
  const firstName = user?.firstName || 'User';
  const displayRole = role === 'consumer' ? 'Fleet Operator' : 'Service Expert';
  const isExpert = role === 'producer';
  const primaryColor = isExpert ? 'indigo-600' : '[#2563EB]';
  const primaryBg = isExpert ? 'bg-indigo-50' : 'bg-[#EFF6FF]';
  const primaryText = isExpert ? 'text-indigo-600' : 'text-[#2563EB]';

  return (
    <aside className="w-72 bg-white border-r border-[#E5E7EB] h-screen sticky top-0 flex flex-col z-[101]">
      {/* Premium Brand Area */}
      <div className="h-24 px-8 flex items-center gap-3.5 group cursor-pointer" onClick={() => setActiveTab('fleet')}>
        <div className="relative">
          <div className={`w-10 h-10 bg-${primaryColor} rounded-xl flex items-center justify-center transform transition-transform duration-300 shadow-sm`}>
            {isExpert ? <Shield className="text-white" size={20} strokeWidth={2.5} /> : <Activity className="text-white" size={20} strokeWidth={2.5} />}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-slate-700 transition-colors">
            origiNode
          </span>
          <span className={`text-[10px] font-bold ${isExpert ? 'text-indigo-600' : 'text-[#2563EB]'} uppercase tracking-widest mt-1.5`}>
            Enterprise
          </span>
        </div>
      </div>

      {/* Navigation Ecosystem */}
      <nav className="flex-1 px-4 py-6 space-y-12 overflow-y-auto no-scrollbar">
        {/* Main Workspace */}
        <section>
          <div className="flex items-center justify-between px-4 mb-6">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Workspace</h4>
          </div>
          <div className="space-y-2">
            {getMainMenuItems(role).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group relative overflow-hidden",
                    isActive 
                      ? `${primaryBg} ${primaryText}` 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <Icon size={18} strokeWidth={2} className={cn("transition-colors", isActive ? primaryText : "text-slate-400 group-hover:text-slate-900")} />
                    <span className={`font-semibold text-sm tracking-tight ${isActive ? '' : 'text-slate-600'}`}>{item.label}</span>
                  </div>
                  {isActive && <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-${primaryColor} rounded-l-full`} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Support & Configuration */}
        <section>
          <div className="flex items-center justify-between px-4 mb-6">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">System</h4>
          </div>
          <div className="space-y-2">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group relative overflow-hidden",
                    isActive 
                      ? `${primaryBg} ${primaryText}` 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <Icon size={18} strokeWidth={2} className={cn("transition-colors", isActive ? primaryText : "text-slate-400 group-hover:text-slate-900")} />
                    <span className={`font-semibold text-sm tracking-tight ${isActive ? '' : 'text-slate-600'}`}>{item.label}</span>
                  </div>
                  {isActive && <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-${primaryColor} rounded-l-full`} />}
                </button>
              );
            })}
          </div>
        </section>
      </nav>

      {/* User Session Footer */}
      <div className="p-6 border-t border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-3 mb-6 px-2">
           <div className={`w-10 h-10 rounded-xl ${primaryBg} border ${isExpert ? 'border-indigo-100' : 'border-blue-100'} flex items-center justify-center ${primaryText} font-bold text-xs shadow-sm`}>
             {firstName[0].toUpperCase()}
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-xs font-bold text-slate-900 truncate tracking-tight">{firstName}</span>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{displayRole}</span>
           </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-semibold text-[10px] uppercase tracking-widest"
        >
          <LogOut size={14} strokeWidth={2} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
