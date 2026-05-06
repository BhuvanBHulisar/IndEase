import React, { useState } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, MessageSquare, Star,
  AlertCircle, X, Brain, Zap, ChevronRight, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/base';

const STEPS = ['Submitted', 'Quote Ready', 'In Progress', 'Confirm', 'Done'];

function statusToStep(rawStatus) {
  const s = (rawStatus || '').toLowerCase();
  if (s === 'broadcast' || s === 'pending') return 0;
  if (s === 'quote_submitted') return 1;
  if (s === 'quote_approved' || s === 'en_route' || s === 'accepted') return 2;
  if (s === 'in_progress' || s === 'payment_pending') return 2;
  if (s === 'pending_confirmation') return 3;
  if (s === 'completed') return 4;
  return 0;
}

function StatusStepper({ currentStep }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((label, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        const future = idx > currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all',
                done ? 'bg-emerald-500 border-emerald-500 text-white' :
                active ? 'bg-blue-600 border-blue-600 text-white' :
                'bg-white border-slate-200 text-slate-400'
              )}>
                {done ? <CheckCircle2 size={14} /> : idx + 1}
              </div>
              <span className={cn(
                'text-[9px] font-semibold whitespace-nowrap',
                done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-slate-400'
              )}>{label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mb-4 transition-all',
                idx < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const RequestCard = React.forwardRef(({ req, onOpenChat, onCancelRequest, onViewInvoice, onRateExpert, onViewQuotes, onRaiseFollowUp, onConfirmComplete, ratedJobIds }, ref) => {
  const step = statusToStep(req.rawStatus || req.status);
  const status = (req.rawStatus || req.status || '').toLowerCase();
  const isPending = status === 'broadcast' || status === 'pending' || step === 0;
  const isQuoteReceived = status === 'quote_submitted';
  const isActive = step === 1 || step === 2;
  const isCompleted = step === 3 || status === 'completed';
  const isAlreadyRated = ratedJobIds?.has(String(req.id));

  // Follow-up window: within 7 days of completion and not yet raised
  const followUpDeadline = req.follow_up_deadline ? new Date(req.follow_up_deadline) : null;
  const canRaiseFollowUp = isCompleted && followUpDeadline && followUpDeadline > new Date() && !req.follow_up_raised;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-all space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <ClipboardList size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{req.machine || req.machine_name || 'Machine'}</h4>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
              {(req.issue || req.issue_description || 'Service request').substring(0, 60)}
              {(req.issue || req.issue_description || '').length > 60 ? '...' : ''}
            </p>
          </div>
        </div>
        <div>
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full',
            isPending ? 'bg-amber-50 text-amber-700' :
            isQuoteReceived ? 'bg-indigo-50 text-indigo-700' :
            isActive ? 'bg-blue-50 text-blue-700' :
            isCompleted ? 'bg-emerald-50 text-emerald-700' :
            'bg-slate-50 text-slate-600'
          )}>
            {isPending ? 'Searching' : isQuoteReceived ? 'Quote Ready' : isActive ? 'Active' : isCompleted ? 'Completed' : 'Unknown'}
          </span>
        </div>
      </div>

      {/* AI Analysis */}
      {(req.ai_type || req.ai_machine_type) && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain size={14} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">AI Analysis</p>
            <p className="text-xs font-semibold text-slate-800 truncate">{req.ai_type || req.ai_machine_type}</p>
          </div>
          {(req.ai_confidence || req.aiConfidence) && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
              {req.ai_confidence || req.aiConfidence}% confident
            </span>
          )}
        </div>
      )}

      {/* Status Stepper */}
      <StatusStepper currentStep={step} />

      {/* Expert Info (once assigned) */}
      {req.expert && req.expert !== 'Assigning...' && req.expert !== 'Scanning for experts...' && (
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[9px]">
            {req.expert.charAt(0).toUpperCase()}
          </div>
          <span>Expert: <span className="text-slate-800 font-semibold">{req.expert}</span></span>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
        <span>{req.time || (req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now')}</span>
        {req.amount && <span className="text-teal-600">₹{req.amount}</span>}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Broadcast/pending — cancel */}
        {(status === 'broadcast' || status === 'pending') && (
          <button onClick={() => onCancelRequest && onCancelRequest(req.id)}
            className="w-full h-9 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50">
            Cancel Request
          </button>
        )}

        {/* Quote submitted — view quotes button (pulsing) */}
        {status === 'quote_submitted' && (
          <button onClick={() => onViewQuotes && onViewQuotes(req.id)}
            className="w-full h-10 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm">
            📋 View Expert Quotes
          </button>
        )}

        {/* Active — open chat */}
        {(status === 'quote_approved' || status === 'en_route' || status === 'in_progress' || status === 'accepted' || status === 'payment_pending') && (
          <button onClick={() => onOpenChat && onOpenChat(req.id)}
            className="w-full h-10 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5">
            <MessageSquare size={13} /> Open Chat
          </button>
        )}

        {/* Pending confirmation — confirm or raise issue */}
        {status === 'pending_confirmation' && (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
              ⏳ Expert has completed the repair. Please confirm to release payment.
              {req.completion_summary && <p className="mt-1 text-slate-600 italic">"{req.completion_summary}"</p>}
            </div>
            <button onClick={() => onConfirmComplete && onConfirmComplete(req.id)}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm">
              ✅ Confirm & Release Payment
            </button>
            <button onClick={() => { const d = prompt('Describe the issue:'); if (d) onRaiseFollowUp && onRaiseFollowUp(req.id, d); }}
              className="w-full h-9 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50">
              ⚠️ Raise an Issue Instead
            </button>
          </div>
        )}

        {/* Completed — invoice, rate, follow-up */}
        {status === 'completed' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => onViewInvoice && onViewInvoice(req)}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5">
                <FileText size={13} /> Invoice
              </button>
              {!isAlreadyRated && (
                <button onClick={() => onRateExpert && onRateExpert(req)}
                  className="flex-1 h-9 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 flex items-center justify-center gap-1.5">
                  <Star size={13} /> Rate Expert
                </button>
              )}
            </div>
            {req.follow_up_deadline && !req.follow_up_raised && new Date() < new Date(req.follow_up_deadline) && (
              <button onClick={() => { const d = prompt('Describe the issue with the repair:'); if (d) onRaiseFollowUp && onRaiseFollowUp(req.id, d); }}
                className="w-full h-9 rounded-xl border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50">
                ⚠️ Raise Follow-up ({Math.ceil((new Date(req.follow_up_deadline)-new Date())/(1000*60*60*24))} days left)
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default function MyRequestsView({
  requests = [],
  loading = false,
  onOpenChat,
  onCancelRequest,
  onViewInvoice,
  onRateExpert,
  onViewQuotes,
  onRaiseFollowUp,
  onConfirmComplete,
  onGoToMachines,
  ratedJobIds,
}) {
  const [filter, setFilter] = useState('All');

  const filtered = requests.filter(req => {
    const step = statusToStep(req.rawStatus || req.status);
    const status = (req.rawStatus || req.status || '').toLowerCase();
    if (filter === 'All') return true;
    if (filter === 'Active') return step === 1 || step === 2 || step === 3;
    if (filter === 'Pending') return status === 'broadcast' || status === 'pending' || step === 0;
    if (filter === 'Completed') return step === 4;
    return true;
  });

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 pb-4 lg:flex-row lg:items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Requests</h2>
          <p className="text-sm font-medium text-slate-500">Full history and real-time status of all your service requests.</p>
        </div>
        <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F1F5F9] p-1">
          {['All', 'Pending', 'Active', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'rounded-md px-4 py-1.5 text-[11px] font-semibold transition-all',
                filter === tab ? 'bg-white text-slate-900 border border-[#E5E7EB] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded" />
              <div className="flex gap-2">
                <div className="h-9 bg-slate-100 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white p-12 py-24 text-center">
          <div className="mb-6 w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
            <ClipboardList size={28} className="text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900 mb-2">
            {filter === 'All' ? 'No service requests yet' : `No ${filter.toLowerCase()} requests`}
          </h4>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            {filter === 'All'
              ? 'Go to My Machines to request a service for any of your registered machines.'
              : `You have no ${filter.toLowerCase()} service requests at this time.`}
          </p>
          {filter === 'All' && (
            <button
              onClick={onGoToMachines}
              className="h-10 px-6 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm flex items-center gap-2"
            >
              Go to My Machines <ChevronRight size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onOpenChat={onOpenChat}
                onCancelRequest={onCancelRequest}
                onViewInvoice={onViewInvoice}
                onRateExpert={onRateExpert}
                onViewQuotes={onViewQuotes}
                onRaiseFollowUp={onRaiseFollowUp}
                onConfirmComplete={onConfirmComplete}
                ratedJobIds={ratedJobIds}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
