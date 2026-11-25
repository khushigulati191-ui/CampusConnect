import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { AFFILIATED_COLLEGES, DEMO_ADMIN, DEMO_STUDENT, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsStudent, loginAsAdmin } = useAuth();
  const { notify } = useToast();

  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedCollege, setSelectedCollege] = useState('MSIT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (selectedRole === 'student') {
      login({
        ...DEMO_STUDENT,
        email: email || DEMO_STUDENT.email,
        collegeCode: selectedCollege,
        collegeName: AFFILIATED_COLLEGES.find((c) => c.code === selectedCollege)?.name,
      });
      notify({ type: 'success', title: 'Student Login Successful', message: 'Welcome to CampusConnect Student Portal.' });
      navigate('/');
    } else {
      login({
        ...DEMO_ADMIN,
        email: email || DEMO_ADMIN.email,
        collegeCode: selectedCollege,
        collegeName: AFFILIATED_COLLEGES.find((c) => c.code === selectedCollege)?.name,
      });
      notify({ type: 'success', title: 'Authority Login Successful', message: 'Welcome to CampusConnect Authority Console.' });
      navigate('/admin');
    }
  };

  const handleDemoStudent = () => {
    loginAsStudent();
    notify({
      type: 'success',
      title: 'Signed in as Student',
      message: `Welcome, ${DEMO_STUDENT.name} (${DEMO_STUDENT.rollNo} · ${DEMO_STUDENT.collegeCode}).`,
    });
    navigate('/');
  };

  const handleDemoAdmin = () => {
    loginAsAdmin();
    notify({
      type: 'success',
      title: 'Signed in as College Authority',
      message: `Welcome, ${DEMO_ADMIN.name} (${DEMO_ADMIN.designation} · ${DEMO_ADMIN.collegeCode}).`,
    });
    navigate('/admin');
  };

  const college = AFFILIATED_COLLEGES.find((c) => c.code === selectedCollege) || AFFILIATED_COLLEGES[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-900/30">
            <GraduationCap size={28} />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-2xl font-black tracking-tight text-ink">CampusConnect</span>
            <span className="block text-xs font-semibold text-brand-600">Smart Campus Portal</span>
          </span>
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-ink sm:text-2xl">
          Sign In to Your Campus Portal
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Centralized grievance reporting & campus helpdesk management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        {/* Affiliated College Banner */}
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Building2 size={20} />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Affiliated College</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                <CheckCircle2 size={11} /> Verified Partner
              </span>
            </div>
            <p className="text-sm font-bold text-ink truncate">{college.name} ({college.shortName})</p>
            <p className="text-[11px] text-ink-500">{college.city} · Domain: {college.domain}</p>
          </div>
        </div>

        {/* Developer 1-Click Testing Box */}
        <div className="mb-6 rounded-3xl border-2 border-brand-200 bg-brand-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
              Developer Quick Testing (1-Click Login)
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-600">
            Click either sample account below to test the corresponding experience instantly:
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student Card */}
            <button
              type="button"
              onClick={handleDemoStudent}
              className="group flex items-center gap-3 rounded-2xl border border-brand-200 bg-white p-3.5 text-left shadow-sm transition hover:border-brand-500 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm group-hover:scale-105 transition">
                {DEMO_STUDENT.initials}
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-brand-700 uppercase tracking-wider">Student Role</span>
                <span className="block text-sm font-extrabold text-ink truncate">{DEMO_STUDENT.name}</span>
                <span className="block text-[11px] text-ink-500 truncate">{DEMO_STUDENT.rollNo} · {DEMO_STUDENT.collegeCode}</span>
              </div>
              <ArrowRight size={16} className="text-brand-400 group-hover:translate-x-1 group-hover:text-brand-700 transition" />
            </button>

            {/* Admin Card */}
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3.5 text-left shadow-sm transition hover:border-amber-500 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-600 text-sm font-bold text-white shadow-sm group-hover:scale-105 transition">
                {DEMO_ADMIN.initials}
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-amber-700 uppercase tracking-wider">College Authority</span>
                <span className="block text-sm font-extrabold text-ink truncate">{DEMO_ADMIN.name}</span>
                <span className="block text-[11px] text-ink-500 truncate">{DEMO_ADMIN.designation}</span>
              </div>
              <ArrowRight size={16} className="text-amber-500 group-hover:translate-x-1 group-hover:text-amber-700 transition" />
            </button>
          </div>
        </div>

        {/* Regular Login Form Card */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-xs font-bold transition ${
                    selectedRole === 'student'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300 text-ink-600'
                  }`}
                >
                  <User size={15} /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-xs font-bold transition ${
                    selectedRole === 'admin'
                      ? 'border-amber-600 bg-amber-50/50 text-amber-700'
                      : 'border-slate-200 hover:border-slate-300 text-ink-600'
                  }`}
                >
                  <ShieldCheck size={15} /> College Authority
                </button>
              </div>
            </div>

            {/* Affiliated College Select */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Affiliated Institute
              </label>
              <div className="relative">
                <Building2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="input pl-10"
                >
                  {AFFILIATED_COLLEGES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email / ID */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                {selectedRole === 'student' ? 'Student College Email / Roll Number' : 'Authority Work Email / Employee ID'}
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder={selectedRole === 'student' ? '22CS1042 or riya.sharma@msit.in' : 'admin.grievance@msit.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full btn rounded-xl py-3 text-white font-bold transition shadow-sm ${
                selectedRole === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-brand-600 hover:bg-brand-500'
              }`}
            >
              Sign In as {selectedRole === 'student' ? 'Student' : 'Authority'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
