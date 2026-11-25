import { CATEGORIES, CATEGORY_META } from '../../constants';

/** Horizontal bars showing how many complaints each category has. */
export default function CategoryBreakdown({ complaints }) {
  const counts = CATEGORIES.map((category) => ({
    category,
    count: complaints.filter((c) => c.category === category).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <ul className="space-y-4">
      {counts.map(({ category, count }) => {
        const meta = CATEGORY_META[category];
        const Icon = meta.icon;
        return (
          <li key={category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Icon size={14} className="text-ink-500" />
                {category}
              </span>
              <span className="font-bold">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${meta.bar}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
