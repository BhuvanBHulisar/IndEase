import React from 'react';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import StatsCards from '../components/StatsCards';
import DashboardGrid from '../components/DashboardGrid';
import QuickActions from '../components/QuickActions';

const Dashboard = ({ activeTab, setActiveTab, user, notifications, onLogout, onClearNotifs, machines }) => (
  <AppLayout
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    user={user}
    notifications={notifications}
    onLogout={onLogout}
    onClearNotifs={onClearNotifs}
  >
    <PageHeader
      title="Fleet Overview"
      subtitle="Track and manage your machines efficiently."
      action={
        <button
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            borderRadius: 12,
            padding: '10px 22px',
            fontWeight: 700,
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.3)';
          }}
        >
          + Add Machine
        </button>
      }
    />
    <StatsCards machines={machines} />
    <DashboardGrid machines={machines} />
    <QuickActions />
  </AppLayout>
);

export default Dashboard;
