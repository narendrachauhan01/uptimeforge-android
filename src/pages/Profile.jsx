import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid #2d1f6e' }}>
      <span style={{ fontSize: 13, color: '#8b7fb8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#e2d9f3' }}>{value || '—'}</span>
    </div>
  );
}

function MenuLink({ icon, label, badge, onClick, color, danger }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px',
      background: 'none', border: 'none', borderBottom: '1px solid #2d1f6e', cursor: 'pointer', textAlign: 'left',
    }}>
      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? '#ef4444' : color || '#e2d9f3' }}>{label}</span>
      {badge && <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{badge}</span>}
      <span style={{ color: '#4a4070', fontSize: 16 }}>›</span>
    </button>
  );
}

export default function Profile() {
  const { user, setUser, showToast } = useAuth();
  const nav = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const planInfo = {
    free_trial: { label: 'Free Trial', color: '#c084fc', bg: '#3b0764' },
    bronze:     { label: 'Bronze',     color: '#fbbf24', bg: '#451a03' },
    silver:     { label: 'Silver',     color: '#94a3b8', bg: '#1e293b' },
    gold:       { label: 'Gold',       color: '#fbbf24', bg: '#422006' },
  };
  const plan = planInfo[user?.plan] || planInfo.free_trial;

  const logout = async () => {
    setLoggingOut(true);
    try { await api.post('/api/users/logout'); } catch {}
    setUser(null);
    nav('/login');
  };

  const daysLeft = user?.trialDaysLeft;
  const planEnd  = user?.planEndsAt ? new Date(user.planEndsAt).toLocaleDateString('en-IN') : null;
  const trialEnd = user?.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('en-IN') : null;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '52px 20px 24px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 14px', fontWeight: 800, color: '#fff',
        }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>{user?.email}</p>
        <div style={{ marginTop: 10 }}>
          <span style={{ background: plan.bg, color: plan.color, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            {plan.label} Plan
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Account Info */}
        <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d1f6e' }}>
            <div className="section-title" style={{ margin: 0 }}>Account Details</div>
          </div>
          <InfoRow label="Account ID" value={user?.accountId} />
          <InfoRow label="Phone" value={user?.phone} />
          <InfoRow label="City" value={user?.city} />
          <InfoRow label="Country" value={user?.country} />
          <InfoRow label="Gender" value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} />
          <InfoRow label="Purpose" value={user?.purpose ? user.purpose.charAt(0).toUpperCase() + user.purpose.slice(1) : null} />
        </div>

        {/* Plan Info */}
        <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d1f6e' }}>
            <div className="section-title" style={{ margin: 0 }}>Plan Details</div>
          </div>
          <InfoRow label="Current Plan" value={plan.label} />
          <InfoRow label="Status" value={user?.accountStatus ? user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1) : 'Active'} />
          {user?.plan === 'free_trial'
            ? <InfoRow label="Trial Ends" value={trialEnd ? `${trialEnd}${daysLeft != null ? ` (${daysLeft}d left)` : ''}` : null} />
            : <InfoRow label="Plan Ends" value={planEnd} />}
          <InfoRow label="Site Limit" value={user?.siteLimit} />
          <InfoRow label="Billing" value={user?.billing ? user.billing.charAt(0).toUpperCase() + user.billing.slice(1) : null} />
        </div>

        {/* Monitoring Tools */}
        <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d1f6e' }}>
            <div className="section-title" style={{ margin: 0 }}>Monitoring</div>
          </div>
          <MenuLink icon="📊" label="Performance Charts" onClick={() => nav('/performance')} />
          <MenuLink icon="🔒" label="SSL & Domain Monitor" onClick={() => nav('/domain-ssl')} />
          <MenuLink icon="🏓" label="Ping Monitor" onClick={() => nav('/ping-monitor')} />
          <MenuLink icon="🔔" label="Notifications" onClick={() => nav('/notifications')} />
        </div>

        {/* Settings & Account */}
        <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d1f6e' }}>
            <div className="section-title" style={{ margin: 0 }}>Settings</div>
          </div>
          <MenuLink icon="✏️"  label="Edit Profile"      onClick={() => nav('/edit-profile')} />
          <MenuLink icon="🔑"  label="Change Password"   onClick={() => nav('/change-password')} />
          <MenuLink icon="👥"  label="Recipients"        onClick={() => nav('/recipients')} />
          <MenuLink icon="🔗"  label="Integrations"      onClick={() => nav('/integrations')} />
          <MenuLink icon="📩"  label="Support"           onClick={() => nav('/support')} />
        </div>

        {/* Billing */}
        <div style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d1f6e' }}>
            <div className="section-title" style={{ margin: 0 }}>Billing</div>
          </div>
          <MenuLink icon="⚡"  label="Upgrade Plan"      onClick={() => nav('/plans')} />
          <MenuLink icon="🧾"  label="Payment History"   onClick={() => nav('/payment-history')} />
        </div>

        {/* Logout */}
        <button className="btn btn-danger" onClick={logout} disabled={loggingOut}>
          {loggingOut ? '⏳ Logging out...' : '🚪 Logout'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#4a4070', fontSize: 12 }}>
          UptimeForge · {user?.accountId}
        </p>
      </div>
    </div>
  );
}
