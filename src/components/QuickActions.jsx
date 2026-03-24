import React from 'react';
import { Plus, History, MessageSquare, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';

const actions = [
  {
    label: 'Register Node',
    icon: Plus,
    color: '#2563eb',
    description: 'Integrate new industrial hardware',
    accent: 'Enterprise'
  },
  {
    label: 'Audit Reports',
    icon: Database,
    color: '#2563eb',
    description: 'Analyze maintenance history logs',
    accent: 'Compliance'
  },
  {
    label: 'Emergency Link',
    icon: Zap,
    color: '#ef4444',
    description: 'Direct contact with field specialists',
    accent: 'Priority'
  },
];

const QuickActions = ({ onAddMachine, onViewHistory, onSendMessage }) => {
  return (
    <div className="space-y-8 mt-4">
      <div className="text-left">
        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Operational Protocol</h3>
        <p className="text-sm font-normal text-slate-500 max-w-xl">
          Authorized administrative actions for system-wide management and field coordination.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={
                action.label === 'Register Node'
                  ? onAddMachine
                  : action.label === 'Audit Reports'
                    ? onViewHistory
                    : onSendMessage
              }
              className="group flex flex-col py-8 px-6 bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between w-full mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  action.label === 'Emergency Link' 
                    ? "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white" 
                    : "bg-blue-50 text-blue-600 group-hover:bg-[#2563EB] group-hover:text-white"
                )}>
                   <Icon size={20} strokeWidth={2} />
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-[#2563EB] transition-all group-hover:translate-x-1" />
              </div>
              
              <div className="space-y-2">
                <span className="text-base font-semibold text-slate-900 block transition-colors">
                  {action.label}
                </span>
                <p className="text-xs font-normal text-slate-500 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
