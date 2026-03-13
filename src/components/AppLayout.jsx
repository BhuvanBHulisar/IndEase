import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AppLayout = ({ children, activeTab, setActiveTab, user, notifications, onLogout, onClearNotifs }) => (
  <div
    style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#f8fafc', // Light grey background like target design
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
          padding: '32px 48px', // Proper padding from target design
          overflowY: 'auto',
          maxWidth: '1200px', // Limit width for better reading
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  </div>
);

export default AppLayout;
