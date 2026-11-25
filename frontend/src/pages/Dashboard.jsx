import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FilePlus2,
  Inbox,
  Loader,
  PackageSearch,
  Search,
} from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { useComplaints } from '../context/ComplaintsContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States';
import RecentActivity from '../components/complaints/RecentActivity';
import CategoryBreakdown from '../components/complaints/CategoryBreakdown';
import { waitingTime } from '../utils/format';

const pct = (part, total) => (total ? `${Math.round((part / total) * 100)}% of all complaints` : 'No complaints yet');

function QuickCard({ to, title, text, icon: Icon, className }) {
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-pop ${className}`}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-3xl border-[14px] border-white/10" aria-hidden="true" />
      <div className="absolute -bottom-8 right-10 h-20 w-20 rounded-2xl border-[10px] border-white/10" aria-hidden="true" />
      <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-white/20">
        <Icon size={20} />
      </span>
      <div className="relative">
        <h3 className="text-lg font-bold leading-tight">{title}</h3>
        <p className="mt-1 text-sm opacity-80">{text}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
          Open <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { complaints, stats, loading, error, reload } = useComplaints();
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    const id = trackId.trim();
    navigate(id ? `/track?id=${encodeURIComponent(id)}` : '/track');
  };

  const awaitingReview = complaints.find((c) => c.status === 'Pending') || complaints.find((c) => c.status !== 'Resolved');

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-600/40 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-tealdeep/50 blur-2xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold text-brand-300">CampusConnect</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {CURRENT_USER.firstName}.
          </h1>
          <p className="mt-2 text-sm text-ink-300 sm:text-base">
            Report a campus problem, track review status, and see issues resolved quickly by authorities.
          </p>

          <form onSubmit={handleTrack} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter complaint ID, e.g. CMP-2026-0001"
                aria-label="Complaint ID"
                className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-brand-400/40"
              />
            </div>
            <button type="submit" className="btn rounded-full bg-brand-600 px-6 py-3 text-white hover:bg-brand-500">
              Track complaint
            </button>
          </form>
        </div>
      </section>

      {error ? (
        <div className="card">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <section aria-label="Overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total complaints"
              value={loading ? '–' : stats.total}
              hint="All time"
              icon={Inbox}
              tone="bg-brand-50 text-brand-600"
            />
            <StatCard
              label="Pending"
              value={loading ? '–' : stats.pending}
              hint={loading ? '' : pct(stats.pending, stats.total)}
              icon={Clock}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              label="In progress"
              value={loading ? '–' : stats.inProgress}
              hint={loading ? '' : pct(stats.inProgress, stats.total)}
              icon={Loader}
              tone="bg-sky-50 text-sky-600"
            />
            <StatCard
              label="Resolved"
              value={loading ? '–' : stats.resolved}
              hint={loading ? '' : pct(stats.resolved, stats.total)}
              icon={CheckCircle2}
              tone="bg-emerald-50 text-emerald-600"
            />
          </section>

          {/* Quick navigation */}
          <section aria-label="Quick actions">
            <h2 className="mb-4 text-lg font-bold">Quick actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <QuickCard
                to="/submit"
                icon={FilePlus2}
                title="Submit a complaint"
                text="Tell us what's wrong and where."
                className="bg-tealdeep text-white"
              />
              <QuickCard
                to="/track"
                icon={Search}
                title="Track a complaint"
                text="Look up progress with your complaint ID."
                className="bg-coral text-white"
              />
              <QuickCard
                to="/lost-and-found"
                icon={PackageSearch}
                title="Lost & Found"
                text="Report or find lost belongings on campus."
                className="bg-mustard text-ink"
              />
            </div>
          </section>

          {/* Activity + side panels */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="card overflow-hidden lg:col-span-2">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-bold">Recent complaint activity</h2>
                <Link to="/history" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                  View all <ArrowRight size={15} />
                </Link>
              </div>
              <div className="border-t border-slate-100">
                {loading ? (
                  <SkeletonRows count={5} />
                ) : complaints.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No complaints yet"
                    description="When complaints are submitted they will show up here."
                    action={
                      <Link to="/submit" className="btn-primary">
                        Submit a complaint
                      </Link>
                    }
                  />
                ) : (
                  <RecentActivity complaints={complaints} />
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Awaiting Review</h2>
                  <Link to="/review" className="text-xs font-semibold text-brand-700 hover:underline">
                    Review desk
                  </Link>
                </div>
                {loading ? (
                  <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
                ) : awaitingReview ? (
                  <Link
                    to={`/review`}
                    className="mt-4 block rounded-2xl bg-slate-50 p-4 transition hover:bg-brand-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700">{awaitingReview.id}</span>
                      <StatusBadge status={awaitingReview.status} />
                    </div>
                    <p className="mt-2 font-semibold leading-snug">{awaitingReview.title}</p>
                    <p className="mt-1 text-xs text-ink-500">Submitted {waitingTime(awaitingReview.createdAt)} ago</p>
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-ink-500">No complaints pending review. All caught up!</p>
                )}
              </div>

              <div className="card p-5">
                <h2 className="mb-4 text-lg font-bold">Complaints by category</h2>
                {loading ? (
                  <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                  <CategoryBreakdown complaints={complaints} />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
