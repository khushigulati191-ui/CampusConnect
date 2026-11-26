import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Database,
  ExternalLink,
  FilePlus2,
  FlaskConical,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  Loader,
  Lock,
  PackageSearch,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { DEMO_ADMIN, DEMO_STUDENT, useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';

export default function TestConsole() {
  const { user, isAdmin, isTestMode, enableTestMode, disableTestMode, loginAsStudent, loginAsAdmin } = useAuth();
  const { stats, complaints } = useComplaints();
  const { notify } = useToast();
  const navigate = useNavigate();

  // Visiting /test automatically activates developer test mode
  useEffect(() => {
    if (!isTestMode) {
      enableTestMode();
    }
  }, [isTestMode, enableTestMode]);

  const handleLaunchStudent = () => {
    loginAsStudent();
    notify({
      type: 'success',
      title: 'Testing as Student (Riya Sharma)',
      message: 'Switched to Student Portal view. Use the bottom-right floating bar anytime to switch roles.',
    });
    navigate('/');
  };

  const handleLaunchAdmin = () => {
    loginAsAdmin();
    notify({
      type: 'success',
      title: 'Testing as Authority (Dr. Rajesh Verma)',
      message: 'Switched to MSIT Authority Console. Triage complaints and demand student reviews.',
    });
    navigate('/admin');
  };

  const handleExitTestMode = () => {
    disableTestMode();
    notify({
      type: 'info',
      title: 'Exited Test Mode',
      message: 'Returned to regular user mode. Type /test in the URL whenever you want to test again.',
    });
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 right-48 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              <FlaskConical size={14} className="animate-pulse" /> Dedicated Developer Testing Sandbox
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              CampusConnect <span className="text-amber-400">/test</span> Console
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-ink-300 leading-relaxed">
              You are in <strong>Test Mode</strong> (activated by typing <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300 font-mono">/test</code> in the URL). 
              Both the student and authority portals are tested here seamlessly. When actual users visit without typing <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/test</code>, these developer controls are completely hidden.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExitTestMode}
              className="btn rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 inline-flex items-center gap-2 border border-white/15"
            >
              <X size={15} /> Exit Test Mode (Preview as Normal User)
            </button>
          </div>
        </div>
      </section>

      {/* Role Selection / Personas Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" />
            1-Click Test Personas
          </h2>
          <p className="text-xs text-ink-500">
            Switch between the Student and College Authority personas with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Persona 1: Student */}
          <div
            className={`rounded-3xl border-2 p-6 transition shadow-sm ${
              !isAdmin
                ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-800">
                <GraduationCap size={14} /> Student Persona
              </span>
              {!isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 size={12} /> Currently Active
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-tealdeep text-xl font-extrabold text-white shadow-md">
                {DEMO_STUDENT.initials}
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-ink">{DEMO_STUDENT.name}</h3>
                <p className="text-xs font-semibold text-brand-700">{DEMO_STUDENT.department}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-500 font-mono">
                  <span>Roll: {DEMO_STUDENT.rollNo}</span>
                  <span>•</span>
                  <span>{DEMO_STUDENT.collegeCode}</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-600 leading-relaxed">
              Test filing facility grievances with optional descriptions, tracking status updates, reviewing campus fixes, and reporting lost or found items.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLaunchStudent}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 font-bold shadow-sm"
              >
                <span>Launch Student Portal</span>
                <ArrowRight size={15} />
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link
                  to="/submit"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Submit Complaint
                </Link>
                <Link
                  to="/review"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Review & Close ({stats.needsReview})
                </Link>
                <Link
                  to="/track"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Track Status
                </Link>
                <Link
                  to="/lost-and-found"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Lost & Found
                </Link>
              </div>
            </div>
          </div>

          {/* Persona 2: College Authority */}
          <div
            className={`rounded-3xl border-2 p-6 transition shadow-sm ${
              isAdmin
                ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                <Shield size={14} /> College Authority Persona
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 size={12} /> Currently Active
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-600 to-rose-600 text-xl font-extrabold text-white shadow-md">
                {DEMO_ADMIN.initials}
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-ink">{DEMO_ADMIN.name}</h3>
                <p className="text-xs font-semibold text-amber-700">{DEMO_ADMIN.designation}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-500 font-mono">
                  <span>ID: {DEMO_ADMIN.empId}</span>
                  <span>•</span>
                  <span>{DEMO_ADMIN.collegeCode}</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-600 leading-relaxed">
              Test administrative triage, receiving incoming student tickets, dispatching repair crews, and triggering <strong>"Fix Completed &rarr; Demand Student Review"</strong>.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLaunchAdmin}
                className="w-full btn text-xs py-2.5 bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 font-bold shadow-sm"
              >
                <span>Launch Authority Console</span>
                <ArrowRight size={15} />
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link
                  to="/admin"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/review"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Review Desk ({stats.inProgress})
                </Link>
                <Link
                  to="/colleges"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Affiliated Colleges
                </Link>
                <Link
                  to="/history"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 text-center text-xs font-medium text-ink-700"
                >
                  Complete Archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System State & Diagnostic Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Database size={18} className="text-ink-700" />
            Live System Data State (SQLite)
          </h2>
          <p className="text-xs text-ink-500">
            Real-time complaint lifecycle counters currently in the database.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Grievances"
            value={stats.total}
            hint="Recorded in SQLite"
            icon={Inbox}
            tone="bg-brand-50 text-brand-600"
          />
          <StatCard
            label="Under Investigation"
            value={stats.inProgress}
            hint="Initial status / in progress"
            icon={Loader}
            tone="bg-sky-50 text-sky-600"
          />
          <StatCard
            label="Needs Student Review"
            value={stats.needsReview}
            hint="Authority requested closure"
            icon={Clock}
            tone="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Closed & Resolved"
            value={stats.resolved}
            hint="Confirmed by student"
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      {/* Interactive Lifecycle Guide */}
      <section className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-ink text-white">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Wrench size={16} /> How to Test the Complete Lifecycle End-to-End
        </div>
        <h3 className="mt-2 text-xl font-bold">5-Step Testing Procedure</h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="font-mono text-amber-400 font-extrabold text-sm">Step 1</span>
            <p className="mt-2 font-bold text-white">Submit as Student</p>
            <p className="mt-1 text-ink-300">
              Submit a complaint on <Link to="/submit" className="text-amber-300 underline">/submit</Link>. Description is optional. Complaint status is initialized to <strong>In Progress</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="font-mono text-amber-400 font-extrabold text-sm">Step 2</span>
            <p className="mt-2 font-bold text-white">Switch to Authority</p>
            <p className="mt-1 text-ink-300">
              Click the floating bar or button above to switch to <strong>Dr. Rajesh Verma</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="font-mono text-amber-400 font-extrabold text-sm">Step 3</span>
            <p className="mt-2 font-bold text-white">Demand Student Review</p>
            <p className="mt-1 text-ink-300">
              On <Link to="/admin" className="text-amber-300 underline">/admin</Link> or <Link to="/review" className="text-amber-300 underline">/review</Link>, click <strong>"Fix Done &rarr; Demand Review"</strong>. Status moves to <strong>Needs Review</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="font-mono text-amber-400 font-extrabold text-sm">Step 4</span>
            <p className="mt-2 font-bold text-white">Switch to Student</p>
            <p className="mt-1 text-ink-300">
              Switch back to <strong>Riya Sharma</strong>. Notice the notification badge appears under <strong>Review Complaints</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <span className="font-mono text-amber-400 font-extrabold text-sm">Step 5</span>
            <p className="mt-2 font-bold text-white">Confirm & Close</p>
            <p className="mt-1 text-ink-300">
              On <Link to="/review" className="text-amber-300 underline">/review</Link>, click <strong>"Confirm Fixed & Close Complaint"</strong>. Status moves to <strong>Resolved</strong>!
            </p>
          </div>
        </div>
      </section>

      {/* Developer Tools & Endpoints Footer */}
      <section className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-ink">
            <Terminal size={18} />
          </span>
          <div>
            <h4 className="text-sm font-bold text-ink">Backend API & Database Inspection Tools</h4>
            <p className="text-xs text-ink-500">Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-ink-700">python backend/inspect_db.py</code> in terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs px-3 py-2 inline-flex items-center gap-1.5"
          >
            <ExternalLink size={13} /> FastAPI Swagger Docs
          </a>
          <button
            type="button"
            onClick={handleExitTestMode}
            className="btn bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs px-3.5 py-2 font-bold rounded-xl"
          >
            Exit /test
          </button>
        </div>
      </section>
    </div>
  );
}
