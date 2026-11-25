import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  History,
  Inbox,
  Loader,
  MapPin,
  PackageSearch,
  RotateCcw,
  Shield,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Drawer from '../components/ui/Drawer';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryBadge from '../components/ui/CategoryBadge';
import CategoryBreakdown from '../components/complaints/CategoryBreakdown';
import ComplaintDetails from '../components/complaints/ComplaintDetails';
import { EmptyState, SkeletonRows } from '../components/ui/States';
import { formatDate, waitingTime } from '../utils/format';

export default function AdminDashboard() {
  const { user, activeCollege } = useAuth();
  const { complaints, stats, loading, changeStatus } = useComplaints();
  const { notify } = useToast();

  const [selectedId, setSelectedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
  const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress');

  const handleQuickStatus = async (complaint, newStatus, actionName) => {
    if (busyId) return;
    setBusyId(complaint.id);
    try {
      await changeStatus(complaint.id, newStatus);
      notify({
        type: 'success',
        title: `${complaint.id} ${actionName}`,
        message: `Status updated to ${newStatus}.`,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Action failed', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const selected = complaints.find((c) => c.id === selectedId) || null;

  return (
    <div className="space-y-8">
      {/* Authority Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-600/30 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-brand-600/40 blur-2xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Shield size={14} /> Authority Triage Console
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {activeCollege?.name || 'Maharaja Surajmal Institute of Technology'}
            </h1>
            <p className="mt-1 text-xs text-ink-300 font-mono">
              Affiliated Code: <strong className="text-white">{activeCollege?.code || 'MSIT'}</strong> • Logged in: <strong className="text-white">{user?.name}</strong> ({user?.designation || 'Authority'})
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/review"
              className="btn rounded-xl bg-amber-500 hover:bg-amber-400 text-ink font-bold px-4 py-2.5 shadow-sm text-xs inline-flex items-center gap-1.5"
            >
              <ClipboardCheck size={16} /> Open Review Desk ({stats.pending})
            </Link>
            <Link
              to="/colleges"
              className="btn rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
            >
              <Building2 size={16} /> Affiliated Directory
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Overview Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Received"
          value={loading ? '–' : stats.total}
          hint="From students & staff"
          icon={Inbox}
          tone="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Needs Review"
          value={loading ? '–' : stats.pending}
          hint={stats.pending > 0 ? 'Requires authority action' : 'All caught up'}
          icon={Clock}
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Under Maintenance"
          value={loading ? '–' : stats.inProgress}
          hint="Technicians dispatched"
          icon={Loader}
          tone="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Closed & Resolved"
          value={loading ? '–' : stats.resolved}
          hint="Verified by administration"
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
      </section>

      {/* Main Grid: Incoming Complaints Queue + Side Panels */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left: Incoming Complaints Requiring Review */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Urgent Student Complaints (Awaiting Review)</h2>
              <p className="text-xs text-ink-500">Chronological arrival order from MSIT students</p>
            </div>
            <Link
              to="/review"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
            >
              Review all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <SkeletonRows count={4} />
            ) : pendingComplaints.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No complaints awaiting review!"
                description="All submitted student grievances have been reviewed and dispatched by authorities."
                action={
                  <Link to="/history" className="btn-outline">
                    View Complete Archive
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3.5">
                {pendingComplaints.slice(0, 5).map((c) => {
                  const isBusy = busyId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-700">{c.id}</span>
                          <CategoryBadge category={c.category} />
                          <StatusBadge status={c.status} />
                        </div>
                        <span className="text-xs text-ink-400">
                          Waiting {waitingTime(c.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-bold text-ink">{c.title}</h3>
                      <p className="mt-1 text-xs text-ink-600 line-clamp-2">{c.description}</p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                        <div className="flex items-center gap-3 text-ink-500">
                          <span className="flex items-center gap-1">
                            <User size={13} /> {c.studentName} ({c.rollNo})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {c.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedId(c.id)}
                            className="btn-ghost text-xs px-2.5 py-1 text-ink-600 hover:text-ink"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleQuickStatus(c, 'In Progress', 'marked under review')}
                            className="btn-outline text-xs px-2.5 py-1"
                          >
                            <Loader size={13} className={isBusy ? 'animate-spin' : ''} />
                            Start Work
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleQuickStatus(c, 'Resolved', 'closed & resolved')}
                            className="btn-primary text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500"
                          >
                            <CheckCircle2 size={13} />
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workload & Campus Registry */}
        <div className="space-y-6">
          {/* Category Workload */}
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-ink">Grievances by Category</h2>
            {loading ? (
              <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <CategoryBreakdown complaints={complaints} />
            )}
          </div>

          {/* Affiliated College Quick Info */}
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Building2 size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">{activeCollege?.shortName || 'MSIT'}</h3>
                <p className="text-xs text-ink-500">{activeCollege?.city || 'Janakpuri, New Delhi'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-ink-500">Affiliation Status</span>
                <span className="font-bold text-emerald-700">Verified & Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Authorized Domain</span>
                <span className="font-mono text-ink-700">{activeCollege?.domain || 'msit.in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Active Campus Tickets</span>
                <span className="font-bold text-ink">{stats.active} Active</span>
              </div>
            </div>

            <Link
              to="/colleges"
              className="mt-4 block rounded-xl bg-slate-50 py-2 text-center text-xs font-bold text-brand-700 hover:bg-brand-50 transition"
            >
              Manage Affiliated List
            </Link>
          </div>
        </div>
      </section>

      {/* Details Drawer */}
      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Complaint Audit Details">
        {selected && <ComplaintDetails complaint={selected} />}
      </Drawer>
    </div>
  );
}
