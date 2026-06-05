import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

async function googleSignIn() {
  try {
    const { GoogleAuth } = await import('@capacitor-community/google-auth');
    await GoogleAuth.initialize();
    const result = await GoogleAuth.signIn();
    return result?.authentication?.idToken || null;
  } catch {
    return null;
  }
}

export default function Register() {
  const { setUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const idToken = await googleSignIn();
      if (!idToken) { showToast('Google Sign-In cancelled', 'error'); return; }
      const { data } = await api.post('/api/users/google-auth', { credential: idToken });
      setUser(data.user);
      nav(data.user?.city ? '/dashboard' : '/complete-profile');
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Google Sign-In failed', 'error');
    } finally {
      setGLoading(false);
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
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
          margin: '0 auto 20px', boxShadow: '0 8px 32px #7c3aed55', overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="UptimeForge" style={{ width: 58, height: 58, objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create account</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>Start monitoring for free</p>
      </div>

      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        {/* Google Sign-Up */}
        <button onClick={handleGoogle} disabled={gLoading} style={{
          width: '100%', height: 52, borderRadius: 12,
          background: '#fff', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 15, fontWeight: 600, color: '#1f2937', cursor: 'pointer',
          marginBottom: 16, opacity: gLoading ? 0.7 : 1,
        }}>
          {gLoading ? (
            <span style={{ color: '#6b7280' }}>Connecting...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.1l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.8-3.6-11.3-8.5L6 32.9C9.4 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40.9 36.1 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z"/>
              </svg>
              Sign up with Google
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#2d1f6e' }} />
          <span style={{ color: '#4a4070', fontSize: 12, fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#2d1f6e' }} />
        </div>

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
