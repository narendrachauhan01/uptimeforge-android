import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

const INTEGRATION_TYPES = [
  { type: 'slack',    label: 'Slack',    icon: '💬', isTelegram: false, placeholder: 'https://hooks.slack.com/services/...' },
  { type: 'discord',  label: 'Discord',  icon: '🎮', isTelegram: false, placeholder: 'https://discord.com/api/webhooks/...' },
  { type: 'telegram', label: 'Telegram', icon: '✈️', isTelegram: true  },
  { type: 'webhook',  label: 'Webhook',  icon: '🔗', isTelegram: false, placeholder: 'https://your-webhook-url.com' },
];

export default function Integrations() {
  const { showToast } = useAuth();
  const nav = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [url, setUrl] = useState('');
  const [tgToken, setTgToken] = useState('');
  const [tgChat, setTgChat] = useState('');
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

  const startEdit = (type, isTelegram) => {
    const existing = getIntegration(type);
    setEditing(type);
    if (isTelegram) {
      setTgToken(existing?.config?.botToken || '');
      setTgChat(existing?.config?.chatId || '');
    } else {
      setUrl(existing?.config?.webhookUrl || existing?.config?.url || '');
    }
  };

  const save = async (isTelegram) => {
    if (isTelegram) {
      if (!tgToken.trim() || !tgChat.trim()) return showToast('Bot token and chat ID required', 'error');
    } else {
      if (!url.trim()) return showToast('Webhook URL is required', 'error');
    }
    setSaving(true);
    try {
      const config = isTelegram
        ? { botToken: tgToken.trim(), chatId: tgChat.trim() }
        : { webhookUrl: url.trim(), url: url.trim() };
      await api.post(`/api/integrations/${editing}`, { config, events: 'all', active: true });
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
      showToast('Test message sent!');
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
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Integrations</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Connect webhooks & notifications</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? <div className="spinner" /> : (
          INTEGRATION_TYPES.map(({ type, label, icon, isTelegram, placeholder }) => {
            const existing = getIntegration(type);
            const isEditing = editing === type;
            const connectedInfo = existing
              ? isTelegram
                ? (existing.config?.chatId ? `Chat: ${existing.config.chatId}` : 'Connected')
                : (existing.config?.webhookUrl || existing.config?.url || 'Connected').slice(0, 40) + '...'
              : null;

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
                      {existing && !isEditing && connectedInfo && (
                        <div style={{ fontSize: 10, color: '#4a4070', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{connectedInfo}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {existing && !isEditing && (
                      <button onClick={() => remove(type)} style={{ background: '#7f1d1d22', border: '1px solid #ef444444', color: '#ef4444', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Remove</button>
                    )}
                    <button onClick={() => isEditing ? setEditing(null) : startEdit(type, isTelegram)} style={{
                      background: isEditing ? '#2d1f6e' : '#7c3aed22', border: `1px solid ${isEditing ? '#4a4070' : '#7c3aed44'}`,
                      color: isEditing ? '#8b7fb8' : '#a78bfa', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {isEditing ? 'Cancel' : existing ? 'Edit' : 'Setup'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  isTelegram ? (
                    <>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <label className="input-label">Bot Token</label>
                        <input className="input" placeholder="123456789:ABCdefGHI..." value={tgToken}
                          onChange={e => setTgToken(e.target.value)} />
                      </div>
                      <div className="input-group" style={{ marginBottom: 10 }}>
                        <label className="input-label">Chat ID</label>
                        <input className="input" placeholder="-1001234567890 or @channel" value={tgChat}
                          onChange={e => setTgChat(e.target.value)} />
                      </div>
                      <button onClick={() => save(true)} disabled={saving} style={{
                        width: '100%', height: 40, borderRadius: 10, background: '#7c3aed', border: 'none',
                        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
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
                        <button onClick={() => save(false)} disabled={saving} style={{
                          flex: 2, height: 40, borderRadius: 10, background: '#7c3aed', border: 'none',
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </>
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
