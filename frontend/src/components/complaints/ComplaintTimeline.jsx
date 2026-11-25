import { STATUS_META } from '../../constants';
import { formatDateTime } from '../../utils/format';

/** Vertical list of status changes, newest first. */
export default function ComplaintTimeline({ events = [] }) {
  if (!events.length) return null;
  const ordered = [...events].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <ol className="relative space-y-5 border-l-2 border-slate-100 pl-6">
      {ordered.map((event, i) => {
        const meta = STATUS_META[event.status];
        return (
          <li key={`${event.status}-${event.at}-${i}`} className="relative">
            <span
              className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                meta ? meta.dot : 'bg-slate-300'
              }`}
            />
            <p className="text-sm font-semibold">{meta ? meta.label : event.status}</p>
            <p className="mt-0.5 text-sm text-ink-500">{event.note}</p>
            <p className="mt-1 text-xs font-medium text-ink-400">{formatDateTime(event.at)}</p>
          </li>
        );
      })}
    </ol>
  );
}
