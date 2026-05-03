import React, { useState } from 'react';
import {
  Wallet,
  Star,
  AlertCircle,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  Terminal,
  Bell,
  Award,
  Activity,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/ui/base';
import { SkeletonCard, SkeletonStats } from './ui/Skeleton';
import LevelInfoModal from './LevelInfoModal';

const LEVEL_META = {
  Starter: {
    min: 0,
    next: 100,
    nextLevel: 'Bronze',
    accent: '#6b7280',
    cardClass: 'border-slate-200 bg-slate-50/70',
    pillClass: 'bg-slate-200 text-slate-700',
    progressClass: 'bg-slate-500'
  },
  Bronze: {
    min: 100,
    next: 300,
    nextLevel: 'Silver',
    accent: '#0d9488',
    cardClass: 'border-teal-200 bg-teal-50/70',
    pillClass: 'bg-teal-100 text-teal-700',
    progressClass: 'bg-teal-600'
  },
  Silver: {
    min: 300,
    next: 600,
    nextLevel: 'Gold',
    accent: '#16a34a',
    cardClass: 'border-emerald-200 bg-emerald-50/70',
    pillClass: 'bg-emerald-100 text-emerald-700',
    progressClass: 'bg-emerald-600'
  },
  Gold: {
    min: 600,
    next: 1000,
    nextLevel: 'Elite',
    accent: '#d97706',
    cardClass: 'border-amber-200 bg-amber-50/70',
    pillClass: 'bg-amber-100 text-amber-700',
    progressClass: 'bg-amber-500'
  },
  Elite: {
    min: 1000,
    next: null,
    nextLevel: null,
    accent: '#7c3aed',
    cardClass: 'border-violet-200 bg-violet-50/70',
    pillClass: 'bg-violet-100 text-violet-700',
    progressClass: 'bg-violet-600'
  }
};

function formatCurrency(amount) {
  return `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`;
}

function getLevelMeta(level) {
  return LEVEL_META[level] || LEVEL_META.Starter;
}

function getLevelProgress(points, level) {
  const meta = getLevelMeta(level);
  const currentPoints = Number(points || 0);

  if (!meta.next || !meta.nextLevel) {
    return {
      value: 100,
      label: `${currentPoints.toLocaleString('en-IN')} pts - Elite level reached`
    };
  }

  const range = meta.next - meta.min;
  const progressValue = range > 0 ? ((currentPoints - meta.min) / range) * 100 : 0;

  return {
    value: Math.max(0, Math.min(100, progressValue)),
    label: `${currentPoints.toLocaleString('en-IN')} / ${meta.next.toLocaleString('en-IN')} pts to ${meta.nextLevel}`
  };
}

function formatActivityReason(reason) {
  if (!reason) return 'Points updated';
  if (reason === 'Job completed') return 'Job completed';
  if (reason === 'Job completed under 24 hours') return 'Job completed under 24 hours';
  if (reason === 'Request accepted under 1 hour') return 'Request accepted under 1 hour';
  if (reason === 'Expert declined request') return 'Request declined';
  if (reason === 'Inactive for more than 10 days') return 'Inactive for more than 10 days';
  if (reason.includes('not completed in 7 days')) return 'Job not completed in 7 days';
  if (reason.startsWith('Consumer rating received:')) {
    const stars = reason.split(':')[1]?.trim()?.split(' ')[0] || '';
    return `${stars} star rating received`;
  }
  return reason;
}

function formatActivityDate(createdAt) {
  if (!createdAt) return '';
  return new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });
}

