import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = ({ children, user, notifications, activeTab, setActiveTab, onLogout, role, onMarkAsRead, onMarkAllRead, socketReconnecting }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        user={user}
        role={role}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} notifications={notifications} role={role} onMarkAsRead={onMarkAsRead} onMarkAllRead={onMarkAllRead} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
          {socketReconnecting ? (
            <div className="sticky top-0 z-50 px-4 py-1.5 text-center text-xs bg-amber-50 text-amber-800 border-b border-amber-100" role="status">
              Reconnecting...
            </div>
          ) : null}
          <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full animate-fade-in">
            {children}
          </div>
          {/* Dashboard Footer */}
          <div className="px-8 lg:px-12 pb-8 max-w-[1600px] mx-auto w-full">
            <div className="pt-6 border-t border-slate-200/60 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Need help? Contact us at{' '}
                <a href="mailto:originode7@gmail.com" className="text-blue-500 hover:underline font-bold">
                  originode7@gmail.com
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
