import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  History,
  Loader,
  MapPin,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
  User,
  X,
} from 'lucide-react';
import { CATEGORIES, STATUS } from '../constants';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAdmin } = useAuth();
  const { complaints, stats, loading, error, reload, changeStatus } = useComplaints();
  const { notify } = useToast();

  // If student: default to complaints needing their review. If admin: default to active complaints to investigate.
  const [tab, setTab] = useState(isAdmin ? 'In Progress' : 'Needs Review');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Student's own complaints vs All complaints
  const userComplaints = useMemo(() => {
    if (isAdmin) return complaints;
    return complaints.filter(
      (c) =>
        c.rollNo?.toUpperCase() === user?.rollNo?.toUpperCase() ||
        c.studentName?.toLowerCase() === user?.name?.toLowerCase()
    );
  }, [complaints, user, isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sourceList = isAdmin ? complaints : userComplaints;

    return sourceList
      .filter((c) => {
        if (tab === 'All') return true;
        if (tab === 'Needs Review') return c.status === STATUS.NEEDS_REVIEW;
        if (tab === 'In Progress') return c.status === STATUS.IN_PROGRESS || c.status === 'Pending';
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
  }, [complaints, userComplaints, tab, category, search, isAdmin]);

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

  const studentNeedsReviewCount = userComplaints.filter((c) => c.status === STATUS.NEEDS_REVIEW).length;
  const adminNeedsActionCount = complaints.filter((c) => c.status === STATUS.IN_PROGRESS || c.status === 'Pending').length;

  const selected = complaints.find((c) => c.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Authority Review & Dispatch Desk' : 'Review & Confirm Resolution'}
        subtitle={
          isAdmin
            ? 'Investigate campus complaints, solve issues, and demand student review to authorize closure.'
            : 'When campus maintenance finishes fixing your complaint, review their work here and confirm to close it.'
        }
        actions={
          <Link to="/history" className="btn-outline">
            <History size={16} /> View complete history
          </Link>
        }
      />

      {/* Student Urgent Review Callout */}
      {!isAdmin && studentNeedsReviewCount > 0 && (
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <Clock size={22} />
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-900">
                  {studentNeedsReviewCount} {studentNeedsReviewCount === 1 ? 'Complaint' : 'Complaints'} Awaiting Your Review!
                </h3>
                <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                  Campus maintenance has completed the required repairs. Please verify if the issue has been resolved satisfactorily and close the complaint.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab('Needs Review')}
              className="btn bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl px-4 py-2 shrink-0 self-start sm:self-auto shadow-sm"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

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
                placeholder="Search complaints by title, ID, location…"
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
                {
                  key: 'Needs Review',
                  label: isAdmin ? 'Awaiting Student Review' : 'Needs My Review',
                  count: isAdmin
                    ? complaints.filter((c) => c.status === STATUS.NEEDS_REVIEW).length
                    : studentNeedsReviewCount,
                  highlight: true,
                },
                {
                  key: 'In Progress',
                  label: isAdmin ? 'Under Investigation (Fix in Progress)' : 'In Progress (Campus Fixing)',
                  count: isAdmin
                    ? adminNeedsActionCount
                    : userComplaints.filter((c) => c.status === STATUS.IN_PROGRESS || c.status === 'Pending').length,
                },
                {
                  key: 'Resolved',
                  label: 'Closed & Resolved',
                  count: (isAdmin ? complaints : userComplaints).filter((c) => c.status === STATUS.RESOLVED).length,
                },
                {
                  key: 'All',
                  label: 'All Tickets',
                  count: (isAdmin ? complaints : userComplaints).length,
                },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    tab === t.key
                      ? 'bg-ink text-white shadow-sm'
                      : t.highlight && t.count > 0
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-slate-100 text-ink-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{t.label}</span>
                  {!loading && (
                    <span
                      className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[11px] font-bold ${
                        tab === t.key
                          ? 'bg-white/20 text-white'
                          : t.highlight && t.count > 0
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-ink-700'
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
              title={
                tab === 'Needs Review'
                  ? 'No complaints currently awaiting review'
                  : 'No complaints in this view'
              }
              description={
                tab === 'Needs Review'
                  ? isAdmin
                    ? 'No complaints are currently pending student review. Complete active fixes to request student verification.'
                    : 'None of your complaints currently require review. When campus authorities finish a repair, it will appear here for you to verify and close.'
                  : 'Try selecting a different status tab or clearing filters.'
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
                const isAwaitingStudentReview = c.status === STATUS.NEEDS_REVIEW;

                return (
                  <article
                    key={c.id}
                    className={`relative rounded-2xl border p-5 shadow-sm transition ${
                      isAwaitingStudentReview
                        ? 'border-amber-300 bg-amber-50/20 shadow-md ring-1 ring-amber-300/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Meta & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-brand-700">{c.id}</span>
                        <CategoryBadge category={c.category} />
                        <StatusBadge status={c.status} />
                      </div>
                      <span className="text-xs text-ink-500">
                        Registered {waitingTime(c.createdAt)} ago ({formatDate(c.createdAt)})
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-ink">{c.title}</h3>
                      {c.description ? (
                        <p className="mt-1.5 text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                          {c.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs italic text-ink-400">No additional description provided.</p>
                      )}
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

                    {/* Authority & Student Interactive Action Footer */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                      >
                        <ExternalLink size={14} /> View full timeline & history
                      </button>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* 1. STUDENT REVIEW WORKFLOW */}
                        {!isAdmin && (
                          <>
                            {c.status === STATUS.NEEDS_REVIEW && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(c, STATUS.IN_PROGRESS, 'reopened (issue persists)')}
                                  className="btn-outline text-xs px-3 py-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                                >
                                  <RotateCcw size={14} />
                                  Issue Still Persists (Reopen)
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(c, STATUS.RESOLVED, 'confirmed fixed and closed')}
                                  className="btn-primary text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm inline-flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={15} />
                                  Confirm Fixed & Close Complaint
                                </button>
                              </>
                            )}

                            {c.status === STATUS.IN_PROGRESS && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                                <Loader size={13} className="animate-spin text-sky-600" />
                                Under Active Investigation by Campus Authorities
                              </span>
                            )}

                            {c.status === STATUS.RESOLVED && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 size={14} />
                                Complaint Closed & Resolved
                              </span>
                            )}
                          </>
                        )}

                        {/* 2. ADMIN AUTHORITY WORKFLOW */}
                        {isAdmin && (
                          <>
                            {(c.status === STATUS.IN_PROGRESS || c.status === 'Pending') && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(c, STATUS.NEEDS_REVIEW, 'marked solved; demanded student review')}
                                className="btn-primary text-xs px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm inline-flex items-center gap-1.5"
                              >
                                <Send size={14} />
                                Fix Completed → Demand Student Review
                              </button>
                            )}

                            {c.status === STATUS.NEEDS_REVIEW && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                  <Clock size={13} />
                                  Awaiting Student Confirmation & Closure
                                </span>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(c, STATUS.RESOLVED, 'force-closed by authority')}
                                  className="btn-outline text-xs px-2.5 py-1 text-ink-600 hover:text-ink"
                                  title="Close directly as authority"
                                >
                                  Direct Close
                                </button>
                              </div>
                            )}

                            {c.status === STATUS.RESOLVED && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 size={14} /> Confirmed Closed
                                </span>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(c, STATUS.IN_PROGRESS, 're-opened by authority')}
                                  className="btn-outline text-xs px-2.5 py-1 text-ink-600"
                                >
                                  <RotateCcw size={13} /> Re-open
                                </button>
                              </div>
                            )}
                          </>
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
      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Complaint Details & Timeline">
        {selected && <ComplaintDetails complaint={selected} />}
      </Drawer>
    </div>
  );
}
