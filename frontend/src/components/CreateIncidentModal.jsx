// ============================================================
// CreateIncidentModal — new incident form
// ============================================================
import React, { useState } from 'react';
import Modal from './Modal';
import { PRIORITIES } from '../utils/constants';

const Field = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display:       'block',
        fontSize:      10,
        color:         '#555',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom:  6,
      }}
    >
      {label}
      {required && <span style={{ color: '#e63946', marginLeft: 4 }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={{ display: 'block', fontSize: 11, color: '#e63946', marginTop: 4 }}>
        {error}
      </span>
    )}
  </div>
);

export default function CreateIncidentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title:         '',
    description:   '',
    priority:      'high',
    reporter_name: '',
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())         e.title         = 'Title is required';
    if (!form.reporter_name.trim()) e.reporter_name = 'Reporter name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <Modal title="Create incident" onClose={onClose}>
      <Field label="Title" required error={errors.title}>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Brief incident title…"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="What is happening? Include error messages, affected users, timeline…"
          style={{ height: 88 }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Priority" required>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </Field>

        <Field label="Reporter Name" required error={errors.reporter_name}>
          <input
            value={form.reporter_name}
            onChange={e => set('reporter_name', e.target.value)}
            placeholder="Your name"
          />
        </Field>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={submit}
          disabled={saving}
          style={{
            flex:          1,
            background:    '#e63946',
            color:         '#fff',
            padding:       '10px',
            fontSize:      11,
            letterSpacing: 1.5,
            fontWeight:    700,
            textTransform: 'uppercase',
            borderRadius:  2,
          }}
        >
          {saving ? '…' : 'CREATE INCIDENT'}
        </button>
        <button
          onClick={onClose}
          style={{
            padding:      '10px 16px',
            background:   'none',
            color:        '#555',
            border:       '1px solid #2a2a2a',
            borderRadius: 2,
            fontSize:     12,
          }}
        >
          CANCEL
        </button>
      </div>
    </Modal>
  );
}
