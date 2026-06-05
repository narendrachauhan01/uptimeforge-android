import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function ChangePassword() {
  const { user, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ cur: false, new: false, con: false });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) return showToast('All fields required', 'error');
    if (form.newPassword.length < 6) return showToast('New password min 6 characters', 'error');
    if (form.newPassword !== form.confirm) return showToast('Passwords do not match', 'error');
    if (user?.isGoogleUser) return showToast('Google accounts cannot change password here', 'error');
    setLoading(true);
    try {
      await api.put('/api/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast('Password changed successfully!');
      nav(-1);
    } catch (err) {
      showToast(err.displayMessage || 'Failed to change password', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '52px 20px 20px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 12, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Change Password</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Update your account password</p>
      </div>

      <div style={{ padding: '20px 24px 40px' }}>
        {user?.isGoogleUser ? (
          <div style={{ background: '#1e1350', borderRadius: 14, padding: 20, border: '1px solid #2d1f6e', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Google Account</div>
            <div style={{ fontSize: 13, color: '#8b7fb8' }}>Your account uses Google Sign-In. Password management is handled by Google.</div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show.cur ? 'text' : 'password'} placeholder="Current password"
                  value={form.currentPassword} onChange={set('currentPassword')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(s => ({ ...s, cur: !s.cur }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8b7fb8', cursor: 'pointer', fontSize: 16 }}>
                  {show.cur ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show.new ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.newPassword} onChange={set('newPassword')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8b7fb8', cursor: 'pointer', fontSize: 16 }}>
                  {show.new ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show.con ? 'text' : 'password'} placeholder="Repeat new password"
                  value={form.confirm} onChange={set('confirm')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(s => ({ ...s, con: !s.con }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8b7fb8', cursor: 'pointer', fontSize: 16 }}>
                  {show.con ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {form.newPassword && form.confirm && form.newPassword !== form.confirm && (
              <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12, marginTop: -8 }}>Passwords do not match</div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 52, fontSize: 16, marginTop: 8 }}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
