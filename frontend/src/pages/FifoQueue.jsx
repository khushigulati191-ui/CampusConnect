import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, ListChecks, MapPin, PlayCircle } from 'lucide-react';
import { STATUS, STATUS_META } from '../constants';
import { useComplaints } from '../context/ComplaintsContext';
import { useToast } from '../context/ToastContext';
import { getNextStatus } from '../services/complaintService';
import PageHeader from '../components/ui/PageHeader';
import Drawer from '../components/ui/Drawer';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryBadge from '../components/ui/CategoryBadge';
import { EmptyState, ErrorState, SkeletonRows, Spinner } from '../components/ui/States';
import ComplaintDetails from '../components/complaints/ComplaintDetails';
import { formatDate, waitingTime } from '../utils/format';

const TABS = [
  { key: 'All', label: 'All' },
  { key: STATUS.PENDING, label: 'Waiting' },
  { key: STATUS.IN_PROGRESS, label: 'Processing' },
  { key: STATUS.RESOLVED, label: 'Served' },
];

function SummaryTile({ label, value, status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${meta.soft}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-xs font-semibold text-ink-500">{label}</p>
      </div>
    </div>
  );
}

export default function FifoQueue() {
  const { fifo, stats, loading, error, reload, changeStatus } = useComplaints();
  const { notify } = useToast();
  const [tab, setTab] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Queue position is only given to unresolved complaints, oldest first
  const positions = new Map();
  fifo
    .filter((c) => c.status !== STATUS.RESOLVED)
    .forEach((c, i) => positions.set(c.id, i + 1));

  const front = fifo.find((c) => c.status !== STATUS.RESOLVED) || null;
  const nextToProcess = fifo.find((c) => c.status === STATUS.PENDING) || null;
  const visible = tab === 'All' ? fifo : fifo.filter((c) => c.status === tab);
  const selected = fifo.find((c) => c.id === selectedId) || null;
  const selectedNext = selected ? getNextStatus(selected.status) : null;

  const advance = async (complaint) => {
    const next = getNextStatus(complaint.status);
    if (!next || busy) return;
    setBusy(true);
    try {
      await changeStatus(complaint.id, next);
      notify({
        type: 'success',
        title: `${complaint.id} moved to ${next}`,
        message: complaint.title,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Could not update status', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="FIFO complaint queue"
        subtitle="First In, First Out: the oldest unresolved complaint is always at the front and is handled first."
        actions={
          <button
            type="button"
            onClick={() => nextToProcess && advance(nextToProcess)}
            disabled={!nextToProcess || busy || loading}
            className="btn-primary"
            title="Demo action: starts work on the oldest waiting complaint"
          >
            {busy ? <Spinner /> : <PlayCircle size={17} />}
            Process next in queue
          </button>
        }
      />

      {error ? (
        <div className="card">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile label="Waiting in queue" value={loading ? '–' : stats.pending} status={STATUS.PENDING} />
            <SummaryTile label="Being processed" value={loading ? '–' : stats.inProgress} status={STATUS.IN_PROGRESS} />
            <SummaryTile label="Served (resolved)" value={loading ? '–' : stats.resolved} status={STATUS.RESOLVED} />
          </div>

          {/* Front of the queue */}
          {!loading && front && (
            <button
              type="button"
              onClick={() => setSelectedId(front.id)}
              className="group relative mt-6 block w-full overflow-hidden rounded-3xl bg-ink p-5 text-left text-white transition hover:shadow-pop sm:p-6"
            >
              <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-brand-600/40 blur-2xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-extrabold text-ink">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-300">Front of the queue</p>
                  <p className="mt-1 truncate text-lg font-bold">{front.title}</p>
                  <p className="mt-1 text-sm text-ink-300">
                    <span className="font-mono">{front.id}</span> · submitted {formatDate(front.createdAt)} · waiting{' '}
                    {waitingTime(front.createdAt)}
                  </p>
                </div>
                <StatusBadge status={front.status} variant="queue" />
                <ArrowRight className="hidden text-ink-300 transition group-hover:translate-x-1 sm:block" size={20} />
              </div>
            </button>
          )}

          {/* Queue list */}
          <div className="card mt-6 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter queue by status">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    aria-pressed={tab === key}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      tab === key ? 'bg-ink text-white' : 'bg-slate-100 text-ink-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium text-ink-500">
                Oldest first · positions apply to unresolved complaints
              </p>
            </div>

            {loading ? (
              <SkeletonRows count={6} />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title={fifo.length === 0 ? 'The queue is empty' : 'Nothing in this view'}
                description={
                  fifo.length === 0
                    ? 'New complaints will join the queue here.'
                    : 'No complaints match this status right now.'
                }
                action={
                  fifo.length === 0 ? (
                    <Link to="/submit" className="btn-primary">
                      Submit a complaint
                    </Link>
                  ) : (
                    <button type="button" onClick={() => setTab('All')} className="btn-outline">
                      Show all
                    </button>
                  )
                }
              />
            ) : (
              <ol className="divide-y divide-slate-100">
                {visible.map((c) => {
                  const position = positions.get(c.id);
                  const meta = STATUS_META[c.status];
                  const resolved = c.status === STATUS.RESOLVED;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5 ${
                          resolved ? 'opacity-70' : ''
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                            resolved ? meta.soft : meta.solid
                          }`}
                          aria-label={resolved ? 'Served' : `Queue position ${position}`}
                        >
                          {resolved ? <Check size={18} /> : `#${position}`}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-xs font-semibold text-ink-500">{c.id}</span>
                            <CategoryBadge category={c.category} />
                          </div>
                          <p className="mt-1 truncate font-semibold">{c.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} /> {c.location}
                            </span>
                            <span>Submitted {formatDate(c.createdAt)}</span>
                            {!resolved && <span className="font-semibold text-ink-600">Waiting {waitingTime(c.createdAt)}</span>}
                          </p>
                        </div>

                        <StatusBadge status={c.status} variant="queue" className="hidden sm:inline-flex" />
                        <ChevronRight size={18} className="shrink-0 text-ink-300" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={
          selected && positions.get(selected.id)
            ? `Queue position #${positions.get(selected.id)}`
            : 'Complaint details'
        }
        footer={
          selected && selectedNext ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-500">Demo staff action – this will be an admin-only call to your backend.</p>
              <button type="button" onClick={() => advance(selected)} disabled={busy} className="btn-dark">
                {busy ? <Spinner /> : <ArrowRight size={16} />}
                Move to {selectedNext}
              </button>
            </div>
          ) : null
        }
      >
        {selected && <ComplaintDetails complaint={selected} />}
      </Drawer>
    </div>
  );
}
