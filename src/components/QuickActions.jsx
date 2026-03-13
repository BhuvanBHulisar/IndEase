import React from 'react';
import { PlusSquare, Clock, MessageSquare } from 'lucide-react';

const actions = [
  {
    label: 'Add Machine',
    icon: PlusSquare,
    color: '#3b82f6',
  },
  {
    label: 'View History',
    icon: Clock,
    color: '#3b82f6',
  },
  {
    label: 'Send Message',
    icon: MessageSquare,
    color: '#3b82f6',
  },
];

const QuickActions = ({ onAddMachine, onViewHistory, onSendMessage }) => {
  return (
    <div
      className="quick-actions-section"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Quick Actions
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={
                action.label === 'Add Machine'
                  ? onAddMachine
                  : action.label === 'View History'
                    ? onViewHistory
                    : onSendMessage
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Icon size={20} color={action.color} fill="#eff6ff" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
