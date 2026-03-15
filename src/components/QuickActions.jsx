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
    <div className="bg-white border border-slate-200/60 rounded-[1.5rem] p-10 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Operational Protocol</h3>
          <p className="text-sm font-medium text-slate-400">Authorized administrative actions for system-wide management.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Access Only</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              className="group flex flex-col p-8 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 hover:bg-white hover:border-blue-600/30 hover:shadow-premium transition-all text-left relative overflow-hidden"
            >
              {/* Refined Accents */}
              <div className="absolute top-4 right-6 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-blue-600/40 transition-colors">
                {action.accent}
              </div>

              <div className="flex items-center justify-between w-full mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                  action.label === 'Emergency Link' ? "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white" : "bg-white border border-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
                )}>
                   <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                  <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                  {action.label}
                </span>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
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
