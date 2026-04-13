import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from './ui/base';
import api from '../services/api';

const STAGES = [
  { id: 'accepted',   label: 'Accepted' },
  { id: 'diagnosing', label: 'Diagnosing' },
  { id: 'repairing',  label: 'Repairing' },
  { id: 'testing',    label: 'Testing' },
  { id: 'completed',  label: 'Done' },
];

const stageIndex = (s) => STAGES.findIndex(st => st.id === s);

function ProgressBar({ current }) {
  const ci = stageIndex(current);
  return (
    <div className="flex items-center gap-1 mt-2">
      {STAGES.map((s, i) => {
        const done = i < ci;
        const active = i === ci;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              {done ? (
                <CheckCircle size={16} className="text-emerald-500" />
              ) : active ? (
                <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-indigo-200" />
              ) : (
                <Circle size={16} className="text-slate-300" />
              )}
              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-wide',
                done ? 'text-emerald-600' : active ? 'text-indigo-600' : 'text-slate-400'
              )}>{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={cn('flex-1 h-0.5 mb-4', i < ci ? 'bg-emerald-400' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function JobCard({ job, onProgressUpdate, onMarkComplete, onOpenChat, isDemo }) {
  const [stage, setStage] = useState(job.progressStage || job.progress_stage || 'accepted');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleSendUpdate = async () => {
    if (!stage) return;
    setSending(true);
    try {
      if (isDemo) {
        onProgressUpdate(job.id, stage, note);
      } else {
        await api.patch(`/jobs/${job.id}/progress`, { stage, note });
        onProgressUpdate(job.id, stage, note);
      }
      setNote('');
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onMarkComplete(job.id);
    } finally {
      setCompleting(false);
    }
  };

  const currentStage = job.progressStage || job.progress_stage || 'accepted';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {job.machine_name || job.machineName || 'Machine'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consumer: {job.client_name || job.consumerName || 'Client'} &nbsp;·&nbsp;
            Accepted: {job.created_at ? new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today'}
          </p>
          <p className="text-sm text-slate-600 mt-1">{job.issue_description || job.issue || 'Service request'}</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}
          </span>
          {job.quoted_cost || job.value ? (
            <p className="text-sm font-bold text-slate-900 mt-1">
              ₹{Number(job.quoted_cost || job.value || 0).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar current={currentStage} />

      {/* Update form */}
      <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Update Progress</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#E5E7EB] text-sm font-medium text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500"
            >
              {STAGES.filter(s => s.id !== 'completed').map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add update for consumer..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <button
          onClick={handleSendUpdate}
          disabled={sending}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send Update'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onOpenChat(job.id)}
          className="flex-1 h-10 rounded-xl border border-[#E5E7EB] text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
        >
          <MessageSquare size={14} /> Open Chat
        </button>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          {completing ? 'Completing…' : 'Mark as Completed'}
        </button>
      </div>
    </div>
  );
}

export default function ActiveJobsView({ activeJobs, onProgressUpdate, onMarkComplete, onOpenChat, isDemo }) {
  if (!activeJobs || activeJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="text-slate-300" size={28} />
        </div>
        <h4 className="text-lg font-semibold text-slate-900 mb-1">No active jobs</h4>
        <p className="text-sm text-slate-500 max-w-xs">
          Accepted service requests will appear here. Accept a request from your Dashboard to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Active Jobs</h2>
        <p className="text-sm text-slate-500 mt-1">{activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} in progress</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onProgressUpdate={onProgressUpdate}
            onMarkComplete={onMarkComplete}
            onOpenChat={onOpenChat}
            isDemo={isDemo}
          />
        ))}
      </div>
    </div>
  );
}
