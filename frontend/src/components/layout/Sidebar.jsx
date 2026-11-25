import { NavLink, Link } from 'react-router-dom';
import { GraduationCap, LifeBuoy, X } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';
import { useComplaints } from '../../context/ComplaintsContext';

export default function Sidebar({ open, onClose }) {
  const { stats } = useComplaints();

  return (
    <>
      {/* Mobile / tablet backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink px-5 py-6 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 shadow-lg shadow-brand-900/40">
              <GraduationCap size={22} />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">Campus Helpdesk</span>
              <span className="block text-xs text-ink-300">Smart complaint system</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-ink-300 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="mt-12 flex-1 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, showQueueCount }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-2 py-1.5 text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-ink-300 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
                      isActive
                        ? 'border-white bg-white text-ink'
                        : 'border-white/15 bg-white/5 group-hover:border-white/30'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="flex-1">{label}</span>
                  {showQueueCount && stats.active > 0 && (
                    <span className="grid min-w-[1.5rem] place-items-center rounded-full bg-coral px-1.5 py-0.5 text-[11px] font-bold">
                      {stats.active}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative mt-6 overflow-hidden rounded-3xl bg-white/10 p-5">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-500/30" aria-hidden="true" />
          <div className="absolute -bottom-10 right-6 h-20 w-20 rounded-full bg-coral/20" aria-hidden="true" />
          <LifeBuoy size={22} className="relative text-brand-300" />
          <p className="relative mt-3 text-base font-semibold leading-snug">
            Need urgent help on campus?
          </p>
          <p className="relative mt-1 text-xs text-ink-300">
            Reach the helpdesk team directly for emergencies.
          </p>
          <a
            href="mailto:helpdesk@smartcampus.edu"
            className="relative mt-4 block rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-brand-50"
          >
            Contact helpdesk
          </a>
        </div>
      </aside>
    </>
  );
}
