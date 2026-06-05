import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../App';

const STATUS_COLOR = { open: '#f59e0b', in_progress: '#a78bfa', resolved: '#10b981', closed: '#6b7280' };

function TicketCard({ ticket }) {
  const color = STATUS_COLOR[ticket.status] || '#6b7280';
  const time = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const lastMsg = ticket.replies?.[ticket.replies.length - 1];

  return (
    <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700, flex: 1, marginRight: 10 }}>{ticket.subject}</div>
        <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {(ticket.status || '').replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{time} · {(ticket.priority || 'medium').toUpperCase()}</div>
      {lastMsg && (
        <div style={{ fontSize: 12, color: lastMsg.from === 'admin' ? '#a78bfa' : '#6b5fa8', marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lastMsg.from === 'admin' ? '↩ Admin: ' : ''}{lastMsg.message}
        </div>
      )}
      {ticket.userUnread && (
        <div style={{ marginTop: 6, display: 'inline-block', background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>NEW REPLY</div>
      )}
    </div>
  );
}

export default function Support() {
  const { user, showToast } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/support/my-tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const send = async e => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return showToast('Fill all fields', 'error');
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('name',     user?.name  || '');
      fd.append('email',    user?.email || '');
      fd.append('subject',  form.subject);
      fd.append('message',  form.message);
      fd.append('priority', form.priority);
      await api.post('/api/users/support', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Ticket submitted! We\'ll reply soon.');
      setForm({ subject: '', message: '', priority: 'medium' });
      setTab('tickets');
      loadTickets();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Failed to send', 'error');
    } finally { setSending(false); }
  };

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Support</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Get help from our team</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', background: '#1e1350', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
          {[{ key: 'new', label: 'New Ticket' }, { key: 'tickets', label: `My Tickets (${tickets.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t.key ? '#7c3aed' : 'transparent',
              color: tab === t.key ? '#fff' : '#8b7fb8',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'new' ? (
          <form onSubmit={send}>
            <div className="input-group">
              <label className="input-label">Subject *</label>
              <input className="input" placeholder="Briefly describe your issue"
                value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Message *</label>
              <textarea className="input" rows={5} placeholder="Describe your issue in detail..."
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ resize: 'none', minHeight: 120 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={sending} style={{ height: 52, fontSize: 16 }}>
              {sending ? 'Sending...' : 'Submit Ticket'}
            </button>
          </form>
        ) : (
          loading ? <div className="spinner" /> : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📩</div>
              <div className="empty-title">No tickets yet</div>
              <div className="empty-desc">Create a ticket and we'll get back to you</div>
            </div>
          ) : tickets.map((t, i) => <TicketCard key={t._id || i} ticket={t} />)
        )}
      </div>
    </div>
  );
}
