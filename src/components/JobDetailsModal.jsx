import React, { useState } from 'react';
import { X, Brain, FileText, Video, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';
import VideoPlayer from './VideoPlayer';

export default function JobDetailsModal({ job, onAcceptAndChat, onDecline, onClose, onSubmitQuote }) {
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteHours, setQuoteHours] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  if (!job) return null;

  const confidence = job.ai_confidence || job.aiConfidence || job.confidence || 85;
  const machineType = job.ai_machine_type || job.ai_type || job.machine_type || 'Industrial Machine';
  const issueSummary = job.ai_issue || job.ai_issue_summary || job.issue_description || job.issue || 'No summary available';
  const fullDescription = job.issue_description || job.issue || issueSummary;

  const handleSendQuote = async () => {
    if (!quoteAmount || isNaN(quoteAmount) || Number(quoteAmount) <= 0) {
      setQuoteError('Please enter a valid quote amount');
      return;
    }
    try {
      await onSubmitQuote(job.id, {
        amount: Number(quoteAmount),
        estimatedHours: quoteHours ? Number(quoteHours) : null,
        note: quoteNote || null
      });
      setQuoteSubmitted(true);
    } catch (err) {
      setQuoteError('Failed to submit quote. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Job Details</h3>
              <p className="text-xs text-slate-500 font-medium">{job.machine_name || job.machineName || 'Service Request'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Section 1: AI Analysis */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={15} className="text-indigo-600" />
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">AI Analysis</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Machine type detected</p>
                <p className="text-sm font-bold text-slate-900">{machineType}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                <span className="text-sm font-bold text-emerald-600">{confidence}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-white rounded-full overflow-hidden border border-indigo-100">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Issue summary</p>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-medium">
                {issueSummary}
              </p>
            </div>
          </div>

          {/* Section 2: Consumer's Preference (urgency + time) */}
          {(job.urgency_level || job.preferred_date || job.preferred_time_slot) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Consumer's Preference</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
                {job.urgency_level && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Urgency</p>
                    <p className={cn(
                      'font-bold capitalize',
                      job.urgency_level === 'critical' ? 'text-red-600' :
                      job.urgency_level === 'low' ? 'text-emerald-600' : 'text-amber-600'
                    )}>{job.urgency_level}</p>
                  </div>
                )}
                {job.preferred_date && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Preferred Date</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(job.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )}
                {job.preferred_time_slot && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Time Slot</p>
                    <p className="font-semibold text-slate-800 capitalize">{job.preferred_time_slot}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Consumer's full description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Consumer's Description</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{fullDescription}</p>
            </div>
          </div>

          {/* Section 4: Video */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Video size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Consumer Recorded Video</span>
            </div>
            <VideoPlayer
              videoUrl={job?.video_url || job?.videoUrl}
              label="Consumer's fault video"
            />
          </div>

          {/* Section 5: Machine Details */}
          {(job.machine_name || job.machine_type || job.model_year) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Machine Details</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Machine', value: job.machine_name || job.machineName },
                  { label: 'Type', value: job.machine_type || job.machineType },
                  { label: 'OEM', value: job.oem },
                  { label: 'Year', value: job.model_year || job.modelYear },
                  { label: 'Location', value: job.client_city || job.clientCity }
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Quote Form */}
        <div className="p-6 border-t border-slate-100">
          {quoteSubmitted ? (
            <div className="w-full h-12 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-emerald-200">
              ✓ Quote Sent — Waiting for consumer approval
            </div>
          ) : (
            <div className="space-y-3">
              {quoteError && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {quoteError}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="Your quote amount"
                    value={quoteAmount}
                    onChange={e => { setQuoteAmount(e.target.value); setQuoteError(''); }}
                    className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Est. hours (optional)"
                  value={quoteHours}
                  onChange={e => setQuoteHours(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="Note to consumer (optional)"
                value={quoteNote}
                onChange={e => setQuoteNote(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
              <button
                onClick={handleSendQuote}
                className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
              >
                Send Quote to Consumer
              </button>
              <button
                onClick={onDecline}
                className="w-full h-10 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
              >
                Decline Instead
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
