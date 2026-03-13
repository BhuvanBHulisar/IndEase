import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout({ 
  children, 
  role, 
  activeTab, 
  setActiveTab, 
  user,
  onLogout,
  notifications,
  onClearNotifs
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#f8fafc',
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar user={user} notifications={notifications} onClearNotifs={onClearNotifs} />
        
        <main
          style={{
            flex: 1,
            padding: '32px 48px',
            overflowY: 'auto',
            maxWidth: '1200px',
            width: '100%',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
