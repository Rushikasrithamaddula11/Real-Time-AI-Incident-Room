// ============================================================
// IncidentCard — single incident on the dashboard grid
// ============================================================
import React, { useState } from 'react';
import Badge from './Badge';
import { COLORS, timeAgo } from '../utils/constants';

export default function IncidentCard({ incident, updateCount, onClick }) {
  const [hovered, setHovered] = useState(false);
  const c = COLORS[incident.status];

  return (
    <article
      onClick={onClick}
      className="fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? '#151515' : '#111',
        border:       '1px solid #1a1a1a',
        borderLeft:   `3px solid ${hovered ? c.text : c.border}`,
        borderRadius: 3,
        padding:      '14px 16px',
        cursor:       'pointer',
        transition:   'all 0.15s',
        position:     'relative',
      }}
    >
      {/* Row 1 — badges + meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge value={incident.priority} small />
          <Badge value={incident.status}   small />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {updateCount > 0 && (
            <span style={{ fontSize: 10, color: '#444' }}>
              ↺ {updateCount}
            </span>
          )}
          <span style={{ fontSize: 10, color: '#333', fontFamily: 'monospace' }}>
            {timeAgo(incident.created_at)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize:   13,
          fontWeight: 700,
          color:      hovered ? '#fff' : '#e8e8e8',
          marginBottom: 5,
          lineHeight: 1.35,
          transition: 'color 0.15s',
        }}
      >
        {incident.title}
      </h3>

      {/* Description excerpt */}
      {incident.description && (
        <p
          style={{
            fontSize:              11,
            color:                 '#555',
            lineHeight:            1.55,
            marginBottom:          8,
            display:               '-webkit-box',
            WebkitLineClamp:       2,
            WebkitBoxOrient:       'vertical',
            overflow:              'hidden',
          }}
        >
          {incident.description}
        </p>
      )}

      {/* Latest update */}
      {incident.latest_update && (
        <p
          style={{
            fontSize:    11,
            color:       '#444',
            fontStyle:   'italic',
            borderLeft:  '1px solid #2a2a2a',
            paddingLeft: 8,
            marginBottom: 10,
            lineHeight:  1.5,
            display:               '-webkit-box',
            WebkitLineClamp:       1,
            WebkitBoxOrient:       'vertical',
            overflow:              'hidden',
          }}
        >
          {incident.latest_update}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 10, color: '#333' }}>
          by <span style={{ color: '#555' }}>{incident.reporter_name}</span>
        </span>
        <span style={{ fontSize: 10, color: hovered ? '#1d7ed860' : '#1d7ed820', letterSpacing: 1, transition: 'color 0.15s' }}>
          VIEW →
        </span>
      </div>
    </article>
  );
}
