import { STATUS_META } from '../../constants';

/**
 * Coloured pill for a complaint status.
 * `variant="queue"` swaps the label for queue wording (Waiting / Processing / Served).
 */
export default function StatusBadge({ status, variant = 'default', className = '' }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const label = variant === 'queue' ? meta.queueLabel : meta.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.pill} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {label}
    </span>
  );
}
