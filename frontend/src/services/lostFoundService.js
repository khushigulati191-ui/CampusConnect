/**
 * Lost & Found Service
 * Communicates with FastAPI endpoint /api/lost-and-found or fallback localStorage in mock mode.
 */

import { USE_MOCK, request } from './api';

const STORAGE_KEY = 'campusconnect:lostfound:v1';

function readLocalStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

function writeLocalStore(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage error ignored
  }
}

const mockImpl = {
  async list() {
    return readLocalStore();
  },
  async create(payload) {
    const list = readLocalStore();
    const year = new Date().getFullYear();
    const id = `LF-${year}-${String(list.length + 1).padStart(4, '0')}`;
    const newItem = {
      id,
      type: payload.type || 'Lost',
      title: payload.title.trim(),
      category: payload.category || 'Other',
      description: payload.description?.trim() || '',
      location: payload.location.trim(),
      itemDate: payload.itemDate || new Date().toISOString().slice(0, 10),
      contactName: payload.contactName.trim(),
      contactInfo: payload.contactInfo.trim(),
      rollNo: payload.rollNo?.trim().toUpperCase() || '',
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    writeLocalStore(updated);
    return newItem;
  },
  async updateStatus(id, status) {
    const list = readLocalStore();
    const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
    writeLocalStore(updated);
    return updated.find((i) => i.id === id);
  },
};

const remoteImpl = {
  async list() {
    const data = await request('/lost-and-found');
    return Array.isArray(data) ? data : data?.items || [];
  },
  async create(payload) {
    return await request('/lost-and-found', {
      method: 'POST',
      body: payload,
    });
  },
  async updateStatus(id, status) {
    return await request(`/lost-and-found/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

const impl = USE_MOCK ? mockImpl : remoteImpl;

export const lostFoundService = {
  getItems: () => impl.list(),
  reportItem: (payload) => impl.create(payload),
  updateStatus: (id, status) => impl.updateStatus(id, status),
};
