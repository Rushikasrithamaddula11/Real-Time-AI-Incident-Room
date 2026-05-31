// ============================================================
// App.jsx — root component
// Wires: state, WebSocket, routing between views
// ============================================================
import React, { useState, useCallback } from 'react';

import Header              from './components/Header';
import Ticker              from './components/Ticker';
import StatBar             from './components/StatBar';
import FilterBar           from './components/FilterBar';
import Dashboard           from './components/Dashboard';
import IncidentDetail      from './components/IncidentDetail';
import CreateIncidentModal from './components/CreateIncidentModal';

import { useIncidents }   from './hooks/useIncidents';
import { useWebSocket }   from './hooks/useWebSocket';

import './styles/global.css';

export default function App() {
  // ── State ────────────────────────────────────────────────
  const [showCreate, setShowCreate]   = useState(false);
  const [selected,   setSelected]     = useState(null);
  const [filter,     setFilter]       = useState({ status: '', priority: '' });
  const [sort,       setSort]         = useState('updated');
  const [search,     setSearch]       = useState('');

  // ── Incidents hook ───────────────────────────────────────
  const {
    incidents, updates, loading,
    createIncident, changeStatus, postUpdate, saveAiResult,
    onIncidentCreated, onUpdatePosted, onStatusChanged,
  } = useIncidents();

  // ── WebSocket ────────────────────────────────────────────
  const { connected: wsConnected } = useWebSocket({
    onIncidentCreated,
    onUpdatePosted,
    onStatusChanged,
  });

  // ── Handlers ─────────────────────────────────────────────
  const handleCreate = useCallback(async (fields) => {
    const inc = await createIncident(fields);
    setShowCreate(false);
    // Open the new incident immediately
    setSelected(inc);
  }, [createIncident]);

  const handleStatusChange = useCallback((incidentId, status) => {
    changeStatus(incidentId, status);
    // Keep selected in sync
    if (selected?.id === incidentId) {
      setSelected(prev => ({ ...prev, status }));
    }
  }, [changeStatus, selected]);

  const handleAddUpdate = useCallback(async (incidentId, message, author) => {
    await postUpdate(incidentId, message, author);
  }, [postUpdate]);

  const handleSelect = useCallback((inc) => {
    // Always read latest from store
    setSelected(inc);
  }, []);

  // Derive selected incident from store so it stays live
  const liveSelected = selected
    ? incidents.find(i => i.id === selected.id) || selected
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header
        incidents={incidents}
        wsConnected={wsConnected}
        onNew={() => setShowCreate(true)}
      />

      <Ticker incidents={incidents} />
      <StatBar incidents={incidents} />

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        search={search}
        setSearch={setSearch}
      />

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#333', fontSize: 12, letterSpacing: 1 }}>
          LOADING…
        </div>
      ) : (
        <Dashboard
          incidents={incidents}
          updates={updates}
          filter={filter}
          sort={sort}
          search={search}
          onSelect={handleSelect}
          onNew={() => setShowCreate(true)}
        />
      )}

      {/* Create incident modal */}
      {showCreate && (
        <CreateIncidentModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {/* Incident detail panel */}
      {liveSelected && (
        <IncidentDetail
          incident={liveSelected}
          updates={updates[liveSelected.id] || []}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onAddUpdate={handleAddUpdate}
          onAiResultSaved={saveAiResult}
        />
      )}
    </div>
  );
}
