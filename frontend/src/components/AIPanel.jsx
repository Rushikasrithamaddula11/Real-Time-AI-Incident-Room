// ============================================================
// AIPanel — AI Assist: summarize / next actions / priority review
// ============================================================
import React, { useState } from 'react';
import { AI_PROMPTS, fmtTime } from '../utils/constants';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-sonnet-4-20250514';

const MODES = [
  { key: 'summary', label: 'Summarize'     },
  { key: 'actions', label: 'Next Actions'  },
  { key: 'review',  label: 'Priority Check' },
];

export default function AIPanel({ incident, updates, onResultSaved }) {
  const [activeMode, setActiveMode] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);

  const run = async (mode) => {
    setActiveMode(mode);
    setLoading(true);
    setResult(null);
    setError(null);

    const updText = updates
      .map(u => `[${fmtTime(u.created_at)}] ${u.author_name}: ${u.message}`)
      .join('\n');

    const prompt = AI_PROMPTS[mode](incident, updText);

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The API key is injected by the claude.ai environment in artifacts.
          // When running standalone, set REACT_APP_ANTHROPIC_KEY in .env
          ...(process.env.REACT_APP_ANTHROPIC_KEY
            ? { 'x-api-key': process.env.REACT_APP_ANTHROPIC_KEY }
            : {}),
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 600,
          messages:   [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content[0].text;
      setResult(text);
      onResultSaved?.(incident.id, mode, text);
    } catch (e) {
      // Rule-based fallback when AI is unavailable
      const fallback = getRuleBasedFallback(mode, incident, updates);
      setResult(fallback);
      setError(`AI unavailable (${e.message}). Showing rule-based fallback.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background:   '#080808',
        border:       '1px solid #1a2a3a',
        borderRadius: 4,
        padding:      16,
        marginTop:    16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontSize:      9,
            color:         '#1d7ed8',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight:    700,
          }}
        >
          {'//'} AI ASSIST
        </span>
        <span style={{ flex: 1, height: 1, background: '#1a2a3a' }} />
      </div>

      {/* Mode buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => run(key)}
            disabled={loading}
            style={{
              padding:       '6px 12px',
              fontSize:      10,
              letterSpacing: 1,
              fontWeight:    700,
              background:    activeMode === key && result ? '#1d7ed815' : 'none',
              color:         '#1d7ed8',
              border:        `1px solid ${activeMode === key && result ? '#1d7ed840' : '#1d7ed820'}`,
              borderRadius:  2,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%', background: '#1d7ed8', display: 'inline-block',
            }}
            className="blink"
          />
          <span style={{ fontSize: 12, color: '#555' }}>AI processing…</span>
        </div>
      )}

      {/* Error notice */}
      {error && !loading && (
        <div
          style={{
            fontSize:     11,
            color:        '#f4a261',
            padding:      '6px 10px',
            background:   '#2a150010',
            border:       '1px solid #f4a26120',
            borderRadius: 2,
            marginBottom: 10,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className="fade-in"
          style={{
            fontSize:    13,
            color:       '#bbb',
            lineHeight:  1.75,
            borderLeft:  '2px solid #1d7ed830',
            paddingLeft: 12,
            whiteSpace:  'pre-wrap',
          }}
        >
          {result}
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div style={{ fontSize: 11, color: '#2a2a2a', padding: '4px 0' }}>
          Select an action above to get AI assistance.
        </div>
      )}
    </div>
  );
}

// ── Rule-based fallback (no API key needed) ──────────────────
function getRuleBasedFallback(mode, incident, updates) {
  const updCount = updates.length;

  if (mode === 'summary') {
    return (
      `Incident: "${incident.title}" was reported by ${incident.reporter_name} and is currently ${incident.status} ` +
      `with ${incident.priority} priority. ` +
      (updCount > 0
        ? `There have been ${updCount} update(s). Latest: "${updates[updCount - 1].message}"`
        : 'No updates have been posted yet.')
    );
  }

  if (mode === 'actions') {
    const actions = {
      critical: [
        '1. Immediately page the on-call engineer and assemble a bridge call.',
        '2. Check recent deployments and rollback the most recent one if suspicious.',
        '3. Assess customer-facing impact and draft a status page update.',
        '4. Identify root cause and isolate the affected service.',
        '5. Set a 10-minute check-in cadence until the incident is resolved.',
      ],
      high: [
        '1. Assign an incident commander and a dedicated Slack channel.',
        '2. Reproduce the issue in staging with the exact steps provided.',
        '3. Check logs and error-monitoring tools for the relevant service.',
        '4. Notify affected customers with an ETA for resolution.',
        '5. Prepare a fix or workaround and schedule deployment.',
      ],
      medium: [
        '1. Assign an engineer to investigate within the next 30 minutes.',
        '2. Review recent changes to the affected area.',
        '3. Post an initial update to the internal tracking channel.',
        '4. Define workaround steps for affected users.',
        '5. Schedule a fix in the next sprint if not immediately critical.',
      ],
      low: [
        '1. Log the issue in the bug tracker with full reproduction steps.',
        '2. Assign to the appropriate team for next available sprint.',
        '3. Confirm no customer escalation is needed.',
        '4. Monitor to ensure the issue does not escalate.',
      ],
    };
    return (actions[incident.priority] || actions.medium).join('\n');
  }

  if (mode === 'review') {
    const checks = {
      critical: 'PRIORITY ASSESSMENT: agree — The priority appears correctly set to critical based on the incident description.',
      high:     'PRIORITY ASSESSMENT: agree — High priority seems appropriate. Monitor for escalation to critical if broader impact is confirmed.',
      medium:   'PRIORITY ASSESSMENT: agree — Medium priority looks reasonable. Revisit if the impact grows.',
      low:      'PRIORITY ASSESSMENT: agree — Low priority seems appropriate. No immediate escalation needed.',
    };
    return checks[incident.priority] || 'PRIORITY ASSESSMENT: agree — Priority appears correctly set.';
  }

  return 'AI analysis unavailable.';
}
