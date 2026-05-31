// ============================================================
// Ticker — scrolling live-incident marquee
// ============================================================
import React from 'react';
import { timeAgo } from '../utils/constants';

const styles = {
  wrap: {
    background:   '#000',
    borderBottom: '1px solid #1a1a1a',
    padding:      '5px 0',
    overflow:     'hidden',
    position:     'relative',
    minHeight:    28,
  },
  inner: {
    display:    'flex',
    gap:        60,
    animation:  'ticker 40s linear infinite',
    whiteSpace: 'nowrap',
  },
  item: { fontSize: 10, color: '#666', letterSpacing: 0.5 },
  dot:  { color: '#e63946', marginRight: 6 },
  tag:  { color: '#fff',    marginRight: 6, fontWeight: 700 },
  ago:  { color: '#333',    marginLeft: 6, marginRight: 20 },
};

export default function Ticker({ incidents }) {
  const active = incidents.filter(i => i.status !== 'resolved');
  if (!active.length) return null;

  // Duplicate for seamless loop
  const items = [...active, ...active];

  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {items.map((inc, i) => (
          <span key={`${inc.id}-${i}`} style={styles.item}>
            <span style={styles.dot}>●</span>
            <span style={styles.tag}>[{inc.priority.toUpperCase()}]</span>
            {inc.title}
            <span style={styles.ago}>— {timeAgo(inc.created_at)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
