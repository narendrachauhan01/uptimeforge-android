import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../App';

const STATUS_COLOR = { open: '#f59e0b', in_progress: '#a78bfa', resolved: '#10b981', closed: '#6b7280' };

const API_BASE = 'https://uptimeapi.narendrasingh.site';

function Bubble({ reply }) {
  const isUser  = reply.from === 'user';
  const time    = reply.createdAt ? new Date(reply.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, marginBottom: 14 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isUser ? '#7c3aed' : '#374151',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color: '#fff',
      }}>
        {isUser ? 'U' : 'A'}
      </div>
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: isUser ? '#3b1f8c' : '#1e1350',
          border: `1px solid ${isUser ? '#7c3aed44' : '#2d1f6e'}`,
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
        }}>
          <p style={{ fontSize: 13, color: '#e2d9f3', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {reply.message}
          </p>
          {reply.images?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {reply.images.map((img, i) => (
                <img key={i} src={`${API_BASE}${img}`} alt="attachment"
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #2d1f6e', cursor: 'pointer' }}
                  onClick={() => window.open(`${API_BASE}${img}`, '_blank')} />
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: '#4a4070', marginTop: 3, textAlign: isUser ? 'right' : 'left', padding: '0 4px' }}>{time}</div>
      </div>
    </div>
  );
}

function TicketDetail({ ticket, onBack, onReplied }) {
  const { showToast } = useAuth();
  const [msg, setMsg]       = useState('');
  const [sending, setSending] = useState(false);
  const [replies, setReplies] = useState(ticket.replies || []);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    // mark as read
    if (ticket.userUnread) {
      api.post(`/api/users/support/${ticket._id}/mark-read`).catch(() => {});
    }
  }, [ticket]);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('message', msg.trim());
      const { data } = await api.post(`/api/users/support/${ticket._id}/reply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReplies(data.replies || []);
      setMsg('');
      onReplied(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send reply', 'error');
    } finally { setSending(false); }
  };

  const color = STATUS_COLOR[ticket.status] || '#6b7280';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 14px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>
          ← Back to tickets
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, marginRight: 10 }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{ticket.subject}</h1>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
              #{ticket._id?.slice(-6)} · {(ticket.priority || 'medium').toUpperCase()}
            </div>
          </div>
          <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {(ticket.status || '').replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0 }}>
        {replies.length === 0 && (
          <p style={{ color: '#4a4070', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No messages yet</p>
        )}
        {replies.map((r, i) => <Bubble key={i} reply={r} />)}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {ticket.status !== 'closed' && (
        <div style={{ flexShrink: 0, padding: '10px 16px 20px', borderTop: '1px solid #2d1f6e', background: '#120d30' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              style={{
                flex: 1, background: '#1e1350', border: '1px solid #2d1f6e', borderRadius: 12,
                color: '#e2d9f3', padding: '10px 12px', fontSize: 13, resize: 'none',
                fontFamily: 'inherit', outline: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button onClick={send} disabled={sending || !msg.trim()} style={{
              background: '#7c3aed', border: 'none', borderRadius: 12,
              color: '#fff', width: 44, cursor: 'pointer', fontSize: 18, flexShrink: 0,
              opacity: !msg.trim() ? 0.5 : 1,
            }}>
              {sending ? '⏳' : '↑'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#4a4070', marginTop: 4, paddingLeft: 2 }}>Enter to send · Shift+Enter for new line</p>
        </div>
      )}
      {ticket.status === 'closed' && (
        <div style={{ padding: '12px 16px', background: '#0f0a1e', borderTop: '1px solid #2d1f6e', textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          This ticket is closed. Open a new ticket if you need more help.
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onClick }) {
  const color   = STATUS_COLOR[ticket.status] || '#6b7280';
  const time    = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const lastMsg = ticket.replies?.[ticket.replies.length - 1];
  const replyCount = ticket.replies?.length || 0;

  return (
    <button onClick={onClick} style={{
      width: '100%', background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e',
      padding: '14px 16px', marginBottom: 10, textAlign: 'left', cursor: 'pointer',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700, flex: 1, marginRight: 10, color: '#e2d9f3' }}>{ticket.subject}</div>
        <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {(ticket.status || '').replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{time} · {(ticket.priority || 'medium').toUpperCase()} · {replyCount} message{replyCount !== 1 ? 's' : ''}</div>
      {lastMsg && (
        <div style={{ fontSize: 12, color: lastMsg.from === 'admin' ? '#a78bfa' : '#6b5fa8', marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lastMsg.from === 'admin' ? '↩ Admin: ' : 'You: '}{lastMsg.message}
        </div>
      )}
      {ticket.userUnread && (
        <div style={{ marginTop: 6, display: 'inline-block', background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
          NEW REPLY
        </div>
      )}
    </button>
  );
}

export default function Support() {
  const { user, showToast } = useAuth();
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('new');
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState({ subject: '', message: '', priority: 'medium' });
  const [sending, setSending]       = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/support/my-tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const openTicket = ticket => {
    setSelected(ticket);
  };

  const handleReplied = updatedTicket => {
    setSelected(updatedTicket);
    setTickets(ts => ts.map(t => t._id === updatedTicket._id ? updatedTicket : t));
  };

  if (selected) {
    return (
      <TicketDetail
        ticket={selected}
        onBack={() => { setSelected(null); setTab('tickets'); loadTickets(); }}
        onReplied={handleReplied}
      />
    );
  }

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

  const unreadCount = tickets.filter(t => t.userUnread).length;

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Support</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Get help from our team</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', background: '#1e1350', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
          {[
            { key: 'new',     label: 'New Ticket' },
            { key: 'tickets', label: `My Tickets (${tickets.length})${unreadCount > 0 ? ` · ${unreadCount} new` : ''}` },
          ].map(t => (
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
          ) : tickets.map(t => (
            <TicketCard key={t._id} ticket={t} onClick={() => openTicket(t)} />
          ))
        )}
      </div>
    </div>
  );
}
