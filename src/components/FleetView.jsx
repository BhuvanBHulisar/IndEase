import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/base';

import PageHeader from './PageHeader';
import StatsCards from './StatsCards';
import DashboardGrid from './DashboardGrid';
import QuickActions from './QuickActions';

export default function FleetView({ 
  machines, 
  notifications,
  setShowAddMachineModal,
}) {
  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <PageHeader
        title="Fleet Overview"
        subtitle="Track and manage your machines efficiently."
        action={
          <Button
            className="text-white"
            onClick={() => setShowAddMachineModal(true)}
            style={{
              background: '#2563eb', // target blue
              color: '#ffffff', // Ensures text is white
              borderRadius: '8px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8'; // darker on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
            }}
          >
            <Plus size={18} color="#ffffff" />
            <span style={{ color: '#ffffff' }}>Add Machine</span>
          </Button>
        }
      />

      <StatsCards machines={machines} />

      <DashboardGrid machines={machines} notifications={notifications} />

      <QuickActions
        onAddMachine={() => setShowAddMachineModal(true)}
      />
    </div>
  );
}
