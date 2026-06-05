import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function Recipients() {
  const { showToast } = useAuth();
  const nav = useNavigate();
  const [recipients, setRecipients] = useState([]);
  const [limit, setLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/recipients');
      setRecipients(data.recipients || []);
      setLimit(data.limit ?? null);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ name: '', phone: '', email: '' });

  const startAdd = () => {
    resetForm();
    setEditing(null);
    setShowAdd(true);
  };

  const startEdit = (r) => {
    setForm({ name: r.name || '', phone: r.phone || '', email: r.email || '' });
    setEditing(r._id);
    setShowAdd(true);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Name is required', 'error');
    if (!form.phone?.trim() && !form.email?.trim()) return showToast('Phone or email required', 'error');
    setSaving(true);
    try {
      const payload = {
        name:  form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      };
      if (editing) {
        await api.put(`/api/recipients/${editing}`, payload);
        showToast('Recipient updated');
      } else {
        await api.post('/api/recipients', payload);
        showToast('Recipient added');
      }
      setShowAdd(false);
      setEditing(null);
      resetForm();
      load();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const toggleActive = async (r) => {
    try {
      await api.put(`/api/recipients/${r._id}`, { active: !r.active });
      setRecipients(prev => prev.map(x => x._id === r._id ? { ...x, active: !x.active } : x));
    } catch (err) {
      showToast(err.displayMessage || 'Failed to update', 'error');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/recipients/${id}`);
      showToast('Deleted');
      load();
    } catch (err) {
      showToast(err.displayMessage || 'Delete failed', 'error');
    }
  };

  const atLimit = limit !== null && recipients.length >= limit;

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Recipients</h1>
          <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>
            {limit !== null ? `${recipients.length} / ${limit} used` : `${recipients.length} total`}
          </p>
        </div>
        <button
          onClick={startAdd}
          disabled={atLimit}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '8px 16px', height: 36, fontSize: 13, opacity: atLimit ? 0.5 : 1 }}
        >
          + Add
        </button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {atLimit && !showAdd && (
          <div style={{ background: '#78350f22', border: '1px solid #f59e0b44', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#f59e0b' }}>
            Recipient limit reached. Upgrade plan to add more.
          </div>
        )}

        {showAdd && (
          <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #7c3aed44', padding: 16, marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>{editing ? 'Edit Recipient' : 'Add Recipient'}</div>
            <form onSubmit={save}>
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input className="input" placeholder="Narendra Singh" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone (for WhatsApp/SMS)</label>
                <input className="input" type="tel" placeholder="+919876543210" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setShowAdd(false); setEditing(null); resetForm(); }} style={{
                  flex: 1, height: 44, borderRadius: 10, background: '#2d1f6e', border: '1px solid #4a4070',
                  color: '#8b7fb8', fontSize: 14, cursor: 'pointer',
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 2, height: 44, fontSize: 14 }}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Recipient'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? <div className="spinner" /> : recipients.length === 0 && !showAdd ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No recipients</div>
            <div className="empty-desc">Add phone/email contacts for alert notifications</div>
          </div>
        ) : recipients.map(r => (
          <div key={r._id} style={{
            background: '#1e1350', borderRadius: 14,
            border: `1px solid ${r.active ? '#2d1f6e' : '#1a1a40'}`,
            padding: '14px 16px', marginBottom: 10,
            opacity: r.active ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2d9f3', marginBottom: 3 }}>{r.name}</div>
                {r.phone && <div style={{ fontSize: 12, color: '#8b7fb8' }}>📱 {r.phone}</div>}
                {r.email && <div style={{ fontSize: 12, color: '#8b7fb8', marginTop: 1 }}>📧 {r.email}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 10, flexShrink: 0 }}>
                <button onClick={() => toggleActive(r)} style={{
                  background: r.active ? '#064e3b22' : '#1f2937', border: `1px solid ${r.active ? '#10b98144' : '#374151'}`,
                  color: r.active ? '#10b981' : '#6b7280', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>{r.active ? 'On' : 'Off'}</button>
                <button onClick={() => startEdit(r)} style={{
                  background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa',
                  borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer',
                }}>Edit</button>
                <button onClick={() => remove(r._id)} style={{
                  background: '#7f1d1d22', border: '1px solid #ef444444', color: '#ef4444',
                  borderRadius: 8, padding: '5px 8px', fontSize: 12, cursor: 'pointer',
                }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
