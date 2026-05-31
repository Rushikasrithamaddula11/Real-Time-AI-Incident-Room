// ============================================================
// Modal — reusable overlay wrapper
// ============================================================
import React, { useEffect } from 'react';

export default function Modal({ title, onClose, children, wide = false }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.9)',
        zIndex:         100,
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'center',
        paddingTop:     60,
        paddingBottom:  40,
        overflowY:      'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="slide-in"
        style={{
          background:   '#111',
          border:       '1px solid #2a2a2a',
          borderRadius: 4,
          width:        '100%',
          maxWidth:     wide ? 720 : 560,
          padding:      28,
          position:     'relative',
          margin:       '0 16px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   22,
          }}
        >
          <span
            style={{
              fontSize:      12,
              fontWeight:    700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color:         '#fff',
            }}
          >
            {'//'} {title}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', color: '#555', fontSize: 18, padding: '0 4px' }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
