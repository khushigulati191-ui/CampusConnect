import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileX2, FilePlus2, Search, User, X } from 'lucide-react';
import { CATEGORIES, CURRENT_USER, STATUS_FLOW } from '../constants';
import { useComplaints } from '../context/ComplaintsContext';
import PageHeader from '../components/ui/PageHeader';
import Drawer from '../components/ui/Drawer';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States';
import ComplaintTable from '../components/complaints/ComplaintTable';
import ComplaintDetails from '../components/complaints/ComplaintDetails';

export default function ComplaintHistory() {
  const { complaints, loading, error, reload } = useComplaints();
  const [searchParams, setSearchParams] = useSearchParams();

  // The search text lives in the URL so the top bar search can drive it
  const query = searchParams.get('q') ?? '';
  const [scope, setScope] = useState('All'); // 'All' = all campus complaints, 'My' = current student's complaints
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selectedId, setSelectedId] = useState(null);

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const myComplaintsCount = useMemo(() => {
    return complaints.filter(
      (c) =>
        c.rollNo?.toUpperCase() === CURRENT_USER.rollNo.toUpperCase() ||
        c.studentName?.toLowerCase() === CURRENT_USER.name.toLowerCase(),
    ).length;
  }, [complaints]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints
      .filter((c) => {
        if (scope === 'My') {
          return (
            c.rollNo?.toUpperCase() === CURRENT_USER.rollNo.toUpperCase() ||
            c.studentName?.toLowerCase() === CURRENT_USER.name.toLowerCase()
          );
        }
        return true; // 'All': show every complaint on campus irrespective of login!
      })
      .filter((c) => status === 'All' || c.status === status)
      .filter((c) => category === 'All' || c.category === category)
      .filter(
        (c) =>
          !q ||
          [c.id, c.title, c.category, c.location, c.description, c.studentName]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) =>
        sort === 'newest'
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt),
      );
  }, [complaints, scope, query, status, category, sort]);

  const filtersActive = query || status !== 'All' || category !== 'All';
  const clearFilters = () => {
    setQuery('');
    setStatus('All');
    setCategory('All');
  };

  const selected = complaints.find((c) => c.id === selectedId) || null;

  return (
    <div>
      <PageHeader
        title="Complaint history"
        subtitle="Every complaint submitted so far. Search, filter and open any complaint for full details."
        actions={
          <Link to="/submit" className="btn-primary">
            <FilePlus2 size={16} /> New complaint
          </Link>
        }
      />

      <div className="card overflow-hidden">
        {/* Scope bar: All Complaints vs My Complaints */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScope('All')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                scope === 'All'
                  ? 'bg-ink text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-ink-600 hover:bg-slate-100'
              }`}
            >
              All Complaints ({loading ? '–' : complaints.length})
            </button>
            <button
              type="button"
              onClick={() => setScope('My')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                scope === 'My'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-ink-600 hover:bg-slate-100'
              }`}
            >
              <User size={13} />
              My Complaints ({loading ? '–' : myComplaintsCount})
            </button>
          </div>

          <span className="text-xs text-ink-500">
            {scope === 'All' ? (
              <span>Showing all complaints across campus irrespective of login</span>
            ) : (
              <span>
                Filtered by your profile: <strong>{CURRENT_USER.name}</strong> ({CURRENT_USER.rollNo})
              </span>
            )}
          </span>
        </div>

        {/* Filters */}
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, title, location…"
                aria-label="Search complaints"
                className="input pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="input lg:w-52"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort complaints"
              className="input lg:w-44"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              {['All', ...STATUS_FLOW].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    status === s
                      ? 'bg-ink text-white'
                      : 'bg-slate-100 text-ink-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-500">
              {!loading && !error && (
                <span>
                  Showing <strong className="text-ink">{filtered.length}</strong> of {complaints.length}
                </span>
              )}
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <SkeletonRows count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={FileX2}
            title="No complaints yet"
            description="Submitted complaints will appear here."
            action={
              <Link to="/submit" className="btn-primary">
                Submit a complaint
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching complaints"
            description="Try a different search term or clear the filters."
            action={
              <button type="button" onClick={clearFilters} className="btn-outline">
                Clear filters
              </button>
            }
          />
        ) : (
          <ComplaintTable complaints={filtered} onSelect={(c) => setSelectedId(c.id)} />
        )}
      </div>

      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Complaint details">
        {selected && <ComplaintDetails complaint={selected} />}
      </Drawer>
    </div>
  );
}
