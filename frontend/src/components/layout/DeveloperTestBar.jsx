import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Shield,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DeveloperTestBar() {
  const { isTestMode, disableTestMode, switchRole, user, isAdmin } = useAuth();
  const { notify } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  if (!isTestMode) return null;

  const handleSwitch = () => {
    switchRole();
    const nextRole = isAdmin ? 'Student (Riya Sharma)' : 'Authority (Dr. Rajesh Verma)';
    notify({
      type: 'success',
      title: 'Test Persona Switched',
      message: `Now viewing and testing as: ${nextRole}`,
    });
    // Navigate to appropriate home view
    if (isAdmin) {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  const handleExit = () => {
    disableTestMode();
    notify({
      type: 'info',
      title: 'Exited Test Mode',
      message: 'Viewing regular production interface. Type /test in the URL anytime to reopen.',
    });
  };

  if (collapsed) {
    return (
      <aside
        aria-label="Developer test controls"
        className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 rounded-full border border-amber-300 bg-amber-500/95 px-3 py-1.5 text-white shadow-xl backdrop-blur transition hover:bg-amber-600"
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 text-xs font-bold"
          title="Expand Developer Test Controls"
        >
          <FlaskConical size={14} className="animate-bounce" />
          <span>Test Mode ({isAdmin ? 'Admin' : 'Student'})</span>
          <ChevronUp size={14} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Developer test suite"
      className="fixed bottom-4 right-4 z-[999] flex flex-col sm:flex-row items-center gap-2.5 rounded-2xl border-2 border-amber-400 bg-ink/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur animate-slide-up"
    >
      {/* Test Mode Badge */}
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-ink font-black shadow-sm">
          <FlaskConical size={16} />
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            URL /test Active
          </div>
          <p className="text-xs font-bold text-white flex items-center gap-1">
            {isAdmin ? (
              <>
                <Shield size={12} className="text-amber-400" />
                <span>Dr. Rajesh Verma (Authority)</span>
              </>
            ) : (
              <>
                <User size={12} className="text-brand-400" />
                <span>Riya Sharma (Student)</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="hidden sm:block h-6 w-px bg-white/20" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleSwitch}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink text-xs font-extrabold px-3 py-1.5 shadow-sm transition"
          title="Switch between Student and Authority views"
        >
          <ArrowRightLeft size={13} />
          <span>Switch to {isAdmin ? 'Student' : 'Authority'}</span>
        </button>

        <Link
          to="/test"
          className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-2.5 py-1.5 transition"
          title="Open Developer Test Console"
        >
          <Wrench size={13} />
          <span>Console</span>
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1 text-ink-300 hover:text-white hover:bg-white/10 transition"
          title="Minimize bar"
        >
          <ChevronDown size={14} />
        </button>

        <button
          type="button"
          onClick={handleExit}
          className="rounded-lg p-1 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition"
          title="Exit Test Mode (Hide testing controls)"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
