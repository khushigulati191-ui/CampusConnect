import {
  LayoutDashboard,
  FilePlus2,
  Search,
  History,
  ClipboardCheck,
  PackageSearch,
  Zap,
  Wifi,
  Droplets,
  Projector,
  Building2,
  Shapes,
  Clock,
  Loader,
  CheckCircle2,
} from 'lucide-react';

/** Replace with the logged-in user once you add authentication. */
export const CURRENT_USER = {
  name: 'Riya Sharma',
  firstName: 'Riya',
  rollNo: '22CS1042',
  department: 'Computer Science',
  initials: 'RS',
};

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/submit', label: 'Submit Complaint', icon: FilePlus2 },
  { to: '/track', label: 'Track Complaint', icon: Search },
  { to: '/review', label: 'Review Complaints', icon: ClipboardCheck, showPendingCount: true },
  { to: '/history', label: 'Complaint History', icon: History },
  { to: '/lost-and-found', label: 'Lost & Found', icon: PackageSearch },
];

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Business Administration',
  'Other',
];

export const STATUS = {
  IN_PROGRESS: 'In Progress',
  NEEDS_REVIEW: 'Needs Review',
  RESOLVED: 'Resolved',
  PENDING: 'In Progress',
};

/** Order matters: it is the lifecycle of a complaint. */
export const STATUS_FLOW = [STATUS.IN_PROGRESS, STATUS.NEEDS_REVIEW, STATUS.RESOLVED];

export const STATUS_META = {
  [STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    studentLabel: 'Under Investigation',
    icon: Loader,
    pill: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
    solid: 'bg-sky-500 text-white',
    soft: 'bg-sky-50 text-sky-600',
    bar: 'bg-sky-500',
  },
  [STATUS.NEEDS_REVIEW]: {
    label: 'Needs Review',
    studentLabel: 'Needs Your Review',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 ring-amber-300 ring-1',
    dot: 'bg-amber-500',
    solid: 'bg-amber-500 text-white',
    soft: 'bg-amber-50 text-amber-600',
    bar: 'bg-amber-400',
  },
  [STATUS.RESOLVED]: {
    label: 'Resolved',
    studentLabel: 'Closed & Resolved',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    solid: 'bg-emerald-500 text-white',
    soft: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
  },
  Pending: {
    label: 'In Progress',
    studentLabel: 'Under Investigation',
    icon: Loader,
    pill: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
    solid: 'bg-sky-500 text-white',
    soft: 'bg-sky-50 text-sky-600',
    bar: 'bg-sky-500',
  },
};

export const CATEGORIES = [
  'Electricity',
  'Wi-Fi',
  'Water',
  'Classroom Equipment',
  'Infrastructure',
  'Other',
];

export const CATEGORY_META = {
  Electricity: { icon: Zap, tone: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' },
  'Wi-Fi': { icon: Wifi, tone: 'bg-brand-50 text-brand-700', bar: 'bg-brand-500' },
  Water: { icon: Droplets, tone: 'bg-sky-50 text-sky-700', bar: 'bg-sky-400' },
  'Classroom Equipment': {
    icon: Projector,
    tone: 'bg-rose-50 text-rose-700',
    bar: 'bg-coral',
  },
  Infrastructure: { icon: Building2, tone: 'bg-teal-50 text-teal-700', bar: 'bg-tealdeep' },
  Other: { icon: Shapes, tone: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
};

export const SAMPLE_TRACK_IDS = ['CMP-2026-0005', 'CMP-2026-0010', 'CMP-2026-0014'];
