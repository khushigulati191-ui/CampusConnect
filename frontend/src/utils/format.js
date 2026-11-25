const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d);
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormatter.format(d);
}

/** "5 min ago", "3 hr ago", "2 days ago" */
export function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** Compact waiting time, e.g. "9d 4h" or "3h". */
export function waitingTime(iso) {
  if (!iso) return '';
  const diffMs = Math.max(0, Date.now() - new Date(iso).getTime());
  const hrsTotal = Math.floor(diffMs / 3600000);
  const days = Math.floor(hrsTotal / 24);
  const hrs = hrsTotal % 24;
  if (days > 0) return `${days}d ${hrs}h`;
  if (hrsTotal > 0) return `${hrsTotal}h`;
  return `${Math.max(1, Math.floor(diffMs / 60000))}m`;
}

export function normalizeComplaintId(value) {
  return String(value || '').trim().toUpperCase();
}
