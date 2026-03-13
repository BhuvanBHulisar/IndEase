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
} from 'lucide-react';

const mainMenuItems = [
  { id: 'fleet', label: 'Fleet', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'history', label: 'Service History', icon: History },
  { id: 'legacy', label: 'Legacy Search', icon: Search },
];

const generalItems = [
  { id: 'profile', label: 'Identity', icon: User },
  { id: 'help', label: 'Support', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">origiNode</span>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-group">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-divider-label">GENERAL</div>

        <div className="sidebar-nav-group">
          {generalItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab && setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="sidebar-footer">
        <button className="sidebar-nav-item sidebar-signout" onClick={onLogout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
