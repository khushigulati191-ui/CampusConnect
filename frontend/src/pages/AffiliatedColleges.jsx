import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AFFILIATED_COLLEGES, useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { request } from '../services/api';

export default function AffiliatedColleges() {
  const { activeCollege } = useAuth();
  const [colleges, setColleges] = useState(AFFILIATED_COLLEGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadColleges() {
      try {
        const data = await request('/colleges');
        if (Array.isArray(data) && data.length > 0) {
          setColleges(data);
        }
      } catch {
        // fallback to pre-seeded MSIT
      }
    }
    loadColleges();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliated Colleges Directory"
        subtitle="Institutions officially partnered with CampusConnect. Only students and authorities of affiliated colleges can access campus services."
      />

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Authorized Campus Partners</h2>
            <p className="text-xs text-ink-500">Every published deployment validates user credentials against this list.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
            <ShieldCheck size={14} /> {colleges.length} Active College Affiliated
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {colleges.map((col) => (
            <div
              key={col.code}
              className="rounded-2xl border-2 border-brand-100 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm hover:border-brand-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white font-black text-lg shadow-md shadow-brand-900/20">
                    {col.shortName || col.code}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink leading-snug">{col.name}</h3>
                    <span className="font-mono text-xs font-bold text-brand-700">Code: {col.code}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={12} /> {col.status || 'Active'}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-ink-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-ink-400 shrink-0" />
                  <span>{col.city || 'Janakpuri, New Delhi'} {col.state ? `(${col.state})` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-ink-400 shrink-0" />
                  <span>Authorized Domain: <strong className="font-mono text-ink-800">@{col.domain || 'msit.in'}</strong></span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-brand-50/60 p-3 text-[11px] text-brand-900 leading-relaxed">
                <strong>Test Case Institution:</strong> Primary testing campus for student grievances, department dispatch, and lost & found management.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
