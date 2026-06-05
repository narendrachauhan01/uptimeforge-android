import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const PLANS = [
  {
    id: 'bronze', name: 'Bronze', price: 499, sites: 5,
    color: '#fbbf24', bg: '#451a03', border: '#78350f',
    features: ['5 Sites', '1-min checks', 'Email alerts', 'WhatsApp alerts'],
  },
  {
    id: 'silver', name: 'Silver', price: 999, sites: 15,
    color: '#94a3b8', bg: '#1e293b', border: '#334155',
    features: ['15 Sites', '30-sec checks', 'Email + WhatsApp', 'Webhook alerts', 'Priority support'],
    popular: true,
  },
  {
    id: 'gold', name: 'Gold', price: 1499, sites: 30,
    color: '#fbbf24', bg: '#422006', border: '#92400e',
    features: ['30 Sites', '30-sec checks', 'All alert types', 'Custom webhook', 'Priority support', 'API access'],
  },
];

export default function Plans() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 15, marginBottom: 12, padding: 0 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Choose a Plan</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>All plans include 24/7 monitoring</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Current plan banner */}
        {user?.plan !== 'free_trial' && (
          <div style={{ background: '#1e1350', borderRadius: 12, padding: '12px 16px', border: '1px solid #2d1f6e', marginBottom: 16, fontSize: 14, color: '#a78bfa' }}>
            Current: <strong style={{ color: '#fff' }}>{user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)}</strong> plan
          </div>
        )}

        {PLANS.map(plan => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div key={plan.id} style={{
              background: plan.bg, borderRadius: 16, padding: '20px',
              border: `2px solid ${plan.popular ? '#7c3aed' : plan.border}`,
              marginBottom: 14, position: 'relative',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#7c3aed', color: '#fff', padding: '3px 14px',
                  borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>MOST POPULAR</div>
              )}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#064e3b', color: '#10b981', padding: '3px 10px',
                  borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>CURRENT</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Up to {plan.sites} sites</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>₹{plan.price}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>/month</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 14, color: '#d1d5db' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn"
                disabled={isCurrent}
                style={{
                  background: isCurrent ? '#1f2937' : '#7c3aed',
                  color: isCurrent ? '#6b7280' : '#fff',
                  cursor: isCurrent ? 'default' : 'pointer',
                }}
                onClick={() => !isCurrent && nav(`/payment?plan=${plan.id}`)}
              >
                {isCurrent ? 'Current Plan' : `Get ${plan.name} →`}
              </button>
            </div>
          );
        })}

        <p style={{ textAlign: 'center', color: '#4a4070', fontSize: 12, marginTop: 8 }}>
          Secure payment via Razorpay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
