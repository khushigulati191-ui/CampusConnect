import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_META, STATUS_META } from '../../constants';
import StatusBadge from '../ui/StatusBadge';
import { timeAgo } from '../../utils/format';

/** Latest updates across all complaints (most recently touched first). */
export default function RecentActivity({ complaints, limit = 6 }) {
  const items = [...complaints]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((c) => {
        const Icon = (CATEGORY_META[c.category] || CATEGORY_META.Other).icon;
        const tone = (CATEGORY_META[c.category] || CATEGORY_META.Other).tone;
        const last = c.timeline[c.timeline.length - 1];
        const action =
          last?.status === 'Pending'
            ? 'submitted'
            : `marked ${STATUS_META[c.status]?.label.toLowerCase()}`;

        return (
          <li key={c.id}>
            <Link
              to={`/track?id=${encodeURIComponent(c.id)}`}
              className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-brand-700">{c.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-500">
                  <span className="font-mono">{c.id}</span> · {action} {timeAgo(c.updatedAt)}
                </p>
              </div>
              <StatusBadge status={c.status} className="hidden sm:inline-flex" />
              <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
