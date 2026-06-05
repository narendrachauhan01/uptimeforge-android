import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'UAE', 'Singapore', 'Other'];

export default function CompleteProfile() {
  const { fetchUser, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ phone: '', city: '', gender: '', country: 'India', state: '', purpose: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.city || !form.gender || !form.phone || !form.purpose)
      return showToast('Fill all required fields', 'error');
    setLoading(true);
    try {
      await api.put('/api/users/profile', form);
      await fetchUser();
      showToast('Profile saved!');
      nav('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-no-nav" style={{ minHeight: '100%', padding: '50px 24px 40px' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Complete your profile</h1>
        <p style={{ color: '#8b7fb8', fontSize: 14 }}>Just a few more details</p>
      </div>

      <form onSubmit={submit}>
        <div className="input-group">
          <label className="input-label">Mobile Number *</label>
          <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="input-group">
          <label className="input-label">City *</label>
          <input className="input" placeholder="Mumbai" value={form.city} onChange={set('city')} />
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
          <input className="input" placeholder="Maharashtra" value={form.state} onChange={set('state')} />
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
          {loading ? '⏳ Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
}
