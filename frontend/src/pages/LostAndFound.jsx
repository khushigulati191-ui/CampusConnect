import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Filter,
  Inbox,
  MapPin,
  Package,
  PackageSearch,
  Plus,
  Phone,
  Search,
  Tag,
  User,
  X,
} from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { lostFoundService } from '../services/lostFoundService';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States';
import { formatDate } from '../utils/format';

const LF_CATEGORIES = [
  'Electronics & Gadgets',
  'College ID & Documents',
  'Wallets & Purses',
  'Keys & Keychains',
  'Bags & Backpacks',
  'Books & Stationery',
  'Clothing & Accessories',
  'Water Bottles',
  'Other',
];

export default function LostAndFound() {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'Lost', 'Found', 'My'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'Lost', // 'Lost' or 'Found'
    title: '',
    category: 'Electronics & Gadgets',
    description: '',
    location: '',
    itemDate: new Date().toISOString().slice(0, 10),
    contactName: CURRENT_USER.name,
    contactInfo: '',
    rollNo: CURRENT_USER.rollNo,
  });

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lostFoundService.getItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Could not load lost & found items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.contactInfo.trim()) {
      notify({ type: 'error', title: 'Missing required fields', message: 'Please provide item title, location, and contact information.' });
      return;
    }

    setSubmitting(true);
    try {
      const created = await lostFoundService.reportItem(form);
      setItems((prev) => [created, ...prev]);
      notify({
        type: 'success',
        title: `${form.type} item reported!`,
        message: `"${form.title}" has been registered in the Lost & Found desk.`,
      });
      setShowForm(false);
      setForm({
        type: 'Lost',
        title: '',
        category: 'Electronics & Gadgets',
        description: '',
        location: '',
        itemDate: new Date().toISOString().slice(0, 10),
        contactName: CURRENT_USER.name,
        contactInfo: '',
        rollNo: CURRENT_USER.rollNo,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Failed to submit', message: err.message || 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await lostFoundService.updateStatus(itemId, newStatus);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
      );
      notify({
        type: 'success',
        title: 'Status updated',
        message: `Item marked as ${newStatus}.`,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Update failed', message: err.message });
    }
  };

  // Filtered items
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (typeFilter === 'My') {
          return (
            item.rollNo?.toUpperCase() === CURRENT_USER.rollNo.toUpperCase() ||
            item.contactName?.toLowerCase() === CURRENT_USER.name.toLowerCase()
          );
        }
        if (typeFilter === 'Lost') return item.type === 'Lost';
        if (typeFilter === 'Found') return item.type === 'Found';
        return true;
      })
      .filter((item) => categoryFilter === 'All' || item.category === categoryFilter)
      .filter((item) => {
        if (!q) return true;
        return [item.title, item.description, item.location, item.category, item.contactName, item.id]
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
  }, [items, typeFilter, categoryFilter, search]);

  const counts = useMemo(() => {
    const lost = items.filter((i) => i.type === 'Lost' && i.status !== 'Claimed').length;
    const found = items.filter((i) => i.type === 'Found' && i.status !== 'Claimed').length;
    const my = items.filter(
      (i) =>
        i.rollNo?.toUpperCase() === CURRENT_USER.rollNo.toUpperCase() ||
        i.contactName?.toLowerCase() === CURRENT_USER.name.toLowerCase()
    ).length;
    return { lost, found, total: items.length, my };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lost & Found"
        subtitle="Report lost items, list found possessions, and help reunite belongings with their owners on campus."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus size={16} /> Report Item (Lost / Found)
          </button>
        }
      />

      {/* KPI Tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => setTypeFilter('Lost')}
          className={`card cursor-pointer p-5 transition ${
            typeFilter === 'Lost' ? 'ring-2 ring-rose-500' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Active Lost Items</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{counts.lost}</p>
              <p className="mt-1 text-xs text-ink-500">Items students are looking for</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <Search size={22} />
            </span>
          </div>
        </div>

        <div
          onClick={() => setTypeFilter('Found')}
          className={`card cursor-pointer p-5 transition ${
            typeFilter === 'Found' ? 'ring-2 ring-tealdeep' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-tealdeep">Found & Unclaimed</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{counts.found}</p>
              <p className="mt-1 text-xs text-ink-500">Waiting to be returned</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-tealdeep">
              <Package size={22} />
            </span>
          </div>
        </div>

        <div
          onClick={() => setTypeFilter('All')}
          className={`card cursor-pointer p-5 transition ${
            typeFilter === 'All' ? 'ring-2 ring-brand-500' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Total Reported</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{counts.total}</p>
              <p className="mt-1 text-xs text-ink-500">All registered items</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <PackageSearch size={22} />
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="card overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lost or found items by name, location, details…"
                className="input pl-10"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-ink-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input md:w-56"
              >
                <option value="All">All Categories</option>
                {LF_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'All', label: 'All Items', count: counts.total },
                { key: 'Lost', label: '🔍 Lost Items', count: counts.lost },
                { key: 'Found', label: '🎁 Found Items', count: counts.found },
                { key: 'My', label: 'My Submissions', count: counts.my },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTypeFilter(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    typeFilter === t.key
                      ? 'bg-ink text-white'
                      : 'bg-slate-100 text-ink-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[11px] font-bold ${
                      typeFilter === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-ink-700'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-sm text-ink-500">
              Showing <strong className="text-ink">{filtered.length}</strong> items
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4 sm:p-5">
          {loading ? (
            <SkeletonRows count={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={loadItems} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No items found"
              description={
                search || categoryFilter !== 'All'
                  ? 'No items match your active filters. Try searching for something else.'
                  : 'No items reported in this category yet. Be the first to report!'
              }
              action={
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  <Plus size={16} /> Report Lost or Found Item
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const isLost = item.type === 'Lost';
                const isClaimed = item.status === 'Claimed';

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-card"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            isLost
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                              : 'bg-teal-50 text-teal-800 ring-1 ring-teal-200'
                          }`}
                        >
                          {isLost ? '🔍 LOST' : '🎁 FOUND'}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isClaimed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isClaimed ? 'Resolved / Claimed' : 'Active'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="mt-3 text-base font-bold text-ink">{item.title}</h3>
                      <p className="mt-1 text-xs text-ink-500 line-clamp-3">
                        {item.description || 'No additional description provided.'}
                      </p>

                      {/* Location & Date Meta */}
                      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-ink-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-ink-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-ink-400 shrink-0" />
                          <span>Date: {item.itemDate || formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-ink-400 shrink-0" />
                          <span>Category: {item.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Action Footer */}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-ink-700">
                        <p className="font-semibold text-ink">
                          Reported by: {item.contactName} {item.rollNo ? `(${item.rollNo})` : ''}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-ink-500">
                          <Phone size={12} /> Contact: <strong className="text-ink">{item.contactInfo}</strong>
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-ink-400">{item.id}</span>
                        {!isClaimed ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'Claimed')}
                            className="btn-outline text-xs px-2.5 py-1 text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle2 size={13} /> Mark as Claimed
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'Open')}
                            className="text-xs text-ink-400 hover:text-ink hover:underline"
                          >
                            Re-open
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-ink">Report an Item</h2>
                <p className="text-xs text-ink-500">Provide details to help return the item to its owner.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-ink-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Type Switch: Lost vs Found */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                  What are you reporting?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: 'Lost' }))}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 transition ${
                      form.type === 'Lost'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                        : 'border-slate-200 hover:border-slate-300 text-ink-600'
                    }`}
                  >
                    <Search size={22} className={form.type === 'Lost' ? 'text-rose-600' : 'text-ink-400'} />
                    <span className="mt-1 font-bold text-sm">I Lost an Item</span>
                    <span className="text-[11px] opacity-75">Looking for missing property</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: 'Found' }))}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 transition ${
                      form.type === 'Found'
                        ? 'border-tealdeep bg-teal-50/50 text-tealdeep'
                        : 'border-slate-200 hover:border-slate-300 text-ink-600'
                    }`}
                  >
                    <Package size={22} className={form.type === 'Found' ? 'text-tealdeep' : 'text-ink-400'} />
                    <span className="mt-1 font-bold text-sm">I Found an Item</span>
                    <span className="text-[11px] opacity-75">Found someone else's item</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Item Name / Title <span className="text-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={form.type === 'Lost' ? 'e.g., Blue Tupperware Water Bottle' : 'e.g., Casio Scientific Calculator'}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  >
                    {LF_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.itemDate}
                    onChange={(e) => setForm({ ...form, itemDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Location {form.type === 'Lost' ? 'Lost' : 'Found'} <span className="text-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library 2nd Floor, Room 204"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Include color, brand, stickers, scratches, or any unique identification marks…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input resize-none"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Contact Phone / Email <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Phone number, email or room"
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Submitting…' : `Submit ${form.type} Report`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
