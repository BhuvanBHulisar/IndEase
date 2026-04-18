import React from 'react';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import StatsCards from '../components/StatsCards';
import DashboardGrid from '../components/DashboardGrid';
import QuickActions from '../components/QuickActions';
import { Button } from '../components/ui/base';
import { Plus } from 'lucide-react';

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
      title="Fleet Ecosystem"
      subtitle="Comprehensive diagnostic oversight and real-time management of your active industrial assets."
      action={
        <Button
          className="rounded-xl h-12 px-6 bg-[#14b8a6] text-white font-semibold text-sm transition-all flex items-center gap-2.5 hover:bg-teal-600 shadow-sm border-none active:scale-95"
        >
          <Plus size={18} />
          Initialize Node
        </Button>
      }
    />
    <StatsCards machines={machines} />
    <DashboardGrid machines={machines} />
    <QuickActions />
  </AppLayout>
);

export default Dashboard;
