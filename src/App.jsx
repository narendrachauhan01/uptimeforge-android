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

function Guard({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="spinner" style={{ marginTop: '45vh' }} />;
  if (!user) return <Navigate to="/login" replace />;
  const needsProfile = !user.city || !user.gender || !user.phone;
  if (needsProfile && loc.pathname !== '/complete-profile') return <Navigate to="/complete-profile" replace />;
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
