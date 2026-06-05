import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function Login() {
  const { setUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return showToast('Fill all fields', 'error');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/login', form);
      setUser(data.user);
      nav('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 20px',
          boxShadow: '0 8px 32px #7c3aed55',
        }}>📡</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>Sign in to UptimeForge</p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        <form onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} autoComplete="current-password" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ marginTop: 8, height: 52, fontSize: 16 }}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, color: '#8b7fb8', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
