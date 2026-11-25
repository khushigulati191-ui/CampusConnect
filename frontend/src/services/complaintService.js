/**
 * Complaint service – the ONLY place the UI talks to data.
 *
 * Mock mode (default):  data lives in localStorage, seeded from src/data/mockComplaints.js
 * Real mode:            set VITE_USE_MOCK=false and the calls below hit your Python backend.
 *
 * Expected backend contract (JSON, camelCase fields):
 *
 *   GET    /complaints                -> Complaint[]
 *   GET    /complaints/:id            -> Complaint            (404 if unknown)
 *   POST   /complaints                -> Complaint            body: NewComplaint
 *   PATCH  /complaints/:id/status     -> Complaint            body: { status }
 *
 *   Complaint = {
 *     id, studentName, rollNo, department, category, title, description, location,
 *     status: 'Pending' | 'In Progress' | 'Resolved',
 *     createdAt, updatedAt,            // ISO 8601 strings
 *     timeline: [{ status, at, note }]
 *   }
 *
 * If your backend uses snake_case, convert in `fromApi` / `toApi` below.
 */
import { ApiError, USE_MOCK, request } from './api';
import { STATUS, STATUS_FLOW } from '../constants';
import { createSeedComplaints } from '../data/mockComplaints';
import { normalizeComplaintId } from '../utils/format';

/* ----------------------------- field mapping ----------------------------- */

const fromApi = (c) => c; // map backend -> UI shape here if needed
const toApi = (c) => c; // map UI -> backend shape here if needed

/* ------------------------------ mock backend ----------------------------- */

const STORAGE_KEY = 'smart-campus-helpdesk:complaints:v1';
const MOCK_DELAY = 450;

const wait = (ms = MOCK_DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

let memoryStore = null;

function readStore() {
  if (memoryStore) return memoryStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch {
    // storage unavailable or corrupted – fall back to seed data
  }
  memoryStore = createSeedComplaints();
  writeStore(memoryStore);
  return memoryStore;
}

function writeStore(list) {
  memoryStore = list;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / privacy-mode errors; data still lives in memory
  }
}

function nextId(list) {
  const year = new Date().getFullYear();
  const max = list.reduce((acc, c) => {
    const n = parseInt(String(c.id).split('-').pop(), 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `CMP-${year}-${String(max + 1).padStart(4, '0')}`;
}

const mock = {
  async list() {
    await wait();
    return [...readStore()];
  },

  async getById(id) {
    await wait(350);
    const found = readStore().find((c) => c.id === normalizeComplaintId(id));
    if (!found) throw new ApiError('Complaint not found', 404);
    return { ...found };
  },

  async create(payload) {
    await wait(700);
    const list = readStore();
    const now = new Date().toISOString();
    const complaint = {
      id: nextId(list),
      studentName: payload.studentName.trim(),
      rollNo: payload.rollNo.trim().toUpperCase(),
      department: payload.department,
      category: payload.category,
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      status: STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
      timeline: [
        { status: STATUS.PENDING, at: now, note: 'Complaint submitted and added to the queue.' },
      ],
    };
    writeStore([...list, complaint]);
    return { ...complaint };
  },

  async updateStatus(id, status) {
    await wait(400);
    const list = readStore();
    const index = list.findIndex((c) => c.id === normalizeComplaintId(id));
    if (index === -1) throw new ApiError('Complaint not found', 404);
    const now = new Date().toISOString();
    const notes = {
      [STATUS.PENDING]: 'Complaint moved back to the queue.',
      [STATUS.IN_PROGRESS]: 'Assigned to the maintenance team. Work has started.',
      [STATUS.RESOLVED]: 'Issue fixed and verified by the facilities office.',
    };
    const updated = {
      ...list[index],
      status,
      updatedAt: now,
      timeline: [...list[index].timeline, { status, at: now, note: notes[status] }],
    };
    const copy = [...list];
    copy[index] = updated;
    writeStore(copy);
    return { ...updated };
  },
};

/* ------------------------------ real backend ----------------------------- */

const remote = {
  async list() {
    const data = await request('/complaints');
    return (Array.isArray(data) ? data : data?.items || []).map(fromApi);
  },
  async getById(id) {
    return fromApi(await request(`/complaints/${encodeURIComponent(normalizeComplaintId(id))}`));
  },
  async create(payload) {
    return fromApi(await request('/complaints', { method: 'POST', body: toApi(payload) }));
  },
  async updateStatus(id, status) {
    return fromApi(
      await request(`/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    );
  },
};

const impl = USE_MOCK ? mock : remote;

/* ------------------------------ public API ------------------------------- */

export const complaintService = {
  getComplaints: () => impl.list(),
  getComplaintById: (id) => impl.getById(id),
  createComplaint: (payload) => impl.create(payload),
  updateComplaintStatus: (id, status) => impl.updateStatus(id, status),
};

/** Next stage in the lifecycle, or null when already resolved. */
export function getNextStatus(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
}
