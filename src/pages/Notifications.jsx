import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

const TYPE_ICON = { site_added: '✅', site_updated: '✏️', site_deleted: '🗑️', info: 'ℹ️' };

export default function Notifications() {
  const { showToast } = useAuth();
  const nav = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifs(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async () => {
    try {
      await api.put('/api/notifications/read');
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.delete('/api/notifications/clear');
      setNotifs([]);
      showToast('Notifications cleared');
    } catch (err) {
      showToast(err.displayMessage || 'Failed', 'error');
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Notifications {unread > 0 && <span style={{ fontSize: 14, background: '#ef4444', color: '#fff', borderRadius: 20, padding: '2px 8px', marginLeft: 6 }}>{unread}</span>}
          </h1>
        </div>
        {notifs.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            {unread > 0 && (
              <button onClick={markRead} style={{ background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
            <button onClick={clearAll} style={{ background: '#7f1d1d22', border: '1px solid #ef444444', color: '#ef4444', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? <div className="spinner" /> : notifs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No notifications</div>
            <div className="empty-desc">Activity notifications will appear here</div>
          </div>
        ) : notifs.map(n => (
          <div key={n._id} style={{
            background: n.read ? '#1e1350' : '#2d1760',
            borderRadius: 14,
            border: `1px solid ${n.read ? '#2d1f6e' : '#7c3aed44'}`,
            padding: '14px 16px', marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[n.type] || 'ℹ️'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e2d9f3', lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 4 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
