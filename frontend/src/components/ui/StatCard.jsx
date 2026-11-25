export default function StatCard({ label, value, hint, icon: Icon, tone = 'bg-brand-50 text-brand-600' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-4xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-ink-500">{hint}</p>}
    </div>
  );
}
