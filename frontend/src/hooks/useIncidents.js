// ============================================================
// INCIDENT ROOM — useIncidents Hook
// Central state manager for incidents, updates, and AI results.
// In production: replace local state mutations with API calls
// and let WebSocket events drive UI updates.
// ============================================================

import { useState, useCallback } from 'react';
import { SEED_INCIDENTS, SEED_UPDATES, genId, nowISO } from '../utils/constants';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function useIncidents() {
  const [incidents, setIncidents]   = useState(SEED_INCIDENTS);
  const [updates,   setUpdates]     = useState(SEED_UPDATES);
  const [aiResults, setAiResults]   = useState({});
  const loading = false;
  const error = null;

  // ── Create incident ──────────────────────────────────────
  const createIncident = useCallback(async (fields) => {
    const incident = {
      id:           genId(),
      title:        fields.title.trim(),
      description:  fields.description.trim(),
      priority:     fields.priority,
      status:       'open',
      reporter_name: fields.reporter_name.trim(),
      created_at:   nowISO(),
      updated_at:   nowISO(),
      latest_update: '',
    };

    // Optimistic update
    setIncidents(prev => [incident, ...prev]);
    setUpdates(prev  => ({ ...prev, [incident.id]: [] }));

    // Background POST to backend (non-blocking)
    try {
      await fetch(`${API_BASE}/incidents`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(incident),
      });
    } catch {
      // Backend offline — local state is the source of truth
    }

    return incident;
  }, []);

  // ── Change status ────────────────────────────────────────
  const changeStatus = useCallback(async (incidentId, status) => {
    const updatedAt = nowISO();

    setIncidents(prev =>
      prev.map(i => i.id === incidentId ? { ...i, status, updated_at: updatedAt } : i)
    );

    try {
      await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
    } catch { /* offline */ }
  }, []);

  // ── Post update ──────────────────────────────────────────
  const postUpdate = useCallback(async (incidentId, message, authorName) => {
    const update = {
      id:          genId(),
      incident_id: incidentId,
      message:     message.trim(),
      author_name: authorName.trim(),
      created_at:  nowISO(),
    };

    // Optimistic update
    setUpdates(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), update],
    }));
    setIncidents(prev =>
      prev.map(i =>
        i.id === incidentId
          ? { ...i, latest_update: update.message, updated_at: update.created_at }
          : i
      )
    );

    try {
      await fetch(`${API_BASE}/incidents/${incidentId}/updates`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(update),
      });
    } catch { /* offline */ }

    return update;
  }, []);

  // ── Receive real-time events from WebSocket ─────────────
  const onIncidentCreated = useCallback((incident) => {
    setIncidents(prev => {
      if (prev.find(i => i.id === incident.id)) return prev; // dedup
      return [incident, ...prev];
    });
    setUpdates(prev => ({ ...prev, [incident.id]: [] }));
  }, []);

  const onUpdatePosted = useCallback(({ incidentId, update }) => {
    setUpdates(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []).filter(u => u.id !== update.id), update],
    }));
    setIncidents(prev =>
      prev.map(i =>
        i.id === incidentId
          ? { ...i, latest_update: update.message, updated_at: update.created_at }
          : i
      )
    );
  }, []);

  const onStatusChanged = useCallback(({ incidentId, status }) => {
    setIncidents(prev =>
      prev.map(i => i.id === incidentId ? { ...i, status, updated_at: nowISO() } : i)
    );
  }, []);

  // ── Store AI result ──────────────────────────────────────
  const saveAiResult = useCallback((incidentId, type, resultText) => {
    const result = { id: genId(), incident_id: incidentId, type, result_text: resultText, created_at: nowISO() };
    setAiResults(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), result],
    }));
  }, []);

  return {
    incidents, updates, aiResults, loading, error,
    createIncident, changeStatus, postUpdate, saveAiResult,
    onIncidentCreated, onUpdatePosted, onStatusChanged,
  };
}
