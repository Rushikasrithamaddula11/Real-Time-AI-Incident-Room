// ============================================================
// Header — top navigation / ops bar
// ============================================================
import React, { useState, useEffect } from 'react';

export default function Header({ incidents, wsConnected, onNew }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const active   = incidents.filter(i => i.status !== 'resolved').length;
  const critical = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

  return (
    <header
      style={{
        background:    '#000',
        borderBottom:  '1px solid #1a1a1a',
        padding:       '0 24px',
        position:      'sticky',
        top:           0,
        zIndex:        50,
      }}
    >
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:         56,
        }}
      >
        {/* Left — logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width:        8,
                height:       8,
                borderRadius: '50%',
                background:   active > 0 ? '#e63946' : '#2ecc71',
                display:      'inline-block',
              }}
              className={active > 0 ? 'pulse' : ''}
            />
            <span
              style={{
                fontSize:      15,
                fontWeight:    700,
                letterSpacing: 2.5,
                color:         '#fff',
                textTransform: 'uppercase',
              }}
            >
              Incident Room
            </span>
          </div>

          <span style={{ color: '#1a1a1a' }}>|</span>

          <span style={{ fontSize: 10, color: '#444', letterSpacing: 1.5 }}>
            REAL-TIME OPS CONSOLE
          </span>

          {/* WS connection indicator */}
          <span
            title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected (running locally)'}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           5,
              fontSize:      10,
              color:         wsConnected ? '#2ecc71' : '#555',
              letterSpacing: 1,
              cursor:        'default',
            }}
          >
            <span
              style={{
                width:        5,
                height:       5,
                borderRadius: '50%',
                background:   wsConnected ? '#2ecc71' : '#333',
                display:      'inline-block',
              }}
            />
            {wsConnected ? 'LIVE' : 'LOCAL'}
          </span>
        </div>

        {/* Right — stats + clock + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {critical > 0 && (
            <span
              style={{ fontSize: 11, color: '#e63946', letterSpacing: 1, fontWeight: 700 }}
              className="blink"
            >
              ⚠ {critical} CRITICAL
            </span>
          )}

          <span style={{ fontSize: 11, color: '#555', letterSpacing: 0.8 }}>
            {active} ACTIVE
          </span>

          <span
            style={{
              fontSize:    11,
              color:       '#333',
              letterSpacing: 0.5,
              fontFamily:  'monospace',
            }}
          >
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>

          <button
            onClick={onNew}
            style={{
              background:    '#e63946',
              color:         '#fff',
              border:        'none',
              padding:       '7px 18px',
              fontSize:      11,
              letterSpacing: 1.5,
              fontWeight:    700,
              textTransform: 'uppercase',
              borderRadius:  2,
            }}
          >
            + NEW
          </button>
        </div>
      </div>
    </header>
  );
}
