import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/users/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      setSent(true); // show same message even on error (security)
    } finally { setLoading(false); }
  };

  return (
    <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: '0 8px 32px #7c3aed55', overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="UptimeForge" style={{ width: 52, height: 52, objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Forgot Password?</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>Enter your email to get a reset link</p>
      </div>

      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: '#8b7fb8', lineHeight: 1.7, marginBottom: 28 }}>
              If an account exists for <strong style={{ color: '#e2d9f3' }}>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p style={{ fontSize: 13, color: '#4a4070', marginBottom: 28 }}>
              Click the link in your email to reset your password on the website, then come back and log in.
            </p>
            <button onClick={() => nav('/login')} className="btn btn-primary" style={{ height: 52, fontSize: 16 }}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading || !email.trim()}
              style={{ height: 52, fontSize: 16, marginTop: 8 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" style={{ color: '#a78bfa', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
