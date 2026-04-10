const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('ehr_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('ehr_token', token);
  else localStorage.removeItem('ehr_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const get = (path) => request(path);
const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
const put = (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) });
const del = (path) => request(path, { method: 'DELETE' });

// ─── Auth ────────────────────────────────────────────
export const auth = {
  login: (username, password) => post('/auth/login', { username, password }),
  me: () => get('/auth/me'),
  verifyEpcsPin: (pin) => post('/auth/verify-epcs-pin', { pin }),
  generateEpcsOtp: () => post('/auth/generate-epcs-otp', {}),
  verifyEpcsOtp: (otp) => post('/auth/verify-epcs-otp', { otp }),
};

// ─── Patients ────────────────────────────────────────
export const patients = {
  list: (params) => get(`/patients?${new URLSearchParams(params)}`),
  get: (id) => get(`/patients/${id}`),
  create: (data) => post('/patients', data),
  update: (id, data) => put(`/patients/${id}`, data),
};

// ─── Clinical (per-patient) ──────────────────────────
export const allergies = {
  list: (patientId) => get(`/patients/${patientId}/allergies`),
  create: (patientId, data) => post(`/patients/${patientId}/allergies`, data),
  update: (patientId, id, data) => put(`/patients/${patientId}/allergies/${id}`, data),
  remove: (patientId, id) => del(`/patients/${patientId}/allergies/${id}`),
};

export const problems = {
  list: (patientId) => get(`/patients/${patientId}/problems`),
  create: (patientId, data) => post(`/patients/${patientId}/problems`, data),
  update: (patientId, id, data) => put(`/patients/${patientId}/problems/${id}`, data),
};

export const vitals = {
  list: (patientId) => get(`/patients/${patientId}/vitals`),
  create: (patientId, data) => post(`/patients/${patientId}/vitals`, data),
};

export const immunizations = {
  list: (patientId) => get(`/patients/${patientId}/immunizations`),
  create: (patientId, data) => post(`/patients/${patientId}/immunizations`, data),
};

export const assessments = {
  list: (patientId) => get(`/patients/${patientId}/assessments`),
  create: (patientId, data) => post(`/patients/${patientId}/assessments`, data),
};

// ─── Medications ─────────────────────────────────────
export const medications = {
  list: (patientId) => get(`/patients/${patientId}/medications`),
  get: (patientId, id) => get(`/patients/${patientId}/medications/${id}`),
  create: (patientId, data) => post(`/patients/${patientId}/medications`, data),
  update: (patientId, id, data) => put(`/patients/${patientId}/medications/${id}`, data),
  remove: (patientId, id) => del(`/patients/${patientId}/medications/${id}`),
  addRxHistory: (patientId, id, entry) => post(`/patients/${patientId}/medications/${id}/rx-history`, entry),
};

// ─── Orders ──────────────────────────────────────────
export const orders = {
  list: (patientId) => get(`/patients/${patientId}/orders`),
  create: (patientId, data) => post(`/patients/${patientId}/orders`, data),
  update: (patientId, id, data) => put(`/patients/${patientId}/orders/${id}`, data),
};

// ─── Labs ────────────────────────────────────────────
export const labs = {
  list: (patientId) => get(`/patients/${patientId}/labs`),
  get: (patientId, id) => get(`/patients/${patientId}/labs/${id}`),
  create: (patientId, data) => post(`/patients/${patientId}/labs`, data),
};

// ─── Encounters ──────────────────────────────────────
export const encounters = {
  list: (patientId) => get(`/patients/${patientId}/encounters`),
  get: (patientId, id) => get(`/patients/${patientId}/encounters/${id}`),
  create: (patientId, data) => post(`/patients/${patientId}/encounters`, data),
  update: (patientId, id, data) => put(`/patients/${patientId}/encounters/${id}`, data),
};

// ─── Appointments ────────────────────────────────────
export const appointments = {
  list: (params) => get(`/appointments?${new URLSearchParams(params)}`),
  create: (data) => post('/appointments', data),
  update: (id, data) => put(`/appointments/${id}`, data),
  remove: (id) => del(`/appointments/${id}`),
  blockedDays: () => get('/appointments/blocked-days/list'),
  addBlockedDay: (data) => post('/appointments/blocked-days', data),
  removeBlockedDay: (id) => del(`/appointments/blocked-days/${id}`),
};

// ─── Inbox ───────────────────────────────────────────
export const inbox = {
  list: (params) => get(`/inbox?${new URLSearchParams(params)}`),
  create: (data) => post('/inbox', data),
  update: (id, data) => put(`/inbox/${id}`, data),
  updateStatus: (id, status) => put(`/inbox/${id}/status`, { status }),
};

// ─── Messaging ───────────────────────────────────────
export const messaging = {
  channels: () => get('/messaging/channels'),
  messages: (channelId) => get(`/messaging/channels/${channelId}/messages`),
  send: (channelId, data) => post(`/messaging/channels/${channelId}/messages`, data),
  react: (messageId, data) => put(`/messaging/messages/${messageId}/reactions`, data),
};

// ─── BTG ─────────────────────────────────────────────
export const btg = {
  requestAccess: (patientId, reason) => post('/btg/request-access', { patientId, reason }),
  checkAccess: (patientId) => get(`/btg/check-access/${patientId}`),
  auditLog: (params) => get(`/btg/audit-log?${new URLSearchParams(params)}`),
};

// ─── E-Prescribe ─────────────────────────────────────
export const eprescribe = {
  searchMeds: (search) => get(`/eprescribe/medication-database?search=${encodeURIComponent(search)}`),
  prescribe: (data) => post('/eprescribe/prescribe', data),
};

// ─── Smart Phrases ───────────────────────────────────
export const smartPhrases = {
  list: (params) => get(`/smart-phrases?${new URLSearchParams(params)}`),
  create: (data) => post('/smart-phrases', data),
  update: (id, data) => put(`/smart-phrases/${id}`, data),
  remove: (id) => del(`/smart-phrases/${id}`),
};

// ─── Analytics ───────────────────────────────────────
export const analytics = {
  summary: () => get('/analytics/summary'),
  patient: (patientId) => get(`/analytics/patient/${patientId}`),
};

// ─── Care Gaps ───────────────────────────────────────
export const careGaps = {
  list: () => get('/care-gaps'),
};
