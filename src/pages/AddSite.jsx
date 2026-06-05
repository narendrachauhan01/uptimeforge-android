import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function AddSite() {
  const nav = useNavigate();
  const { showToast } = useAuth();
  const [form, setForm] = useState({
    name: '', url: '', interval: '60',
    alertEmail: true, alertWhatsapp: false, alertWebhook: false,
    webhookUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = k => () => setForm(f => ({ ...f, [k]: !f[k] }));

  const submit = async e => {
    e.preventDefault();
    if (!form.url) return showToast('Enter a URL', 'error');
    let url = form.url.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setLoading(true);
    try {
      await api.post('/api/sites', { ...form, url, interval: Number(form.interval) });
      showToast('Site added!');
      nav('/sites');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add site', 'error');
    } finally { setLoading(false); }
  };

  const Toggle = ({ label, value, onToggle, icon }) => (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: '#1e1350', borderRadius: 12,
      border: '1px solid #2d1f6e', marginBottom: 10, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? '#7c3aed' : '#2d1f6e',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 15, marginBottom: 12, padding: 0 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Add New Site</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Start monitoring in seconds</p>
      </div>

      <div style={{ padding: '20px' }}>
        <form onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Site Name</label>
            <input className="input" placeholder="My Website" value={form.name} onChange={set('name')} />
          </div>
          <div className="input-group">
            <label className="input-label">URL *</label>
            <input className="input" placeholder="https://example.com" value={form.url} onChange={set('url')}
              inputMode="url" autoCapitalize="none" />
          </div>
          <div className="input-group">
            <label className="input-label">Check Interval</label>
            <select className="input" value={form.interval} onChange={set('interval')}>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 1 minute</option>
              <option value="300">Every 5 minutes</option>
              <option value="600">Every 10 minutes</option>
            </select>
          </div>

          <div className="section-title" style={{ marginTop: 20 }}>Alert Methods</div>
          <Toggle label="Email alerts" value={form.alertEmail} onToggle={toggle('alertEmail')} icon="📧" />
          <Toggle label="WhatsApp alerts" value={form.alertWhatsapp} onToggle={toggle('alertWhatsapp')} icon="💬" />
          <Toggle label="Webhook alerts" value={form.alertWebhook} onToggle={toggle('alertWebhook')} icon="🔗" />

          {form.alertWebhook && (
            <div className="input-group">
              <label className="input-label">Webhook URL</label>
              <input className="input" placeholder="https://hooks.example.com/..." value={form.webhookUrl} onChange={set('webhookUrl')} />
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ marginTop: 16, height: 52, fontSize: 16 }}>
            {loading ? '⏳ Adding...' : '+ Add Site'}
          </button>
        </form>
      </div>
    </div>
  );
}
