/**
 * Thin fetch wrapper used by every real (non-mock) API call.
 *
 * Configure through `.env`:
 *   VITE_API_BASE_URL=http://localhost:8000/api
 *   VITE_USE_MOCK=false
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
).replace(/\/$/, '');

/** Mock mode is ON unless VITE_USE_MOCK is explicitly set to "false". */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        // Add auth here later, e.g. Authorization: `Bearer ${token}`
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      (response.status === 404 ? 'Not found' : `Request failed (${response.status})`);
    throw new ApiError(typeof message === 'string' ? message : 'Request failed', response.status, data);
  }

  return data;
}
