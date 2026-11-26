import { NavLink, Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  Building2,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  History,
  LayoutDashboard,
  LifeBuoy,
  PackageSearch,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';

export default function Sidebar({ open, onClose }) {
  const { stats } = useComplaints();
  const { user, isAdmin, switchRole, activeCollege, isTestMode } = useAuth();

  const studentNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/submit', label: 'Submit Complaint', icon: FilePlus2 },
    { to: '/track', label: 'Track Complaint', icon: Search },
    { to: '/review', label: 'Review Complaints', icon: ClipboardCheck, showPendingCount: true },
    { to: '/history', label: 'Complaint History', icon: History },
    { to: '/lost-and-found', label: 'Lost & Found', icon: PackageSearch },
  ];

  const adminNav = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
    { to: '/review', label: 'Review Desk', icon: ClipboardCheck, showPendingCount: true },
    { to: '/history', label: 'Complaints Archive', icon: History },
    { to: '/lost-and-found', label: 'Lost & Found Registry', icon: PackageSearch },
    { to: '/colleges', label: 'Affiliated Colleges', icon: Building2 },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

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
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-3" onClick={onClose}>
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl shadow-lg ${
                isAdmin
                  ? 'bg-amber-600 shadow-amber-900/40'
                  : 'bg-brand-600 shadow-brand-900/40'
              }`}
            >
              {isAdmin ? <Shield size={22} /> : <GraduationCap size={22} />}
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">CampusConnect</span>
              <span className="block text-[11px] font-semibold text-amber-300">
                {isAdmin ? 'MSIT Authority Console' : 'MSIT Student Portal'}
              </span>
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

        {/* Navigation */}
        <nav aria-label="Main navigation" className="mt-8 flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end, showPendingCount }) => (
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
                  {showPendingCount && (
                    (isAdmin ? stats.inProgress : stats.needsReview) > 0 && (
                      <span className="grid min-w-[1.5rem] place-items-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {isAdmin ? stats.inProgress : stats.needsReview}
                      </span>
                    )
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Role Quick Switcher for Developer Testing (Only visible when /test mode is active) */}
        {isTestMode && (
          <div className="mt-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 p-3">
            <div className="flex items-center justify-between text-[11px] text-amber-300">
              <span className="font-extrabold uppercase tracking-wider">🧪 /test Active</span>
              <Link to="/test" onClick={onClose} className="text-[10px] text-amber-400 hover:underline">
                Open Console
              </Link>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-white">
              <span>Current Role:</span>
              <span className="font-bold text-amber-300">{isAdmin ? 'Authority' : 'Student'}</span>
            </div>
            <button
              type="button"
              onClick={switchRole}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-1.5 text-xs font-extrabold text-ink hover:bg-amber-400 transition shadow-sm"
            >
              <ArrowRightLeft size={13} />
              Switch to {isAdmin ? 'Student' : 'Authority'}
            </button>
          </div>
        )}

        {/* Support Card */}
        <div className="relative mt-4 overflow-hidden rounded-3xl bg-white/10 p-4">
          <LifeBuoy size={20} className="relative text-brand-300" />
          <p className="relative mt-2 text-sm font-semibold leading-snug">
            {activeCollege?.shortName || 'MSIT'} Helpdesk
          </p>
          <p className="relative mt-0.5 text-[11px] text-ink-300">
            Janakpuri Campus, New Delhi
          </p>
        </div>
      </aside>
    </>
  );
}
