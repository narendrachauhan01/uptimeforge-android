import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function Register() {
  const { setUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone)
      return showToast('Fill all fields', 'error');
    if (form.password.length < 6) return showToast('Password min 6 characters', 'error');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/register', form);
      setUser(data.user);
      nav('/complete-profile');
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || err.response?.data?.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '50px 24px 24px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: '0 8px 32px #7c3aed55',
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="UptimeForge" style={{ width: 58, height: 58, objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create account</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>Start monitoring for free</p>
      </div>

      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        <form onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input" placeholder="Narendra Singh" value={form.name} onChange={set('name')} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ marginTop: 8, height: 52, fontSize: 16 }}>
            {loading ? '⏳ Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#8b7fb8', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
