import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLOR = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444', refunded: '#6b7280' };
const PLAN_LABEL   = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', verification: 'Verification', free_trial: 'Free Trial' };

export default function PaymentHistory() {
  const nav = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payment/my-requests').then(({ data }) => {
      setPayments(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-no-nav" style={{ minHeight: '100%' }}>
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Payment History</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Your subscription payments</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? <div className="spinner" /> : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <div className="empty-title">No payments yet</div>
            <div className="empty-desc">Your payment history will appear here after subscribing</div>
            <button className="btn btn-primary" style={{ marginTop: 20, width: 'auto', padding: '10px 24px' }} onClick={() => nav('/plans')}>
              View Plans
            </button>
          </div>
        ) : payments.map(p => {
          const color = STATUS_COLOR[p.status] || '#6b7280';
          const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
          const planEnd = p.planEndsAt ? new Date(p.planEndsAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
          return (
            <div key={p._id} style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e2d9f3' }}>
                    {PLAN_LABEL[p.plan] || p.plan || 'Verification'} Plan
                    {p.billing === 'annually' && <span style={{ marginLeft: 6, fontSize: 11, background: '#064e3b', color: '#10b981', borderRadius: 8, padding: '2px 6px' }}>ANNUAL</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>₹{p.amount}</div>
                  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                    {(p.status || '').toUpperCase()}
                  </span>
                </div>
              </div>
              {p.razorpay_payment_id && (
                <div style={{ fontSize: 11, color: '#4a4070', fontFamily: 'monospace', marginBottom: 4 }}>
                  ID: {p.razorpay_payment_id}
                </div>
              )}
              {planEnd && (
                <div style={{ fontSize: 12, color: '#8b7fb8' }}>Valid until: {planEnd}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
