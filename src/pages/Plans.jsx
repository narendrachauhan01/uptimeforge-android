import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

export default function Plans() {
  const { user, fetchUser, showToast } = useAuth();
  const nav = useNavigate();
  const [plans, setPlans] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const [paying, setPaying] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payment/plans').then(({ data }) => {
      setPlans(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const startPayment = async (planId) => {
    if (!window.Razorpay) return showToast('Payment not available, try again', 'error');
    setPaying(planId);
    try {
      const { data } = await api.post('/api/payment/create-order', { plan: planId, billing });
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'UptimeForge',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        prefill: data.prefill || {},
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setPaying(null) },
        handler: async (response) => {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan: planId,
              billing,
            });
            await fetchUser();
            showToast('Plan activated successfully!');
            nav('/dashboard');
          } catch (err) {
            showToast(err.displayMessage || 'Payment verification failed', 'error');
          } finally {
            setPaying(null);
          }
        },
      });
      rzp.open();
    } catch (err) {
      showToast(err.displayMessage || err.response?.data?.error || 'Payment failed', 'error');
      setPaying(null);
    }
  };

  const PLAN_CONFIG = {
    bronze: { color: '#fbbf24', bg: '#451a03', border: '#78350f', features: ['5 Sites', '1-min checks', 'Email alerts', 'WhatsApp alerts'] },
    silver: { color: '#94a3b8', bg: '#1e293b', border: '#334155', features: ['15 Sites', '30-sec checks', 'Email + WhatsApp', 'Webhook alerts', 'Priority support'], popular: true },
    gold:   { color: '#fbbf24', bg: '#422006', border: '#92400e', features: ['30 Sites', '30-sec checks', 'All alert types', 'Custom webhook', 'Priority support', 'API access'] },
  };

  const annualDiscount = plans?.annualDiscount ?? 20;

  const getPrice = (planId) => {
    const cfg = plans?.plans?.[planId];
    if (!cfg) return { monthly: 0, annual: 0 };
    const monthly = cfg.price;
    const ap = plans?.annualPlans?.[planId];
    const annualMonthly = (ap?.price > 0) ? ap.price : Math.round(monthly * (1 - annualDiscount / 100));
    return { monthly, annual: annualMonthly };
  };

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 15, marginBottom: 12, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Choose a Plan</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>All plans include 24/7 monitoring</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Billing toggle */}
        <div style={{ display: 'flex', background: '#1e1350', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
          {[['monthly', 'Monthly'], ['annually', `Annual (${annualDiscount}% off)`]].map(([val, label]) => (
            <button key={val} onClick={() => setBilling(val)} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: billing === val ? '#7c3aed' : 'transparent',
              color: billing === val ? '#fff' : '#8b7fb8',
            }}>{label}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          ['bronze', 'silver', 'gold'].map(planId => {
            const cfg = PLAN_CONFIG[planId];
            const isCurrent = user?.plan === planId;
            const price = getPrice(planId);
            const displayPrice = billing === 'annually' ? price.annual : price.monthly;
            return (
              <div key={planId} style={{
                background: cfg.bg, borderRadius: 16, padding: '20px',
                border: `2px solid ${cfg.popular ? '#7c3aed' : cfg.border}`,
                marginBottom: 14, position: 'relative',
              }}>
                {cfg.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>MOST POPULAR</div>}
                {isCurrent && <div style={{ position: 'absolute', top: 12, right: 12, background: '#064e3b', color: '#10b981', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>CURRENT</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{planId.charAt(0).toUpperCase() + planId.slice(1)}</div>
                    {billing === 'annually' && <div style={{ fontSize: 11, color: '#10b981', marginTop: 3 }}>Save {annualDiscount}% vs monthly</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>₹{displayPrice}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>/month{billing === 'annually' ? ' × 12' : ''}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  {cfg.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 14, color: '#d1d5db' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button className="btn" disabled={isCurrent || paying === planId}
                  style={{ background: isCurrent ? '#1f2937' : '#7c3aed', color: isCurrent ? '#6b7280' : '#fff', cursor: isCurrent ? 'default' : 'pointer' }}
                  onClick={() => !isCurrent && startPayment(planId)}>
                  {isCurrent ? 'Current Plan' : paying === planId ? '⏳ Processing...' : `Get ${planId.charAt(0).toUpperCase() + planId.slice(1)} — ₹${billing === 'annually' ? displayPrice * 12 : displayPrice}`}
                </button>
              </div>
            );
          })
        )}

        <p style={{ textAlign: 'center', color: '#4a4070', fontSize: 12, marginTop: 8 }}>
          Secure payment via Razorpay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
