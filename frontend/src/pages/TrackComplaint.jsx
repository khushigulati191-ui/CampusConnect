import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SearchX, ShieldQuestion } from 'lucide-react';
import { SAMPLE_TRACK_IDS } from '../constants';
import { complaintService } from '../services/complaintService';
import { normalizeComplaintId } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';
import ComplaintDetails from '../components/complaints/ComplaintDetails';
import { EmptyState, ErrorState, LoadingState, Spinner } from '../components/ui/States';

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = normalizeComplaintId(searchParams.get('id'));

  const [input, setInput] = useState(idParam);
  const [state, setState] = useState({ status: 'idle', complaint: null, message: '' });
  const [attempt, setAttempt] = useState(0);
  const [inputError, setInputError] = useState('');

  // Keep the input in sync when the URL changes (e.g. arriving from another page)
  useEffect(() => {
    setInput(idParam);
  }, [idParam]);

  // Look the complaint up whenever the ?id= param changes (or on retry)
  useEffect(() => {
    if (!idParam) {
      setState({ status: 'idle', complaint: null, message: '' });
      return undefined;
    }

    let cancelled = false;
    setState({ status: 'loading', complaint: null, message: '' });

    complaintService
      .getComplaintById(idParam)
      .then((complaint) => {
        if (!cancelled) setState({ status: 'found', complaint, message: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setState({ status: 'notfound', complaint: null, message: '' });
        } else {
          setState({
            status: 'error',
            complaint: null,
            message: err.message || 'We could not look up that complaint right now.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [idParam, attempt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = normalizeComplaintId(input);
    if (!id) {
      setInputError('Please enter a complaint ID.');
      return;
    }
    setInputError('');
    if (id === idParam) {
      setAttempt((n) => n + 1); // same ID again -> refresh
    } else {
      setSearchParams({ id });
    }
  };

  const pickSample = (id) => {
    setInput(id);
    setInputError('');
    setSearchParams({ id });
  };

  const loading = state.status === 'loading';

  return (
    <div>
      <PageHeader
        title="Track a complaint"
        subtitle="Enter the complaint ID you received when you submitted it to see its current status."
      />

      <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
        <label htmlFor="complaint-id" className="label">
          Complaint ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              id="complaint-id"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. CMP-2026-0005"
              autoComplete="off"
              spellCheck={false}
              className="input rounded-full py-3 pl-11 font-mono tracking-wide"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-dark rounded-full px-7 py-3">
            {loading ? <Spinner /> : <Search size={16} />}
            Track
          </button>
        </div>
        {inputError && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {inputError}
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-500">
          Try a sample:
          {SAMPLE_TRACK_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => pickSample(id)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono font-semibold text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {id}
            </button>
          ))}
        </p>
      </form>

      <div className="mt-6">
        {state.status === 'idle' && (
          <div className="card">
            <EmptyState
              icon={ShieldQuestion}
              title="Where is my complaint?"
              description="Type your complaint ID above to see its status, submission date and full history."
              action={
                <Link to="/submit" className="btn-outline">
                  Or submit a new complaint
                </Link>
              }
            />
          </div>
        )}

        {loading && (
          <div className="card">
            <LoadingState label="Looking up your complaint…" />
          </div>
        )}

        {state.status === 'notfound' && (
          <div className="card">
            <EmptyState
              icon={SearchX}
              title="No complaint found"
              description={`We couldn't find a complaint with the ID “${idParam}”. Check the ID for typos and try again.`}
              action={
                <Link to="/history" className="btn-outline">
                  Browse complaint history
                </Link>
              }
            />
          </div>
        )}

        {state.status === 'error' && (
          <div className="card">
            <ErrorState message={state.message} onRetry={() => setAttempt((n) => n + 1)} />
          </div>
        )}

        {state.status === 'found' && state.complaint && (
          <div className="card animate-slide-up p-5 sm:p-8">
            <ComplaintDetails complaint={state.complaint} />
          </div>
        )}
      </div>
    </div>
  );
}
