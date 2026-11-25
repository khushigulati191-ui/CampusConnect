import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { STATUS } from '../constants';

const ComplaintsContext = createContext(null);

const byOldestFirst = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

export function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addComplaint = useCallback(async (payload) => {
    const created = await complaintService.createComplaint(payload);
    setComplaints((prev) => [...prev, created]);
    return created;
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    const updated = await complaintService.updateComplaintStatus(id, status);
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }, []);

  /** Complaints in First-In-First-Out order (oldest first). */
  const fifo = useMemo(() => [...complaints].sort(byOldestFirst), [complaints]);

  const stats = useMemo(() => {
    const pending = complaints.filter((c) => c.status === STATUS.PENDING).length;
    const inProgress = complaints.filter((c) => c.status === STATUS.IN_PROGRESS).length;
    const resolved = complaints.filter((c) => c.status === STATUS.RESOLVED).length;
    return { total: complaints.length, pending, inProgress, resolved, active: pending + inProgress };
  }, [complaints]);

  const value = useMemo(
    () => ({ complaints, fifo, stats, loading, error, reload: load, addComplaint, changeStatus }),
    [complaints, fifo, stats, loading, error, load, addComplaint, changeStatus],
  );

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used inside <ComplaintsProvider>');
  return ctx;
}
