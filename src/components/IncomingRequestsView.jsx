import React, { useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  MapPin,
  Clock,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/base';
import { SkeletonCard } from './ui/Skeleton';

const JobCard = React.forwardRef(({ job, onAccept, onDecline, onJoinWaitlist, onViewDetails }, ref) => {
  const distHash = String(job.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dist = 5 + (distHash % 45);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'backOut' }}
    >
      <div
        className={cn(
          'group relative flex h-full flex-col justify-between overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md',
          job.priority === 'critical' && 'border-red-200 bg-red-50/10'
        )}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold',
                job.priority === 'critical' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'
              )}
            >
              {job.client_name?.[0] || job.other_party?.[0] || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400">
                  ID: {String(job.id).substring(0, 6).toUpperCase()}
                </span>
                {job.priority === 'critical' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                    <AlertCircle size={10} /> Urgent
                  </span>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-teal-600">
                {job.machine_name || 'Service Request'}
              </h3>
              <div className="pt-0.5 text-[13px] font-medium text-slate-500">
                {job.client_name || job.other_party || 'Machine Owner'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[10px] font-semibold text-slate-400">Value</p>
            <span className="text-lg font-semibold text-slate-900">
              ₹{Number(5000 + (distHash % 15000)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="mb-6 flex-1 space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm font-medium text-slate-700">
            {job.issue_description || 'Standard service request.'}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} />
              <span className="text-[12px] font-medium">{dist}km away</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={14} />
              <span className="text-[12px] font-medium">
                {job.created_at
                  ? new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </div>
            {job.is_nearby && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Nearby
              </span>
            )}
            {!job.is_nearby && job.client_city && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                {job.client_city}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <button
            onClick={onDecline}
            className="flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-[12px] font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white"
          >
            Decline
          </button>
          <button
            onClick={onViewDetails}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            View & Accept
            <ChevronRight size={14} />
          </button>
        </div>

        {(job.status === 'accepted' || job.already_taken) && (
          <button
            onClick={onJoinWaitlist}
            className="mt-3 w-full h-9 rounded-lg border border-amber-200 bg-amber-50 text-[12px] font-semibold text-amber-700 hover:bg-amber-600 hover:text-white transition-all"
          >
            Join waitlist — get notified if it opens up
          </button>
        )}
      </div>
    </motion.div>
  );
});
JobCard.displayName = 'JobCard';

export default function IncomingRequestsView({ loading, radarJobs, onAcceptJob, onDeclineJob, onJoinWaitlist, onViewDetails }) {
  const [filter, setFilter] = useState('All');

  const filteredJobs = (radarJobs || []).filter((job) => {
    const status = (job.status || 'new').toLowerCase();
    if (filter === 'All') return true;
    if (filter === 'New') return status === 'new' || status === 'pending' || status === 'broadcast';
    if (filter === 'In Progress') return status === 'in progress' || status === 'in_progress' || status === 'accepted';
    if (filter === 'Completed') return status === 'completed';
    return true;
  });

  return (
    <div className="w-full animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Incoming Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            New service requests from consumers waiting for your response.
          </p>
        </div>
        {(radarJobs || []).length > 0 && (
          <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 whitespace-nowrap">
            {radarJobs.length} New
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F1F5F9] p-1 w-fit">
        {['All', 'New', 'In Progress', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'rounded-md px-4 py-1.5 text-[11px] font-semibold transition-all',
              filter === tab
                ? 'border border-[#E5E7EB] bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Jobs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onAccept={() => onAcceptJob(job)}
                  onDecline={() => onDeclineJob(job)}
                  onJoinWaitlist={() => onJoinWaitlist && onJoinWaitlist(job)}
                  onViewDetails={() => onViewDetails && onViewDetails(job)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white p-12 py-32 text-center transition-all duration-500">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                  <Bell className="text-slate-400" size={28} />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-slate-900">No new requests yet</h4>
                <p className="mx-auto max-w-sm text-sm text-slate-500">
                  New service requests from consumers in your area will appear here automatically.
                </p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
