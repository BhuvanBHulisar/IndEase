import React, { useState } from 'react';
import { X, Brain, FileText, Video, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/base';
import VideoPlayer from './VideoPlayer';

export default function JobDetailsModal({ job, onAcceptAndChat, onDecline, onClose, onSubmitQuote }) {
  const [labourCost, setLabourCost] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [partsVariable, setPartsVariable] = useState(false);
  const [diagnosisNote, setDiagnosisNote] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [availableSlot, setAvailableSlot] = useState('morning');
  const [visitType, setVisitType] = useState('onsite');
  const [quoteError, setQuoteError] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const totalQuote = (Number(labourCost) || 0) + (Number(partsCost) || 0);

  if (!job) return null;

  const confidence = job.ai_confidence || job.aiConfidence || job.confidence || 85;
  const machineType = job.ai_machine_type || job.ai_type || job.machine_type || 'Industrial Machine';
  const issueSummary = job.ai_issue || job.ai_issue_summary || job.issue_description || job.issue || 'No summary available';
  const fullDescription = job.issue_description || job.issue || issueSummary;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
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

        {/* Split Content Wrapper */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Job Details */}
          <div className="md:w-1/2 overflow-y-auto p-6 space-y-5 border-b md:border-b-0 md:border-r border-slate-100">

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

          {/* Section 2: Consumer's Requirements */}
          {(job.urgency_level || job.preferred_date || job.consumer_budget_hint) && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Consumer's Requirements</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {job.urgency_level && <div><p className="text-[10px] text-slate-400 font-semibold uppercase">Urgency</p><p className="font-bold text-slate-800 capitalize">{job.urgency_level}</p></div>}
                {job.preferred_date && <div><p className="text-[10px] text-slate-400 font-semibold uppercase">Preferred Date</p><p className="font-bold text-slate-800">{new Date(job.preferred_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p></div>}
                {job.preferred_time_slot && <div><p className="text-[10px] text-slate-400 font-semibold uppercase">Time Slot</p><p className="font-bold text-slate-800 capitalize">{job.preferred_time_slot}</p></div>}
                {job.consumer_budget_hint && <div><p className="text-[10px] text-slate-400 font-semibold uppercase">Budget</p><p className="font-bold text-teal-700">{job.consumer_budget_hint}</p></div>}
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

          {/* Right Column: Quote Form */}
          <div className="md:w-1/2 overflow-y-auto p-6 bg-slate-50">
          {quoteSubmitted ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-5xl">✅</div>
              <p className="font-bold text-slate-900 text-lg">Quote Sent!</p>
              <p className="text-sm text-slate-500">Waiting for consumer to review and approve.</p>
              <p className="text-xs text-slate-400">You'll be notified instantly when they decide.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submit Your Quote</p>
              {quoteError && <p className="text-red-500 text-xs font-medium bg-red-50 px-3 py-2 rounded-lg">{quoteError}</p>}

              <textarea placeholder="Your assessment — what do you think the issue is after reviewing this request?"
                value={diagnosisNote} onChange={e => setDiagnosisNote(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:border-indigo-500" />

              <textarea placeholder="Scope of work — what steps will you take to fix it?"
                value={scopeOfWork} onChange={e => setScopeOfWork(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:border-indigo-500" />

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input type="number" placeholder="Labour cost" value={labourCost} onChange={e => setLabourCost(e.target.value)}
                    className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input type="number" placeholder="Parts cost (est.)" value={partsCost} onChange={e => setPartsCost(e.target.value)}
                    className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" checked={partsVariable} onChange={e => setPartsVariable(e.target.checked)} className="rounded" />
                Parts cost may vary based on inspection
              </label>

              {totalQuote > 0 && (
                <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">Total Quote</span>
                  <span className="text-xl font-bold text-indigo-700">₹{totalQuote.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Est. Hours</label>
                  <input type="number" placeholder="e.g. 3" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Available Date</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={availableDate} onChange={e => setAvailableDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Available Time Slot</label>
                <select value={availableSlot} onChange={e => setAvailableSlot(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 bg-white">
                  <option value="morning">Morning (8am–12pm)</option>
                  <option value="afternoon">Afternoon (12pm–5pm)</option>
                  <option value="evening">Evening (5pm–8pm)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Visit Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{v:'onsite',l:'🚗 On-site'},{v:'remote',l:'📹 Remote'},{v:'videocall',l:'📞 Video Call'}].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setVisitType(opt.v)}
                      className={`h-10 rounded-xl border text-xs font-semibold transition-all ${visitType===opt.v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  if (totalQuote <= 0) { setQuoteError('Please enter labour or parts cost'); return; }
                  if (!diagnosisNote) { setQuoteError('Please add your assessment of the issue'); return; }
                  setQuoteError('');
                  try {
                    await onSubmitQuote(job.id, {
                      amount: totalQuote,
                      labourCost: Number(labourCost) || null,
                      partsCost: Number(partsCost) || null,
                      partsIncluded: !partsVariable,
                      diagnosisNote, scopeOfWork,
                      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
                      availableDate: availableDate || null,
                      availableSlot, visitType
                    });
                    setQuoteSubmitted(true);
                  } catch { setQuoteError('Failed to submit quote. Please try again.'); }
                }}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                Send Quote to Consumer
              </button>
              <button onClick={onDecline} className="w-full h-9 text-slate-400 text-xs font-medium hover:text-slate-600">
                Decline this request instead
              </button>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
