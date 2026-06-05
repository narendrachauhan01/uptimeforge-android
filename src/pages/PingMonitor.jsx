import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function PingMonitor() {
  const { showToast } = useAuth();
  const nav = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', host: '', port: '' });
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/ping-targets');
      setTargets(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTarget = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) return showToast('Name and host are required', 'error');
    setSaving(true);
    try {
      const payload = { name: form.name, host: form.host };
      if (form.port) payload.port = Number(form.port);
      await api.post('/api/ping-targets', payload);
      showToast('Ping target added');
      setShowAdd(false);
      setForm({ name: '', host: '', port: '' });
      load();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Failed to add', 'error');
    } finally { setSaving(false); }
  };

  const ping = async (id, host) => {
    setPinging(p => ({ ...p, [id]: true }));
    try {
      const { data } = await api.post('/api/ping', { target: host });
      showToast(
        `${host}: ${data.alive ? `alive · ${data.ms}ms` : 'no response'}`,
        data.alive ? 'success' : 'error'
      );
    } catch (err) {
      showToast(err.displayMessage || 'Ping failed', 'error');
    } finally {
      setPinging(p => ({ ...p, [id]: false }));
    }
  };

  const deleteTarget = async id => {
    try {
      await api.delete(`/api/ping-targets/${id}`);
      showToast('Deleted');
      load();
    } catch (err) {
      showToast(err.displayMessage || 'Delete failed', 'error');
    }
  };

  const statusColor = { up: '#10b981', down: '#ef4444', unknown: '#8b7fb8' };

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ping Monitor</h1>
          <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Monitor hosts via TCP ping</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', height: 36, fontSize: 13 }}>
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {showAdd && (
          <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #7c3aed44', padding: 16, marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Add Ping Target</div>
            <form onSubmit={addTarget}>
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input className="input" placeholder="My Server" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Host / IP *</label>
                <input className="input" placeholder="8.8.8.8 or google.com" value={form.host}
                  onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Port (optional, default 80)</label>
                <input className="input" type="number" placeholder="80" value={form.port}
                  onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ height: 44, fontSize: 14 }}>
                {saving ? 'Adding...' : 'Add Target'}
              </button>
            </form>
          </div>
        )}

        {loading ? <div className="spinner" /> : targets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏓</div>
            <div className="empty-title">No ping targets</div>
            <div className="empty-desc">Add a host to start monitoring</div>
          </div>
        ) : targets.map(t => (
          <div key={t._id} style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[t.status] || '#8b7fb8', display: 'inline-block', flexShrink: 0 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2d9f3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                </div>
                <div style={{ fontSize: 12, color: '#8b7fb8' }}>
                  {t.host}{t.port && t.port !== 80 ? `:${t.port}` : ''}
                  {t.responseTime ? ` · ${t.responseTime}ms` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                <button onClick={() => ping(t._id, t.host)} disabled={pinging[t._id]} style={{
                  background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa',
                  borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  {pinging[t._id] ? '...' : 'Ping'}
                </button>
                <button onClick={() => deleteTarget(t._id)} style={{
                  background: '#7f1d1d22', border: '1px solid #ef444444', color: '#ef4444',
                  borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer',
                }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
