import { Calendar, Hash, MapPin, RefreshCw, User, GraduationCap } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import CategoryBadge from '../ui/CategoryBadge';
import StatusStepper from './StatusStepper';
import ComplaintTimeline from './ComplaintTimeline';
import { formatDate, formatDateTime } from '../../utils/format';

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold">{value || '—'}</p>
      </div>
    </div>
  );
}

/** Full read-only view of one complaint. Used on the Track page and inside drawers. */
export default function ComplaintDetails({ complaint }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-white">
            {complaint.id}
          </span>
          <StatusBadge status={complaint.status} />
          <CategoryBadge category={complaint.category} />
        </div>
        <h2 className="mt-3 text-xl font-extrabold leading-snug tracking-tight">{complaint.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
          {complaint.description}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <StatusStepper status={complaint.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem icon={Calendar} label="Submitted on" value={formatDate(complaint.createdAt)} />
        <InfoItem icon={RefreshCw} label="Last updated" value={formatDateTime(complaint.updatedAt)} />
        <InfoItem icon={User} label="Student" value={complaint.studentName} />
        <InfoItem icon={Hash} label="Roll number" value={complaint.rollNo} />
        <InfoItem icon={GraduationCap} label="Department" value={complaint.department} />
        <InfoItem icon={MapPin} label="Location" value={complaint.location} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold">Activity</h3>
        <ComplaintTimeline events={complaint.timeline} />
      </div>
    </div>
  );
}
