import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api/axios';
import BottomNav from './components/BottomNav';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import AddSite from './pages/AddSite';
import SiteDetail from './pages/SiteDetail';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Toast from './components/Toast';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const TABS = ['/dashboard', '/sites', '/add-site', '/profile'];

function Layout({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  const showNav = user && TABS.some(t => loc.pathname.startsWith(t));
  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  );
}

function SuspendedScreen() {
  const { setUser } = useAuth();
  const { user } = useAuth();
  const nav = useNavigate();

  const logout = async () => {
    try { await api.post('/api/users/logout'); } catch {}
    setUser(null);
    nav('/login');
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0f0a1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, flexDirection: 'column', textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', overflow: 'hidden',
      }}>
        <img src="/logo.png" alt="UptimeForge" style={{ width: 52, height: 52, objectFit: 'contain' }} />
      </div>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10 }}>Account Suspended</h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 6 }}>
        Your subscription expired more than <strong style={{ color: '#f87171' }}>30 days ago</strong>.
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
        All monitoring, alerts, and dashboard access has been paused.
      </p>
      {user?.accountId && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Account ID</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#a78bfa', fontFamily: 'monospace', letterSpacing: 2 }}>{user.accountId}</div>
        </div>
      )}
      <button onClick={() => nav('/plans')} className="btn btn-primary" style={{ width: '80%', marginBottom: 12 }}>
        Upgrade Plan
      </button>
      <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
        Logout
      </button>
    </div>
  );
}

function Guard({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="spinner" style={{ marginTop: '45vh' }} />;
  if (!user) return <Navigate to="/login" replace />;

  const accountStatus = user.accountStatus || 'active';
  if (accountStatus === 'suspended') return <SuspendedScreen />;

  // Only require profile when plan is active — expired users can't save anyway (backend blocks it)
  if (accountStatus === 'active') {
    const needsProfile = !user.city || !user.gender || !user.phone;
    if (needsProfile && loc.pathname !== '/complete-profile') return <Navigate to="/complete-profile" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // Auto-refresh user every 5 min
  useEffect(() => {
    if (!user) return;
    const id = setInterval(fetchUser, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [user, fetchUser]);

  // Android hardware back button
  useEffect(() => {
    const handler = e => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    };
    document.addEventListener('backbutton', handler);
    return () => document.removeEventListener('backbutton', handler);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, fetchUser, showToast }}>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <BrowserRouter>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <Layout>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/complete-profile" element={<Guard><CompleteProfile /></Guard>} />
            <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
            <Route path="/sites" element={<Guard><Sites /></Guard>} />
            <Route path="/add-site" element={<Guard><AddSite /></Guard>} />
            <Route path="/sites/:id" element={<Guard><SiteDetail /></Guard>} />
            <Route path="/profile" element={<Guard><Profile /></Guard>} />
            <Route path="/plans" element={<Guard><Plans /></Guard>} />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
