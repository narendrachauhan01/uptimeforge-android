import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'UAE', 'Singapore'];

export default function CompleteProfile() {
  const { user, fetchUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    phone: user?.phone || '',
    city: user?.city || '',
    gender: user?.gender || '',
    country: user?.country || 'India',
    state: user?.state || '',
    pincode: user?.pincode || '',
    purpose: user?.purpose || '',
  });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const digits = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) return showToast('Phone number is required', 'error');
    if (digits.length < 10) return showToast('Phone must be 10 digits', 'error');
    if (!form.city.trim()) return showToast('City is required', 'error');
    if (!form.gender) return showToast('Gender is required', 'error');
    if (!form.pincode.trim()) return showToast('PIN Code is required', 'error');
    if (!form.purpose) return showToast('Purpose is required', 'error');

    setLoading(true);
    try {
      await api.put('/api/users/profile', {
        phone: form.phone.trim(),
        city: form.city.trim(),
        gender: form.gender,
        country: form.country,
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        purpose: form.purpose,
      });
      await fetchUser();
      showToast('Profile saved!');
      nav('/dashboard');
    } catch (err) {
      const msg = err.displayMessage || err.response?.data?.error || 'Failed to save';
      if (err.response?.data?.planExpired || msg.toLowerCase().includes('upgrade') || msg.toLowerCase().includes('expired')) {
        showToast('Plan expired. Please upgrade to save profile.', 'error');
        nav('/plans');
        return;
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const canGoBack = !!(user && user.city && user.gender && user.phone);

  return (
    <div className="page-no-nav" style={{ minHeight: '100%', padding: '40px 24px 40px', display: 'flex', flexDirection: 'column' }}>
      {canGoBack && (
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0, alignSelf: 'flex-start' }}>← Back</button>
      )}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{canGoBack ? 'Edit Profile' : 'Complete your profile'}</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>{canGoBack ? 'Update your profile settings below' : 'Just a few more details to get started'}</p>
      </div>

      <form onSubmit={submit}>
        <div className="input-group">
          <label className="input-label">Mobile Number * (10 digits)</label>
          <input className="input" type="tel" placeholder="9876543210"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            inputMode="numeric" maxLength={10} />
        </div>
        <div className="input-group">
          <label className="input-label">City *</label>
          <input className="input" placeholder="Mumbai"
            value={form.city} onChange={set('city')} />
        </div>
        <div className="input-group">
          <label className="input-label">Gender *</label>
          <select className="input" value={form.gender} onChange={set('gender')}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Country</label>
          <select className="input" value={form.country} onChange={set('country')}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">State / Province</label>
          <input className="input" placeholder="Maharashtra"
            value={form.state} onChange={set('state')} />
        </div>
        <div className="input-group">
          <label className="input-label">PIN Code *</label>
          <input className="input" type="text" inputMode="numeric" placeholder="400001"
            value={form.pincode} onChange={set('pincode')} maxLength={10} />
        </div>
        <div className="input-group">
          <label className="input-label">Account Purpose *</label>
          <select className="input" value={form.purpose} onChange={set('purpose')}>
            <option value="">Select purpose</option>
            <option value="learning">Learning</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ marginTop: 8, height: 52, fontSize: 16 }}>
          {loading ? '⏳ Saving...' : 'Save & Continue →'}
        </button>
      </form>
    </div>
  );
}
