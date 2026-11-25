import { Check } from 'lucide-react';
import { STATUS_FLOW, STATUS_META } from '../../constants';

/** Three-step progress indicator: Pending -> In Progress -> Resolved. */
export default function StatusStepper({ status }) {
  const current = STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex items-start" aria-label="Complaint progress">
      {STATUS_FLOW.map((step, i) => {
        const meta = STATUS_META[step];
        const done = i < current || (i === current && step === STATUS_FLOW[STATUS_FLOW.length - 1]);
        const active = i === current && !done;
        const Icon = meta.icon;
        const isLast = i === STATUS_FLOW.length - 1;

        return (
          <li key={step} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={`grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                      ? `border-transparent ${meta.solid} ring-4 ring-slate-100`
                      : 'border-slate-200 bg-white text-ink-300'
                }`}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </span>
              <span
                className={`text-xs font-semibold ${
                  done || active ? 'text-ink' : 'text-ink-400'
                }`}
              >
                {meta.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 mt-5 h-0.5 flex-1 rounded-full ${
                  i < current ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
