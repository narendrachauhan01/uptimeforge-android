import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../App';

export default function PingMonitor() {
  const { showToast } = useAuth();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', host: '', type: 'icmp' });
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
    if (!form.host.trim()) return showToast('Host is required', 'error');
    setSaving(true);
    try {
      await api.post('/api/ping-targets', form);
      showToast('Ping target added');
      setShowAdd(false);
      setForm({ label: '', host: '', type: 'icmp' });
      load();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Failed to add', 'error');
    } finally { setSaving(false); }
  };

  const ping = async (id, host) => {
    setPinging(p => ({ ...p, [id]: true }));
    try {
      const { data } = await api.post('/api/ping', { host });
      showToast(`${host}: ${data.alive ? `alive ${data.time}ms` : 'no response'}`, data.alive ? 'success' : 'error');
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

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ping Monitor</h1>
          <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Monitor hosts via ICMP/HTTP</p>
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
                <label className="input-label">Label</label>
                <input className="input" placeholder="My Server" value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Host / IP *</label>
                <input className="input" placeholder="8.8.8.8 or google.com" value={form.host}
                  onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="icmp">ICMP Ping</option>
                  <option value="http">HTTP</option>
                  <option value="tcp">TCP Port</option>
                </select>
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
            <div className="empty-desc">Add a host to start pinging</div>
          </div>
        ) : targets.map(t => (
          <div key={t._id} style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2d9f3' }}>{t.label || t.host}</div>
                <div style={{ fontSize: 12, color: '#8b7fb8', marginTop: 2 }}>{t.host} · {(t.type || 'icmp').toUpperCase()}</div>
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
