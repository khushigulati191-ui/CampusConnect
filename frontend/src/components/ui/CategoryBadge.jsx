import { CATEGORY_META } from '../../constants';

export default function CategoryBadge({ category, className = '' }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${meta.tone} ${className}`}
    >
      <Icon size={13} />
      {category}
    </span>
  );
}
