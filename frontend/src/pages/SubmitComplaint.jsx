import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Search,
  Send,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_META, CURRENT_USER, DEPARTMENTS } from '../constants';
import { useComplaints } from '../context/ComplaintsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/States';

const EMPTY_FORM = {
  studentName: CURRENT_USER.name,
  rollNo: CURRENT_USER.rollNo,
  department: CURRENT_USER.department,
  category: '',
  title: '',
  description: '',
  location: '',
};

const LIMITS = { title: 100, description: 1000 };

function validate(values) {
  const errors = {};
  const name = values.studentName.trim();
  const roll = values.rollNo.trim();
  const title = values.title.trim();
  const description = values.description.trim();
  const location = values.location.trim();

  if (!name) errors.studentName = 'Student name is required.';
  else if (name.length < 2) errors.studentName = 'Please enter your full name.';

  if (!roll) errors.rollNo = 'Student ID / roll number is required.';
  else if (!/^[A-Za-z0-9][A-Za-z0-9\-/]{3,19}$/.test(roll))
    errors.rollNo = 'Use 4–20 letters, numbers, "-" or "/" (e.g. 22CS1042).';

  if (!values.department) errors.department = 'Please select your department.';
  if (!values.category) errors.category = 'Please choose a complaint category.';

  if (!title) errors.title = 'Complaint title is required.';
  else if (title.length < 5) errors.title = 'Title should be at least 5 characters.';

  // Description is optional
  if (description && description.length > LIMITS.description) {
    errors.description = `Description exceeds ${LIMITS.description} characters limit.`;
  }

  if (!location) errors.location = 'Location / building / room number is required.';

  return errors;
}

function Field({ label, htmlFor, error, hint, children, required = true }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
          <AlertCircle size={13} /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}

export default function SubmitComplaint() {
  const { addComplaint } = useComplaints();
  const { notify } = useToast();

  const [values, setValues] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const errors = validate(values);
  const showError = (name) => (touched[name] ? errors[name] : undefined);

  const update = (name) => (e) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };
  const blur = (name) => () => setTouched((prev) => ({ ...prev, [name]: true }));

  const inputProps = (name) => ({
    id: name,
    value: values[name],
    onChange: update(name),
    onBlur: blur(name),
    'aria-invalid': showError(name) ? 'true' : undefined,
    'aria-describedby': showError(name) ? `${name}-error` : undefined,
    className: `input ${showError(name) ? 'input-error' : ''}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setTouched(Object.keys(EMPTY_FORM).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      notify({
        type: 'error',
        title: 'Please fix the highlighted fields',
        message: 'Some required information is missing or invalid.',
      });
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const complaint = await addComplaint(values);
      setCreated(complaint);
      notify({
        type: 'success',
        title: 'Complaint submitted',
        message: `Your complaint ID is ${complaint.id}. Keep it to track progress.`,
      });
    } catch (err) {
      const message = err.message || 'We could not submit your complaint. Please try again.';
      setSubmitError(message);
      notify({ type: 'error', title: 'Submission failed', message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(EMPTY_FORM);
    setTouched({});
    setSubmitError('');
    setCreated(null);
    setCopied(false);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(created.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ type: 'info', title: 'Copy not available', message: 'Please copy the ID manually.' });
    }
  };

  return (
    <div>
      <PageHeader
        title="Submit a complaint"
        subtitle="The more detail you provide, the faster our team can find and fix the problem."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {created ? (
            <div className="card animate-slide-up p-6 text-center sm:p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={34} />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight">Complaint submitted!</h2>
              <p className="mt-2 text-sm text-ink-500">
                It has been recorded in CampusConnect. Save your complaint ID to track its review and resolution.
              </p>

              <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-5 py-4">
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Complaint ID</p>
                  <p className="font-mono text-xl font-bold tracking-wide">{created.id}</p>
                </div>
                <button type="button" onClick={copyId} className="btn-outline px-3 py-2">
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={`/track?id=${encodeURIComponent(created.id)}`} className="btn-primary">
                  <Search size={16} /> Track this complaint
                </Link>
                <Link to="/history" className="btn-outline">
                  View complaint history
                </Link>
                <button type="button" onClick={resetForm} className="btn-ghost">
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="card space-y-6 p-5 sm:p-8">
              {submitError && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Student name" htmlFor="studentName" error={showError('studentName')}>
                  <input {...inputProps('studentName')} type="text" placeholder="e.g. Riya Sharma" autoComplete="name" />
                </Field>
                <Field label="Student ID / Roll number" htmlFor="rollNo" error={showError('rollNo')}>
                  <input {...inputProps('rollNo')} type="text" placeholder="e.g. 22CS1042" />
                </Field>
              </div>

              <Field label="Department" htmlFor="department" error={showError('department')}>
                <select {...inputProps('department')}>
                  <option value="">Select your department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <fieldset>
                <legend className="label">
                  Complaint category <span className="text-rose-500">*</span>
                </legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CATEGORIES.map((category) => {
                    const meta = CATEGORY_META[category];
                    const Icon = meta.icon;
                    const selected = values.category === category;
                    return (
                      <label
                        key={category}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-brand-500 ${
                          selected
                            ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-600'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selected}
                          onChange={update('category')}
                          onBlur={blur('category')}
                          className="sr-only"
                        />
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.tone}`}>
                          <Icon size={16} />
                        </span>
                        <span className="leading-tight">{category}</span>
                      </label>
                    );
                  })}
                </div>
                {showError('category') && (
                  <p id="category-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                    <AlertCircle size={13} /> {errors.category}
                  </p>
                )}
              </fieldset>

              <Field label="Complaint title" htmlFor="title" error={showError('title')}>
                <input
                  {...inputProps('title')}
                  type="text"
                  maxLength={LIMITS.title}
                  placeholder="e.g. Projector not working in Room 305"
                />
              </Field>

              <Field
                label="Detailed description"
                htmlFor="description"
                required={false}
                error={showError('description')}
                hint="Optional"
              >
                <textarea
                  {...inputProps('description')}
                  rows={4}
                  maxLength={LIMITS.description}
                  placeholder="Optional: Add extra details, room context, or when the issue started…"
                  className={`input resize-y ${showError('description') ? 'input-error' : ''}`}
                />
              </Field>

              <Field label="Location / Building / Room number" htmlFor="location" error={showError('location')}>
                <input {...inputProps('location')} type="text" placeholder="e.g. Academic Block, Room 305" />
              </Field>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3.5 text-base">
                  {submitting ? (
                    <>
                      <Spinner /> Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={17} /> Submit complaint
                    </>
                  )}
                </button>
                <button type="button" onClick={resetForm} disabled={submitting} className="btn-outline px-6 py-3.5 text-base">
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="text-base font-bold">What happens next?</h2>
            <ol className="mt-4 space-y-4">
              {[
                ['You submit', 'We generate a unique complaint ID for you.'],
                ['Under review', 'Campus authorities review and assign complaints to maintenance.'],
                ['Track progress', 'Use your ID to see Pending, In Progress or Resolved.'],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-ink-500">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Link
            to="/review"
            className="group relative block overflow-hidden rounded-3xl bg-mustard p-5 text-ink transition hover:shadow-pop"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-3xl border-[12px] border-white/20" aria-hidden="true" />
            <ClipboardCheck size={22} />
            <p className="mt-3 text-base font-bold">Review Desk</p>
            <p className="mt-1 text-sm opacity-80">Track how complaints are triaged and resolved by authorities.</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
