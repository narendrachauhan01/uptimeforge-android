import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function Login() {
  const { setUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGoogleCredential = async (response) => {
    setGLoading(true);
    try {
      const { data } = await api.post('/api/users/google-auth', { credential: response.credential });
      setUser(data.user);
      nav('/dashboard');
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Google Sign-In failed', 'error');
    } finally {
      setGLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = async () => {
      try {
        const { data } = await api.get('/api/users/config');
        const clientId = data.googleClientId;
        if (!clientId || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          ux_mode: 'popup',
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: Math.min(window.innerWidth - 48, 360),
          });
        }
      } catch {}
    };

    // Wait for GSI script to load
    if (window.google) {
      initGoogle();
    } else {
      const t = setInterval(() => {
        if (window.google) { clearInterval(t); initGoogle(); }
      }, 300);
      return () => clearInterval(t);
    }
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return showToast('Fill all fields', 'error');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/login', form);
      setUser(data.user);
      nav('/dashboard');
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px #7c3aed55',
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="UptimeForge"
            style={{ width: 58, height: 58, objectFit: 'contain' }} />
        </div>
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

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#2d1f6e' }} />
          <span style={{ color: '#4a4070', fontSize: 12, fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#2d1f6e' }} />
        </div>

        {/* Google Sign-In button */}
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: 44, alignItems: 'center' }}>
          {gLoading ? (
            <div style={{ color: '#8b7fb8', fontSize: 14 }}>⏳ Signing in with Google...</div>
          ) : (
            <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
          )}
        </div>

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
