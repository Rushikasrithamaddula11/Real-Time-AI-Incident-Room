// ============================================================
// StatBar — top-level metric row
// ============================================================
import React from 'react';

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 9, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'monospace' }}>
        {value}
      </span>
    </div>
  );
}

const DIVIDER = (
  <span style={{ color: '#1a1a1a', fontSize: 20, alignSelf: 'center' }}>|</span>
);

export default function StatBar({ incidents }) {
  const total = incidents.length;
  const byStatus = { open: 0, investigating: 0, resolved: 0 };
  const byPri    = { critical: 0, high: 0, medium: 0, low: 0 };

  incidents.forEach(i => {
    byStatus[i.status]   = (byStatus[i.status]   || 0) + 1;
    byPri[i.priority]    = (byPri[i.priority]     || 0) + 1;
  });

  return (
    <div
      style={{
        background:    '#000',
        borderBottom:  '1px solid #1a1a1a',
        padding:       '10px 24px',
      }}
    >
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <Stat label="Total"         value={total}                   color="#555"    />
        {DIVIDER}
        <Stat label="Open"          value={byStatus.open}           color="#e63946" />
        <Stat label="Investigating" value={byStatus.investigating}  color="#1d7ed8" />
        <Stat label="Resolved"      value={byStatus.resolved}       color="#2ecc71" />
        {DIVIDER}
        <Stat label="Critical"      value={byPri.critical}          color="#e63946" />
        <Stat label="High"          value={byPri.high}              color="#f4a261" />
        <Stat label="Medium"        value={byPri.medium}            color="#1d7ed8" />
        <Stat label="Low"           value={byPri.low}               color="#2ecc71" />
      </div>
    </div>
  );
}