function StatsCard({ label, value, icon: Icon, color, suffix }) {
  return (
    <div className="group cursor-pointer rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
          style={{ backgroundColor: `${color}08`, color }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="space-y-1 text-left">
        <h4 className="text-[11px] font-semibold text-slate-500">{label}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
          {suffix ? <span className="text-[10px] font-semibold text-slate-400">{suffix}</span> : null}
        </div>
      </div>
    </div>
  );
}

function LevelCard({ level, points, salary, meta, progress, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn('rounded-[16px] border p-6 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer', meta.cardClass)}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.accent}14`, color: meta.accent }}
        >
          <Award size={20} strokeWidth={2} />
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]', meta.pillClass)}>
          {level}
        </span>
      </div>

      <div className="space-y-1 text-left">
        <h4 className="text-[11px] font-semibold text-slate-500">My Level</h4>
        <div className="text-3xl font-semibold tracking-tight text-slate-900">{level}</div>
        <p className="text-sm font-semibold text-slate-600">{points.toLocaleString('en-IN')} pts</p>
        <p className="text-sm font-semibold text-slate-600">{formatCurrency(salary)}/mo</p>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500">{progress.label}</span>
          <span className="text-xs font-bold text-slate-700">{Math.round(progress.value)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/80">
          <div
            className={cn('h-full rounded-full transition-all duration-500', meta.progressClass)}
            style={{ width: `${progress.value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

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
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(5000 + (distHash % 15000))}</span>
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

export default function ProducerDashboard({
  stats,
  radarJobs,
  loading,
  onAcceptJob,
  onDeclineJob,
  onJoinWaitlist,
  onViewDetails
}) {
  const [filter, setFilter] = useState('All');
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [isGuideDismissed, setIsGuideDismissed] = useState(() => localStorage.getItem('expert_guide_dismissed') === 'true');

  const handleDismissGuide = () => {
    setIsGuideDismissed(true);
    localStorage.setItem('expert_guide_dismissed', 'true');
  };

  const filteredJobs = (radarJobs || []).filter((job) => {
    const status = (job.status || 'new').toLowerCase();
    if (filter === 'All') return true;
    if (filter === 'New') return status === 'new' || status === 'pending' || status === 'broadcast';
    if (filter === 'In Progress') return status === 'in progress' || status === 'in_progress' || status === 'accepted';
    if (filter === 'Completed') return status === 'completed';
    return true;
  });

  const level = stats?.level || 'Starter';
  const points = Number(stats?.points || 0);
  const salary = Number(stats?.salary || 0);
  const rating = Number(stats?.rating || 0);
  const meta = getLevelMeta(level);
  const progress = getLevelProgress(points, level);
  const recentPointEvents = Array.isArray(stats?.recentPointEvents) ? stats.recentPointEvents : [];

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-8 pb-4 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Dashboard</h2>
          <p className="max-w-2xl text-sm font-medium text-slate-500">
            Here is your service overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
           <div className="col-span-full"><SkeletonStats /></div>
        ) : (
          <>
            <StatsCard
              label="Total Earnings"
              value={formatCurrency(stats?.earnings)}
              icon={Wallet}
              color="#3A86B7"
            />
            <StatsCard
              label="Jobs Completed"
              value={stats?.completedJobs || 0}
              icon={CheckCircle2}
              color="#16A34A"
              suffix="Jobs"
            />
            <StatsCard
              label="My Rating"
              value={rating.toFixed(1)}
              icon={Star}
              color="#FBBF24"
              suffix="/ 5.0"
            />
            <LevelCard level={level} points={points} salary={salary} meta={meta} progress={progress} onClick={() => setShowLevelModal(true)} />
          </>
        )}
      </div>

      <LevelInfoModal
        open={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        currentLevel={level}
        points={points}
      />

      {!isGuideDismissed && (stats?.completedJobs === 0 || !stats?.completedJobs) && (
        <div className="relative overflow-hidden rounded-[16px] border border-teal-200 bg-teal-50 p-6 shadow-sm">
          <button 
            onClick={handleDismissGuide}
            className="absolute right-4 top-4 text-blue-400 hover:text-teal-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-900">Getting Started with IndEase</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm border border-teal-100 flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-600">1</div>
              <h4 className="font-semibold text-slate-900 text-sm">Complete your profile and add bank details</h4>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-teal-100 flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-600">2</div>
              <h4 className="font-semibold text-slate-900 text-sm">Wait for incoming service requests from consumers</h4>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-teal-100 flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-600">3</div>
              <h4 className="font-semibold text-slate-900 text-sm">Accept requests and start earning</h4>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight text-slate-900">Performance</h3>
            <p className="text-sm font-medium text-slate-500">Last 5 point events</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
          {recentPointEvents.length > 0 ? (
            <div className="space-y-3">
              {recentPointEvents.map((event) => {
                const change = Number(event.pointChange || 0);
                const positive = change >= 0;
                const changeText = `${positive ? '+' : '-'} ${Math.abs(change)} pts`;

                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-bold',
                          positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {changeText}
                      </span>
                      <p className="text-sm font-medium text-slate-700">{formatActivityReason(event.reason)}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {formatActivityDate(event.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Award size={18} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">No recent point activity</h4>
              <p className="mt-1 text-sm text-slate-500">Your latest performance events will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <div id="incoming-requests-section" className="space-y-6 pt-2 scroll-mt-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold leading-tight text-slate-900">Incoming Requests</h3>
            {(radarJobs || []).length > 0 && (
              <div className="flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-600">
                {radarJobs.length} New
              </div>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F1F5F9] p-1">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
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
    </div>
  );
}
