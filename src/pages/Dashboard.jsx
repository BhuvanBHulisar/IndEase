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
      title="Fleet Node Matrix"
      subtitle="Comprehensive diagnostic oversight of your active industrial assets."
      action={
        <Button
          className="rounded-2xl h-14 px-8 bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-none"
        >
          <Plus size={18} strokeWidth={3} />
          Initialize Machine
        </Button>
      }
    />
    <StatsCards machines={machines} />
    <DashboardGrid machines={machines} />
    <QuickActions />
  </AppLayout>
);

export default Dashboard;
