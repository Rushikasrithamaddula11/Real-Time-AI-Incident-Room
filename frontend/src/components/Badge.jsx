// ============================================================
// Badge — coloured status / priority pill
// ============================================================
import React from 'react';
import { COLORS } from '../utils/constants';

export default function Badge({ value, small = false }) {
  const c = COLORS[value] || { bg: '#222', text: '#888', border: '#333' };
  return (
    <span
      style={{
        display:       'inline-block',
        padding:       small ? '2px 7px' : '3px 10px',
        fontSize:      small ? 9 : 10,
        fontWeight:    700,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        background:    c.bg,
        color:         c.text,
        border:        `1px solid ${c.border}`,
        borderRadius:  2,
        whiteSpace:    'nowrap',
      }}
    >
      {value}
    </span>
  );
}
