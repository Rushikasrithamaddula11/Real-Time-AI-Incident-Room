// ============================================================
// IncidentDetail — slide-in right panel
// Shows: incident info, status controls, live update feed,
//        post-update form, and AI assist.
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import Badge from './Badge';
import AIPanel from './AIPanel';
import { STATUSES, COLORS, fmtTime, fmtDate, timeAgo } from '../utils/constants';

// ── Sub-components ────────────────────────────────────────────

function StatusButton({ status, active, onClick }) {
  const c = COLORS[status];
  return (
    <button
      onClick={onClick}
      style={{
        padding:       '5px 14px',
        fontSize:      10,
        letterSpacing: 1,
        fontWeight:    700,
        textTransform: 'uppercase',
        background:    active ? c.bg   : 'none',
        color:         active ? c.text : '#444',
        border:        `1px solid ${active ? c.border : '#2a2a2a'}`,
        borderRadius:  2,
        transition:    'all 0.15s',
      }}
    >
      {status}
    </button>
  );
}

function UpdateItem({ update, isLatest }) {
  return (
    <div
      className={isLatest ? 'slide-in' : ''}
      style={{
        marginBottom: 10,
        padding:      '10px 12px',
        background:   '#111',
        border:       '1px solid #1a1a1a',
        borderLeft:   '2px solid #1d7ed830',
        borderRadius: 2,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: '#1d7ed8', fontWeight: 700 }}>
          {update.author_name}
        </span>
        <span style={{ fontSize: 10, color: '#333', fontFamily: 'monospace' }}>
          {fmtTime(update.created_at)}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.55 }}>
        {update.message}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function IncidentDetail({
  incident,
  updates,
  onClose,
  onStatusChange,
  onAddUpdate,
  onAiResultSaved,
}) {
  const [msg,     setMsg]     = useState('');
  const [author,  setAuthor]  = useState('');
  const [posting, setPosting] = useState(false);
  const [msgErr,  setMsgErr]  = useState('');
  const feedRef = useRef(null);

  // Auto-scroll to bottom on new updates
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [updates]);

  const handlePost = async () => {
    if (!msg.trim())    { setMsgErr('Message is required');      return; }
    if (!author.trim()) { setMsgErr('Author name is required');  return; }
    setMsgErr('');
    setPosting(true);
    await onAddUpdate(incident.id, msg, author);
    setMsg('');
    setPosting(false);
  };

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        background: 'rgba(0,0,0,0.88)',
        zIndex:     90,
        display:    'flex',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="slide-in-right"
        style={{
          marginLeft:     'auto',
          width:          'min(680px, 100vw)',
          height:         '100vh',
          background:     '#0d0d0d',
          borderLeft:     '1px solid #1a1a1a',
          display:        'flex',
          flexDirection:  'column',
          overflow:       'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding:       '20px 24px',
            borderBottom:  '1px solid #1a1a1a',
            background:    '#000',
            flexShrink:    0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <Badge value={incident.priority} />
                <Badge value={incident.status}   />
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 4 }}>
                {incident.title}
              </h2>
              <span style={{ fontSize: 11, color: '#333' }}>
                by {incident.reporter_name} · {fmtDate(incident.created_at)}
                {incident.updated_at !== incident.created_at && (
                  <span style={{ color: '#2a2a2a' }}> · updated {timeAgo(incident.updated_at)}</span>
                )}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', color: '#444', fontSize: 20, padding: '0 4px', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>

          {incident.description && (
            <p
              style={{
                marginTop:   12,
                fontSize:    12,
                color:       '#666',
                lineHeight:  1.65,
                borderLeft:  '2px solid #1d7ed825',
                paddingLeft: 10,
              }}
            >
              {incident.description}
            </p>
          )}

          {/* Status workflow */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <StatusButton
                key={s}
                status={s}
                active={incident.status === s}
                onClick={() => onStatusChange(incident.id, s)}
              />
            ))}
          </div>
        </div>

        {/* ── FEED ── */}
        <div
          ref={feedRef}
          style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}
        >
          <div
            style={{
              fontSize:      9,
              color:         '#2a2a2a',
              letterSpacing: 2,
              marginBottom:  12,
              textTransform: 'uppercase',
            }}
          >
            {'//'} Live Update Feed
          </div>

          {updates.length === 0 ? (
            <div
              style={{
                fontSize:   12,
                color:      '#2a2a2a',
                textAlign:  'center',
                padding:    '32px 0',
              }}
            >
              No updates yet. Post the first update below.
            </div>
          ) : (
            updates.map((u, i) => (
              <UpdateItem
                key={u.id}
                update={u}
                isLatest={i === updates.length - 1}
              />
            ))
          )}
        </div>

        {/* ── POST UPDATE ── */}
        <div
          style={{
            padding:       '14px 24px',
            borderTop:     '1px solid #1a1a1a',
            background:    '#080808',
            flexShrink:    0,
          }}
        >
          <div
            style={{
              fontSize:      9,
              color:         '#2a2a2a',
              letterSpacing: 2,
              marginBottom:  10,
              textTransform: 'uppercase',
            }}
          >
            {'//'} Post Update
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 156px', gap: 8, marginBottom: msgErr ? 6 : 0 }}>
            <textarea
              value={msg}
              onChange={e => { setMsg(e.target.value); setMsgErr(''); }}
              placeholder="Describe the latest finding, action taken, or status change…"
              style={{ height: 64, resize: 'none' }}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handlePost(); }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Your name"
                style={{ flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') handlePost(); }}
              />
              <button
                onClick={handlePost}
                disabled={posting}
                style={{
                  background:    '#1d7ed8',
                  color:         '#fff',
                  padding:       '8px',
                  fontSize:      10,
                  letterSpacing: 1.5,
                  fontWeight:    700,
                  textTransform: 'uppercase',
                  borderRadius:  2,
                }}
              >
                {posting ? '…' : 'POST'}
              </button>
            </div>
          </div>

          {msgErr && (
            <div style={{ fontSize: 11, color: '#e63946', marginBottom: 4 }}>{msgErr}</div>
          )}
          <span style={{ fontSize: 10, color: '#2a2a2a' }}>ctrl+enter to post</span>
        </div>

        {/* ── AI PANEL ── */}
        <div style={{ padding: '0 24px 24px', flexShrink: 0 }}>
          <AIPanel
            incident={incident}
            updates={updates}
            onResultSaved={onAiResultSaved}
          />
        </div>
      </div>
    </div>
  );
}
