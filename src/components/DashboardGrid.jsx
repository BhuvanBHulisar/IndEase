import React from 'react';
import { CheckCircle2, Wrench, PlusCircle, ChevronRight } from 'lucide-react';

const defaultActivityItems = [
  {
    id: 1,
    text: 'Machine #MN-102 repaired',
    time: '2 hours ago',
    icon: CheckCircle2,
    color: '#10b981', // green
  },
  {
    id: 2,
    text: 'Maintenance scheduled - MN-089',
    time: 'Yesterday',
    icon: Wrench,
    color: '#f59e0b', // orange
  },
  {
    id: 3,
    text: 'New machine added - MN-125',
    time: '2 days ago',
    icon: PlusCircle,
    color: '#6366f1', // purple/indigo
  },
];

const serviceData = [
  { label: 'Active', value: 79, count: 98, color: '#10b981' },
  { label: 'Under Repair', value: 11, count: 14, color: '#f59e0b' },
  { label: 'Offline', value: 10, count: 12, color: '#ef4444' },
];

const DashboardGrid = ({ machines, notifications }) => {
  const machinesList = machines || [];
  const total = machinesList.length;
  const activeCount = machinesList.filter(m => m.condition_score > 50).length;
  const underRepairCount = machinesList.filter(m => m.condition_score > 20 && m.condition_score <= 50).length;
  const offlineCount = machinesList.filter(m => m.condition_score <= 20).length;

  const actualServiceData = total > 0 ? [
    { label: 'Active', value: Math.round((activeCount/total)*100), count: activeCount, color: '#10b981' },
    { label: 'Under Repair', value: Math.round((underRepairCount/total)*100), count: underRepairCount, color: '#f59e0b' },
    { label: 'Offline', value: Math.round((offlineCount/total)*100), count: offlineCount, color: '#ef4444' },
  ] : serviceData;

  const recentActivities = notifications && notifications.length > 0
    ? notifications.slice(0, 3).map((n, i) => {
        let icon = CheckCircle2;
        let color = '#10b981';
        if (n.type === 'critical' || n.type === 'warning') { icon = Wrench; color = '#f59e0b'; }
        else if (n.type === 'info') { icon = PlusCircle; color = '#6366f1'; }
        
        return {
          id: n.id || i,
          text: n.msg || n.title || 'System update',
          time: n.time,
          icon,
          color
        };
      })
    : defaultActivityItems;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Recent Activity Panel */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Recent Activity
          </h3>
          <ChevronRight size={20} color="#64748b" style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recentActivities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0, paddingRight: '12px' }}>
                  <Icon size={20} color={item.color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.text}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', flexShrink: 0 }}>
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Status Panel */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>
          Service Status
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
          {/* Donut Chart */}
          <DonutChart data={actualServiceData} />
          
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
            {actualServiceData.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: item.color,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function DonutChart({ data }) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Create an array of values out of 100 for calculating the dash lengths
  let cumulativeOffset = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const dashLength = (item.value / 100) * circumference;
          const dashOffset = circumference - cumulativeOffset;
          cumulativeOffset += dashLength;

          return (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          );
        })}
      </svg>
      {/* Center Text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
          {totalCount}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>
          Machines
        </span>
      </div>
    </div>
  );
}

export default DashboardGrid;
