import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Bell,
  Building2,
  ChevronDown,
  GraduationCap,
  History,
  LogIn,
  LogOut,
  Mail,
  Menu,
  PackageSearch,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { useToast } from '../../context/ToastContext';

export default function Topbar({ onMenuClick }) {
  const [query, setQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, switchRole, isAdmin } = useAuth();
  const { stats, complaints } = useComplaints();
  const { notify } = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/history?q=${encodeURIComponent(q)}` : '/history');
    setQuery('');
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    notify({
      type: 'info',
      title: 'Logged out',
      message: 'You have been logged out of CampusConnect.',
    });
    navigate('/login');
  };

  const handleSwitchRole = () => {
    switchRole();
    setShowProfile(false);
    notify({
      type: 'success',
      title: 'Role switched',
      message: `Now viewing as ${user?.role === 'admin' ? 'Student' : 'Authority / Admin'}.`,
    });
  };

  const myComplaintsCount = complaints.filter(
    (c) =>
      c.rollNo?.toUpperCase() === user?.rollNo?.toUpperCase() ||
      c.studentName?.toLowerCase() === user?.name?.toLowerCase()
  ).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearch} role="search" className="relative flex-1 sm:max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search complaints by ID, title or location…"
            aria-label="Search complaints"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/review"
            aria-label={`Open review, ${stats.pending} complaints pending`}
            title="Review Complaints"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink transition hover:bg-slate-50"
          >
            <Bell size={18} />
            {stats.pending > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </Link>

          {/* Profile Trigger Button */}
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2.5 rounded-2xl p-1.5 transition hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white shadow-sm ${
                  isAdmin
                    ? 'bg-gradient-to-br from-amber-600 to-rose-600'
                    : 'bg-gradient-to-br from-brand-500 to-tealdeep'
                }`}
              >
                {user.initials}
              </span>
              <div className="hidden text-left leading-tight md:block">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  <ChevronDown size={14} className="text-ink-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span>{user.rollNo || user.empId}</span>
                  <span>•</span>
                  <span className="font-bold text-brand-700">{isAdmin ? 'Authority' : 'Student'}</span>
                </div>
              </div>
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <LogIn size={15} /> Log In
            </Link>
          )}
        </div>
      </div>

      {/* Profile Modal - Using createPortal directly to document.body for dead-center positioning! */}
      {showProfile && user &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
            <div
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-ink-700">
                  <Shield size={18} className={isAdmin ? 'text-amber-600' : 'text-brand-600'} />
                  <h2 className="text-base font-bold text-ink">
                    {isAdmin ? 'Authority Profile' : 'Student Profile'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="rounded-xl p-1.5 text-ink-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Profile Hero Card */}
              <div
                className={`mt-5 flex items-center gap-4 rounded-2xl p-4 border ${
                  isAdmin
                    ? 'bg-amber-50/50 border-amber-200/60'
                    : 'bg-gradient-to-br from-brand-50 to-indigo-50/40 border-brand-100/70'
                }`}
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-2xl text-xl font-extrabold text-white shadow-md ${
                    isAdmin
                      ? 'bg-gradient-to-br from-amber-600 to-rose-600'
                      : 'bg-gradient-to-br from-brand-600 to-tealdeep'
                  }`}
                >
                  {user.initials}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{user.name}</h3>
                  <p className="text-xs font-semibold text-brand-700">
                    {user.designation || user.department}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-500">
                    <span className="font-mono font-bold text-ink-700">
                      {user.rollNo || user.empId}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">
                      {user.collegeCode || 'MSIT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Affiliated College Banner */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/70 p-2.5 text-xs text-ink-600">
                <Building2 size={16} className="text-brand-600 shrink-0" />
                <div className="truncate leading-tight">
                  <p className="font-bold text-ink truncate">{user.collegeName || 'Maharaja Surajmal Institute of Technology'}</p>
                  <p className="text-[11px] text-ink-400">Affiliated Campus • Janakpuri, New Delhi</p>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="mt-4 space-y-2 text-xs text-ink-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2">
                  <span className="flex items-center gap-2 text-ink-500">
                    <Mail size={14} /> Email
                  </span>
                  <span className="font-medium text-ink">{user.email}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2">
                  <span className="flex items-center gap-2 text-ink-500">
                    <GraduationCap size={14} /> Department
                  </span>
                  <span className="font-medium text-ink">{user.department}</span>
                </div>
                {!isAdmin && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2">
                    <span className="flex items-center gap-2 text-ink-500">
                      <History size={14} /> Complaints Submitted
                    </span>
                    <span className="font-bold text-brand-700">{myComplaintsCount} Complaints</span>
                  </div>
                )}
              </div>

              {/* Developer Testing: Switch Role Button */}
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Developer Testing Switch
                </p>
                <button
                  type="button"
                  onClick={handleSwitchRole}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 py-2 text-xs font-bold text-ink-700 hover:bg-slate-100 transition shadow-sm"
                >
                  <ArrowRightLeft size={14} />
                  Switch to {isAdmin ? 'Student (Riya Sharma)' : 'Authority (Dr. Rajesh Verma)'}
                </button>
              </div>

              {/* Quick Links */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to={isAdmin ? '/review' : '/history'}
                  onClick={() => setShowProfile(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-ink-700 hover:bg-slate-50 transition"
                >
                  <History size={14} /> {isAdmin ? 'Review Desk' : 'My Complaints'}
                </Link>
                <Link
                  to="/lost-and-found"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-ink-700 hover:bg-slate-50 transition"
                >
                  <PackageSearch size={14} /> Lost & Found
                </Link>
              </div>

              {/* Logout Action */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
