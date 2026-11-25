import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Filter,
  History,
  Loader,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { CATEGORIES, STATUS } from '../constants';
import { useComplaints } from '../context/ComplaintsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Drawer from '../components/ui/Drawer';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryBadge from '../components/ui/CategoryBadge';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States';
import ComplaintDetails from '../components/complaints/ComplaintDetails';
import { formatDate, waitingTime } from '../utils/format';

export default function ReviewComplaints() {
  const { complaints, stats, loading, error, reload, changeStatus } = useComplaints();
  const { notify } = useToast();

  const [tab, setTab] = useState('Pending'); // default to complaints needing review
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints
      .filter((c) => {
        if (tab === 'All') return true;
        if (tab === 'Pending') return c.status === STATUS.PENDING;
        if (tab === 'In Progress') return c.status === STATUS.IN_PROGRESS;
        if (tab === 'Resolved') return c.status === STATUS.RESOLVED;
        return true;
      })
      .filter((c) => category === 'All' || c.category === category)
      .filter(
        (c) =>
          !q ||
          [c.id, c.title, c.description, c.location, c.studentName, c.rollNo, c.department]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [complaints, tab, category, search]);

  const handleUpdateStatus = async (complaint, newStatus, actionName) => {
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
      notify({
        type: 'error',
        title: 'Action failed',
        message: err.message || 'Could not update complaint status.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const selected = complaints.find((c) => c.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Complaints"
        subtitle="Campus authority triage panel: review submitted complaints, investigate issues, and close resolved tickets."
        actions={
          <Link to="/history" className="btn-outline">
            <History size={16} /> View all history
          </Link>
        }
      />

      {/* KPI Overview Tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => setTab('Pending')}
          className={`card cursor-pointer p-5 transition ${
            tab === 'Pending' ? 'ring-2 ring-amber-500' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Awaiting Review</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{loading ? '–' : stats.pending}</p>
              <p className="mt-1 text-xs text-ink-500">Needs authority attention</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock size={24} />
            </span>
          </div>
        </div>

        <div
          onClick={() => setTab('In Progress')}
          className={`card cursor-pointer p-5 transition ${
            tab === 'In Progress' ? 'ring-2 ring-sky-500' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Under Investigation</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{loading ? '–' : stats.inProgress}</p>
              <p className="mt-1 text-xs text-ink-500">Work in progress</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
              <Loader size={24} />
            </span>
          </div>
        </div>

        <div
          onClick={() => setTab('Resolved')}
          className={`card cursor-pointer p-5 transition ${
            tab === 'Resolved' ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Closed & Resolved</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{loading ? '–' : stats.resolved}</p>
              <p className="mt-1 text-xs text-ink-500">Completed & verified</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={24} />
            </span>
          </div>
        </div>
      </section>

      {/* Main Review Section */}
      <div className="card overflow-hidden">
        {/* Filters bar */}
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, title, student name, roll no, location…"
                aria-label="Search review complaints"
                className="input pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-ink-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="input md:w-48"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tab Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Pending', label: 'Needs Review', count: stats.pending },
                { key: 'In Progress', label: 'In Progress', count: stats.inProgress },
                { key: 'Resolved', label: 'Closed / Resolved', count: stats.resolved },
                { key: 'All', label: 'All Complaints', count: stats.total },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    tab === t.key
                      ? 'bg-ink text-white'
                      : 'bg-slate-100 text-ink-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{t.label}</span>
                  {!loading && (
                    <span
                      className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[11px] font-bold ${
                        tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-ink-700'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-sm text-ink-500">
              Showing <strong className="text-ink">{filtered.length}</strong> complaints
            </div>
          </div>
        </div>

        {/* Complaints Review Cards List */}
        <div className="p-4 sm:p-5">
          {loading ? (
            <SkeletonRows count={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={tab === 'Pending' ? 'No complaints awaiting review!' : 'No matching complaints found'}
              description={
                tab === 'Pending'
                  ? 'All submitted complaints have been reviewed by authorities. Excellent work!'
                  : 'Try selecting a different tab or clearing your search filters.'
              }
              action={
                search || category !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                    }}
                    className="btn-outline"
                  >
                    Reset filters
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((c) => {
                const isBusy = busyId === c.id;
                return (
                  <article
                    key={c.id}
                    className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-card"
                  >
                    {/* Top Row: Meta & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-brand-700">{c.id}</span>
                        <CategoryBadge category={c.category} />
                        <StatusBadge status={c.status} />
                      </div>
                      <span className="text-xs text-ink-500">
                        Submitted {waitingTime(c.createdAt)} ago ({formatDate(c.createdAt)})
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-ink">{c.title}</h3>
                      <p className="mt-1.5 text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                        {c.description}
                      </p>
                    </div>

                    {/* Student & Location Info Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-3 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <User size={14} className="text-ink-400" />
                        <strong className="text-ink-700">{c.studentName}</strong> ({c.rollNo} · {c.department})
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-ink-400" />
                        <span>{c.location}</span>
                      </span>
                    </div>

                    {/* Authority Action Footer */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                      >
                        <ExternalLink size={14} /> View full history & timeline
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Pending Actions */}
                        {c.status === STATUS.PENDING && (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(c, STATUS.IN_PROGRESS, 'marked under review')}
                              className="btn-outline text-xs px-3 py-1.5"
                            >
                              <Loader size={14} className={isBusy ? 'animate-spin' : ''} />
                              Mark Under Review
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(c, STATUS.RESOLVED, 'closed & resolved')}
                              className="btn-primary text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500"
                            >
                              <CheckCircle2 size={14} />
                              Close & Resolve
                            </button>
                          </>
                        )}

                        {/* In Progress Actions */}
                        {c.status === STATUS.IN_PROGRESS && (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(c, STATUS.PENDING, 'returned to pending')}
                              className="btn-ghost text-xs px-3 py-1.5 text-ink-500 hover:text-ink"
                            >
                              <RotateCcw size={14} />
                              Revert to Pending
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(c, STATUS.RESOLVED, 'closed & resolved')}
                              className="btn-primary text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500"
                            >
                              <CheckCircle2 size={14} />
                              Close & Resolve
                            </button>
                          </>
                        )}

                        {/* Resolved Actions */}
                        {c.status === STATUS.RESOLVED && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={14} /> Closed by Authority
                            </span>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(c, STATUS.IN_PROGRESS, 're-opened')}
                              className="btn-outline text-xs px-2.5 py-1 text-ink-600"
                              title="Re-open this complaint if issue persists"
                            >
                              <RotateCcw size={13} /> Re-open
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Complaint Details & Audit">
        {selected && <ComplaintDetails complaint={selected} />}
      </Drawer>
    </div>
  );
}
