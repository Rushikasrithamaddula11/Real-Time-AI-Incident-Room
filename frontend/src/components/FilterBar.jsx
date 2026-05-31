// ============================================================
// FilterBar — search / filter / sort controls
// ============================================================
import React from 'react';
import { STATUSES, PRIORITIES } from '../utils/constants';

export default function FilterBar({ filter, setFilter, sort, setSort, search, setSearch }) {
  const set = (key, val) => setFilter(prev => ({ ...prev, [key]: val }));

  const hasFilters = filter.status || filter.priority || search;

  return (
    <div
      style={{
        background:    '#000',
        borderBottom:  '1px solid #1a1a1a',
        padding:       '10px 24px',
        display:       'flex',
        gap:           10,
        alignItems:    'center',
        flexWrap:      'wrap',
      }}
    >
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search incidents…"
        style={{ width: 210, fontSize: 12 }}
      />

      {/* Status filter */}
      <select
        value={filter.status}
        onChange={e => set('status', e.target.value)}
        style={{ width: 150, fontSize: 12 }}
      >
        <option value="">All statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Priority filter */}
      <select
        value={filter.priority}
        onChange={e => set('priority', e.target.value)}
        style={{ width: 150, fontSize: 12 }}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        style={{ width: 170, fontSize: 12 }}
      >
        <option value="updated">Latest updated</option>
        <option value="created">Newest created</option>
        <option value="priority">Priority (critical first)</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => { setSearch(''); setFilter({ status: '', priority: '' }); }}
          style={{
            background:    'none',
            color:         '#555',
            border:        '1px solid #2a2a2a',
            padding:       '6px 12px',
            fontSize:      11,
            letterSpacing: 1,
            borderRadius:  2,
          }}
        >
          CLEAR ✕
        </button>
      )}

      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#2a2a2a', letterSpacing: 0.5 }}>
        FILTER
      </span>
    </div>
  );
}
