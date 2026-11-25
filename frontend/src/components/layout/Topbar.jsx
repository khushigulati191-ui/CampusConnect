import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { CURRENT_USER } from '../../constants';
import { useComplaints } from '../../context/ComplaintsContext';

export default function Topbar({ onMenuClick }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { stats } = useComplaints();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/history?q=${encodeURIComponent(q)}` : '/history');
    setQuery('');
  };

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
            to="/queue"
            aria-label={`Open queue, ${stats.active} complaints waiting`}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink transition hover:bg-slate-50"
          >
            <Bell size={18} />
            {stats.active > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
            )}
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-tealdeep text-sm font-bold text-white">
              {CURRENT_USER.initials}
            </span>
            <div className="hidden leading-tight md:block">
              <p className="text-sm font-semibold">{CURRENT_USER.name}</p>
              <p className="text-xs text-ink-500">{CURRENT_USER.rollNo}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
