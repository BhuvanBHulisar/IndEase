import React from 'react';
import { X, Award, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { cn } from './ui/base';

const LEVELS = [
  { name: 'Elite',   min: 1000, salary: 28000, color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  { name: 'Gold',    min: 600,  salary: 18000, color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  { name: 'Silver',  min: 300,  salary: 10000, color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200'},
  { name: 'Bronze',  min: 100,  salary: 5000,  color: 'text-teal-700',   bg: 'bg-teal-50',    border: 'border-teal-200'   },
  { name: 'Starter', min: 0,    salary: 0,     color: 'text-slate-600',  bg: 'bg-slate-50',   border: 'border-slate-200'  },
];

const EARN = [
  { action: 'Complete a job',           pts: '+20', icon: '✅' },
  { action: 'Complete within 24 hours', pts: '+10', icon: '⚡' },
  { action: 'Accept within 1 hour',     pts: '+5',  icon: '🚀' },
  { action: '5-star rating received',   pts: '+15', icon: '⭐' },
  { action: '4-star rating received',   pts: '+10', icon: '🌟' },
];

const PENALTIES = [
  { action: 'Decline a job',       pts: '-10', icon: '❌' },
  { action: 'Job overdue (7 days)', pts: '-25', icon: '⏰' },
  { action: 'Inactive 10+ days',   pts: '-20', icon: '💤' },
  { action: 'Bad review',          pts: '-15', icon: '👎' },
];

export default function LevelInfoModal({ open, onClose, currentLevel = 'Starter', points = 0 }) {
  if (!open) return null;

  const currentIdx = LEVELS.findIndex(l => l.name === currentLevel);
  const current    = LEVELS[currentIdx] ?? LEVELS[LEVELS.length - 1];
  const next       = LEVELS[currentIdx - 1] ?? null;
  const progress   = next
    ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
    : 100;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Level & Growth</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track your progress and earnings</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Section 1 — Current Status */}
          <div className={cn('rounded-xl border p-4 space-y-3', current.border, current.bg)}>
            <div className="flex items-center gap-2">
              <Award size={16} className={current.color} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Status</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className={cn('text-2xl font-bold tracking-tight', current.color)}>{currentLevel}</p>
                <p className="text-sm text-slate-600 mt-0.5">{points.toLocaleString('en-IN')} pts &nbsp;·&nbsp; ₹{current.salary.toLocaleString('en-IN')}/mo</p>
              </div>
              <span className="text-3xl font-bold text-slate-200">{progress}%</span>
            </div>
            <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden border border-white">
              <div
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {next
                ? `${points} / ${next.min} pts to ${next.name}`
                : 'Elite level reached — top tier!'}
            </p>
          </div>

          {/* Section 2 — Next Level */}
          {next && (
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 flex items-center gap-3">
              <TrendingUp size={16} className="text-teal-600 shrink-0" />
              <p className="text-sm font-semibold text-blue-800">
                Earn <span className="font-bold">{next.min - points} more pts</span> to unlock{' '}
                <span className="font-bold">{next.name}</span> — ₹{next.salary.toLocaleString('en-IN')}/month
              </p>
            </div>
          )}

          {/* Section 3 — Level Table */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">All Levels</p>
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E5E7EB]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {LEVELS.map(l => {
                    const isCurrent = l.name === currentLevel;
                    return (
                      <tr key={l.name} className={isCurrent ? cn('font-semibold', l.bg) : 'bg-white'}>
                        <td className={cn('px-4 py-2.5 flex items-center gap-2', l.color)}>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
                          {l.name}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {l.name === 'Elite' ? '1000+' : `${l.min}–${LEVELS[LEVELS.indexOf(l) - 1].min - 1}`}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {l.salary > 0 ? `₹${l.salary.toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 — Earn Points */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-emerald-600" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">How to Earn Points</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {EARN.map(e => (
                <div key={e.action} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{e.icon} {e.action}</span>
                  <span className="text-sm font-bold text-emerald-600">{e.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 — Penalties */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-rose-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Penalties</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PENALTIES.map(p => (
                <div key={p.action} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{p.icon} {p.action}</span>
                  <span className="text-sm font-bold text-rose-500">{p.pts}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
