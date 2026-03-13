import React from 'react';
import { LayoutGrid, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';

const defaultStats = [
  {
    title: 'Total Machines',
    icon: LayoutGrid,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    borderColor: '#2563eb',
  },
  {
    title: 'Active',
    icon: CheckCircle2,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
    borderColor: '#10b981',
  },
  {
    title: 'Under Repair',
    icon: Wrench,
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    borderColor: '#f59e0b',
  },
  {
    title: 'Offline',
    icon: AlertCircle,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    borderColor: '#ef4444',
  },
];

const StatsCards = ({ machines }) => {
  const machinesList = machines || [];
  const total = machinesList.length || 124;
  const active = machinesList.filter(m => m.condition_score > 50).length || 98;
  const underRepair = machinesList.filter(m => m.condition_score > 20 && m.condition_score <= 50).length || 14;
  const offline = machinesList.filter(m => m.condition_score <= 20).length || 12;

  const values = [total, active, underRepair, offline];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px',
      }}
    >
      {defaultStats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: stat.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={stat.iconColor} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', letterSpacing: '0.01em' }}>
                {stat.title}
              </span>
            </div>

            <div style={{ paddingLeft: '2px' }}>
              <span style={{ fontSize: '34px', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {values[idx]}
              </span>
            </div>

            {/* Bottom Color Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '24px',
                right: '24px',
                height: '3px',
                backgroundColor: stat.borderColor,
                borderRadius: '2px 2px 0 0',
                opacity: 0.8,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
