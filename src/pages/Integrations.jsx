import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../App';

const INTEGRATION_TYPES = [
  { type: 'slack',    label: 'Slack',    icon: '💬', placeholder: 'https://hooks.slack.com/...' },
  { type: 'discord',  label: 'Discord',  icon: '🎮', placeholder: 'https://discord.com/api/webhooks/...' },
  { type: 'telegram', label: 'Telegram', icon: '✈️', placeholder: 'https://api.telegram.org/bot.../...' },
  { type: 'webhook',  label: 'Webhook',  icon: '🔗', placeholder: 'https://your-webhook-url.com' },
];

export default function Integrations() {
  const { showToast } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/integrations');
      setIntegrations(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getIntegration = type => integrations.find(i => i.type === type);

  const startEdit = (type) => {
    const existing = getIntegration(type);
    setEditing(type);
    setUrl(existing?.config?.url || existing?.config?.webhookUrl || '');
  };

  const save = async () => {
    if (!url.trim()) return showToast('URL is required', 'error');
    setSaving(true);
    try {
      await api.post(`/api/integrations/${editing}`, {
        config: { url, webhookUrl: url },
        events: 'all',
        active: true,
      });
      showToast('Integration saved');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const test = async () => {
    if (!url.trim()) return showToast('URL is required', 'error');
    setTesting(true);
    try {
      await api.post('/api/integrations/test-webhook', { url });
      showToast('Test sent successfully!');
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Test failed', 'error');
    } finally { setTesting(false); }
  };

  const remove = async (type) => {
    try {
      await api.delete(`/api/integrations/${type}`);
      showToast('Removed');
      load();
    } catch (err) {
      showToast(err.displayMessage || 'Failed to remove', 'error');
    }
  };

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Integrations</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Connect webhooks & notifications</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? <div className="spinner" /> : (
          INTEGRATION_TYPES.map(({ type, label, icon, placeholder }) => {
            const existing = getIntegration(type);
            const isEditing = editing === type;

            return (
              <div key={type} style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? 12 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                      {existing && !isEditing && (
                        <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>● Connected</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {existing && !isEditing && (
                      <button onClick={() => remove(type)} style={{ background: '#7f1d1d22', border: '1px solid #ef444444', color: '#ef4444', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Remove</button>
                    )}
                    <button onClick={() => isEditing ? setEditing(null) : startEdit(type)} style={{
                      background: isEditing ? '#2d1f6e' : '#7c3aed22', border: `1px solid ${isEditing ? '#4a4070' : '#7c3aed44'}`,
                      color: isEditing ? '#8b7fb8' : '#a78bfa', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {isEditing ? 'Cancel' : existing ? 'Edit' : 'Setup'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <input className="input" placeholder={placeholder} value={url}
                      onChange={e => setUrl(e.target.value)} style={{ marginBottom: 10 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={test} disabled={testing} style={{
                        flex: 1, height: 40, borderRadius: 10, background: '#2d1f6e', border: '1px solid #4a4070',
                        color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        {testing ? 'Testing...' : 'Test'}
                      </button>
                      <button onClick={save} disabled={saving} style={{
                        flex: 2, height: 40, borderRadius: 10, background: '#7c3aed', border: 'none',
                        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
