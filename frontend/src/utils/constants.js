// ============================================================
// INCIDENT ROOM — Constants & Seed Data
// ============================================================

export const PRIORITIES = ['critical', 'high', 'medium', 'low'];
export const STATUSES   = ['open', 'investigating', 'resolved'];

export const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// Color maps for each priority / status value
export const COLORS = {
  critical:     { bg: '#3a0f12', text: '#e63946', border: '#e6394650' },
  high:         { bg: '#2a1500', text: '#f4a261', border: '#f4a26150' },
  medium:       { bg: '#0c2a4a', text: '#1d7ed8', border: '#1d7ed850' },
  low:          { bg: '#0a2e1a', text: '#2ecc71', border: '#2ecc7150' },
  open:         { bg: '#3a0f12', text: '#e63946', border: '#e63946' },
  investigating:{ bg: '#0c2a4a', text: '#1d7ed8', border: '#1d7ed8' },
  resolved:     { bg: '#0a2e1a', text: '#2ecc71', border: '#2ecc71' },
};

// ── Helpers ──────────────────────────────────────────────────
export const genId   = () => Math.random().toString(36).slice(2, 9);
export const nowISO  = () => new Date().toISOString();

export const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

export const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
});

export const timeAgo = iso => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ── Seed Data ────────────────────────────────────────────────
const id1 = genId(), id2 = genId(), id3 = genId(), id4 = genId();

export const SEED_INCIDENTS = [
  {
    id: id1,
    title: 'Payment API failing for some users',
    description: 'Multiple reports of 500 errors on /api/payments/charge endpoint. Affecting ~12% of transactions.',
    priority: 'critical',
    status: 'investigating',
    reporter_name: 'Priya Sharma',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5  * 60000).toISOString(),
    latest_update: 'Engineering on bridge call. Rolled back last deploy, monitoring.',
  },
  {
    id: id2,
    title: 'Customer unable to upload documents',
    description: 'Document upload returning 413 error. Nginx config change deployed 40min ago may be cause.',
    priority: 'high',
    status: 'open',
    reporter_name: 'Arjun Mehta',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60000).toISOString(),
    latest_update: '',
  },
  {
    id: id3,
    title: 'Login errors started 10 minutes ago',
    description: 'Auth service returning intermittent 401s. JWT validation seems to be failing on token refresh.',
    priority: 'critical',
    status: 'open',
    reporter_name: 'Divya Nair',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    latest_update: '',
  },
  {
    id: id4,
    title: 'Dashboard not loading for key client',
    description: 'ACME Corp reporting blank screen on dashboard. Console shows CORS errors. No other clients affected.',
    priority: 'high',
    status: 'resolved',
    reporter_name: 'Rohan Joshi',
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60000).toISOString(),
    latest_update: 'Fixed CORS header config. ACME confirmed working.',
  },
];

export const SEED_UPDATES = {
  [id1]: [
    { id: genId(), incident_id: id1, message: 'Alert triggered. Payment failure rate at 12%. PagerDuty notified.', author_name: 'System', created_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: genId(), incident_id: id1, message: 'Bridge call started. 5 engineers on. Identified last deploy at 14:32 as likely cause.', author_name: 'Priya Sharma', created_at: new Date(Date.now() - 18 * 60000).toISOString() },
    { id: genId(), incident_id: id1, message: 'Rollback initiated on payment-service v2.4.1 → v2.4.0.', author_name: 'Dev Bot', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: genId(), incident_id: id1, message: 'Failure rate dropping. Now at 2%. Monitoring for 10 more minutes before closing.', author_name: 'Priya Sharma', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  ],
  [id2]: [],
  [id3]: [],
  [id4]: [
    { id: genId(), incident_id: id4, message: 'ACME Corp support ticket created. Priority escalated.', author_name: 'Rohan Joshi', created_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: genId(), incident_id: id4, message: 'Root cause: missing CORS header for new subdomain api2.acmecorp.com.', author_name: 'Rohan Joshi', created_at: new Date(Date.now() - 35 * 60000).toISOString() },
    { id: genId(), incident_id: id4, message: 'Fix deployed. ACME confirmed dashboard loading. Incident resolved.', author_name: 'Rohan Joshi', created_at: new Date(Date.now() - 20 * 60000).toISOString() },
  ],
};

// AI prompt templates
export const AI_PROMPTS = {
  summary: (incident, updText) =>
    `You are an incident response AI. Analyze this incident and give a concise 3-4 sentence summary covering: what is broken, who is affected, current status, and root cause if known.

Incident: ${incident.title}
Priority: ${incident.priority}
Status: ${incident.status}
Description: ${incident.description}
Updates:
${updText || 'No updates yet.'}

Respond with ONLY the summary paragraph, no preamble.`,

  actions: (incident, updText) =>
    `You are an incident response AI. Based on this incident, suggest 4-5 specific, actionable next steps the team should take RIGHT NOW. Be concrete and technical.

Incident: ${incident.title}
Priority: ${incident.priority}
Status: ${incident.status}
Description: ${incident.description}
Updates:
${updText || 'No updates yet.'}

Respond with a numbered list of next actions. Be brief and specific.`,

  review: (incident, updText) =>
    `You are an incident response AI. Review the priority assigned to this incident and assess if it is correctly classified. Provide a brief justification.

Incident: ${incident.title}
Current Priority: ${incident.priority}
Status: ${incident.status}
Description: ${incident.description}
Updates:
${updText || 'No updates yet.'}

Respond with: PRIORITY ASSESSMENT: [agree/should be higher/should be lower] followed by 2-3 sentences of justification.`,
};
