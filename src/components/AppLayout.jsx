import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from './ui/base';

const AppLayout = ({ 
  children, 
  user, 
  notifications, 
  activeTab, 
  setActiveTab, 
  onLogout 
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Integration */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar user={user} notifications={notifications} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-8 lg:p-12 w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
