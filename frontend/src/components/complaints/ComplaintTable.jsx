import { ChevronRight, MapPin } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CategoryBadge from '../ui/CategoryBadge';
import { formatDate } from '../../utils/format';

/**
 * Responsive complaint list:
 *  - md and up: a table
 *  - below md: stacked cards
 */
export default function ComplaintTable({ complaints, onSelect }) {
  return (
    <>
      {/* Table (tablet / desktop) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold text-ink-400">
              <th className="px-5 py-3 font-semibold">Complaint ID</th>
              <th className="px-3 py-3 font-semibold">Title</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="cursor-pointer transition hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-ink-600">
                  {c.id}
                </td>
                <td className="max-w-xs px-3 py-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className="block max-w-full truncate text-left font-semibold hover:text-brand-700"
                  >
                    {c.title}
                  </button>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500">
                    <MapPin size={12} /> {c.location}
                  </p>
                </td>
                <td className="px-3 py-4">
                  <CategoryBadge category={c.category} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-ink-600">{formatDate(c.createdAt)}</td>
                <td className="px-3 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-3 py-4 text-ink-300">
                  <ChevronRight size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {complaints.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className="block w-full px-4 py-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-ink-500">{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-2 font-semibold leading-snug">{c.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={c.category} />
                <span className="text-xs text-ink-500">{formatDate(c.createdAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
