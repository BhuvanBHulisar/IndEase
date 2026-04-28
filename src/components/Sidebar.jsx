import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  HardDrive,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Activity,
  Briefcase,
  ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './ui/base';

const getMainMenuItems = (role) => {
  if (role === 'producer') {
    return [
      { id: 'fleet',       label: 'Dashboard',      icon: LayoutDashboard },
      { id: 'performance', label: 'My Performance',  icon: Activity },
      { id: 'active-jobs', label: 'Active Jobs',     icon: Briefcase, badge: true },
      { id: 'messages',    label: 'Messages',        icon: MessageSquare },
      { id: 'history',     label: 'Service Logs',    icon: History },
    ];
  }
  return [
    { id: 'fleet',       label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'machines',    label: 'My Machines',  icon: HardDrive },
    { id: 'my-requests', label: 'My Requests',  icon: ClipboardList, badge: true, badgeKey: 'activeRequests' },
    { id: 'messages',    label: 'Messages',     icon: MessageSquare },
    { id: 'history',     label: 'Service Logs', icon: History },
  ];
};

const generalItems = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Help & Support', icon: HelpCircle },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout, onClearData, isDemo, user, role, activeJobsCount = 0, activeRequestsCount = 0, isOpen, setIsOpen }) => {
  const firstName = user?.firstName || 'User';
  const displayRole = role === 'consumer' ? 'Fleet Operator' : 'Service Expert';
  const isExpert = role === 'producer';
  const primaryColor = isExpert ? 'indigo-600' : '[#0d9488]';
  const primaryBg = isExpert ? 'bg-indigo-50' : 'bg-[#EFF6FF]';
  const primaryText = isExpert ? 'text-indigo-600' : 'text-[#0d9488]';

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 z-[100] lg:hidden transition-opacity backdrop-blur-sm",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen && setIsOpen(false)}
      />

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-[100dvh] w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col z-[101] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close Button for Mobile */}
        <button 
          onClick={() => setIsOpen && setIsOpen(false)}
          className="absolute top-6 right-4 p-2 text-slate-400 hover:text-slate-900 lg:hidden"
        >
          <X size={20} />
        </button>
      <div className="h-24 px-8 flex items-center gap-3.5 group cursor-pointer" onClick={() => setActiveTab('fleet')}>
        <div className="relative">
          <div className={`w-10 h-10 bg-${primaryColor} rounded-xl flex items-center justify-center transform transition-transform duration-300 shadow-sm`}>
            {isExpert ? <Shield className="text-white" size={20} strokeWidth={2.5} /> : <Activity className="text-white" size={20} strokeWidth={2.5} />}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-slate-700 transition-colors">
            IndEase
          </span>
          <span className={`text-[10px] font-bold ${isExpert ? 'text-indigo-600' : 'text-[#0d9488]'} uppercase tracking-widest mt-1.5`}>
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && item.badgeKey === 'activeRequests' && activeRequestsCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {activeRequestsCount}
                      </span>
                    )}
                    {item.badge && item.badgeKey !== 'activeRequests' && activeJobsCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {activeJobsCount}
                      </span>
                    )}
                    {isActive && <div className={`w-1 h-5 bg-${primaryColor} rounded-l-full`} />}
                  </div>
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
        {isDemo ? (
          <div className="space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all font-semibold text-[10px] uppercase tracking-widest border border-slate-200"
            >
              <LogOut size={14} strokeWidth={2} />
              <span>Logout</span>
            </button>
            <button
              onClick={onClearData}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all font-semibold text-[10px] uppercase tracking-widest"
            >
              <span>Clear Data &amp; Exit</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-semibold text-[10px] uppercase tracking-widest"
          >
            <LogOut size={14} strokeWidth={2} />
            <span>Logout</span>
          </button>
        )}
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
