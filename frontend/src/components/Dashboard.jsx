// ============================================================
// Dashboard — incident grid + empty state
// ============================================================
import React from 'react';
import IncidentCard from './IncidentCard';
import { PRIORITY_ORDER } from '../utils/constants';

export default function Dashboard({
  incidents,
  updates,
  filter,
  sort,
  search,
  onSelect,
  onNew,
}) {
  const filtered = incidents
    .filter(i => {
      if (filter.status   && i.status   !== filter.status)   return false;
      if (filter.priority && i.priority !== filter.priority) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!i.title.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'created')  return new Date(b.created_at) - new Date(a.created_at);
      return new Date(b.updated_at) - new Date(a.updated_at); // default: latest updated
    });

  // Empty state
  if (filtered.length === 0) {
    const hasFilters = filter.status || filter.priority || search;
    return (
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '80px 20px',
          textAlign:      'center',
        }}
      >
        <span style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>◈</span>
        <p style={{ fontSize: 13, color: '#333', letterSpacing: 1 }}>
          {hasFilters ? 'NO INCIDENTS MATCH YOUR FILTERS' : 'NO INCIDENTS YET'}
        </p>
        {hasFilters ? (
          <p style={{ fontSize: 11, color: '#2a2a2a', marginTop: 6 }}>
            Try adjusting the filters above.
          </p>
        ) : (
          <button
            onClick={onNew}
            style={{
              marginTop:     20,
              background:    'none',
              color:         '#e63946',
              border:        '1px solid #e6394630',
              padding:       '9px 22px',
              fontSize:      11,
              letterSpacing: 1.5,
              fontWeight:    700,
              textTransform: 'uppercase',
              borderRadius:  2,
            }}
          >
            + CREATE FIRST INCIDENT
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display:               'grid',
        gridTemplateColumns:   'repeat(auto-fill, minmax(340px, 1fr))',
        gap:                   12,
        padding:               '20px 24px',
      }}
    >
      {filtered.map(inc => (
        <IncidentCard
          key={inc.id}
          incident={inc}
          updateCount={(updates[inc.id] || []).length}
          onClick={() => onSelect(inc)}
        />
      ))}
    </div>
  );
}
