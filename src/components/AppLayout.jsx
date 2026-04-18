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
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans selection:bg-teal-100 selection:text-blue-900">
      {/* Sidebar Integration */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar user={user} notifications={notifications} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto py-10 px-8 w-full animate-fade-in">
            <div className="flex flex-col gap-[32px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
