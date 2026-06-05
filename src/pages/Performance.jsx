import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import api from '../api/axios';

const RANGES = [
  { value: '1h',  label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d',  label: '7D' },
];

export default function Performance() {
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState('24h');
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    api.get('/api/servers').then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setSites(list);
      if (list.length > 0) setSelectedId(list[0]._id);
      setLoadingSites(false);
    }).catch(() => setLoadingSites(false));
  }, []);

  const loadHistory = useCallback(async () => {
    if (!selectedId) return;
    setLoadingHistory(true);
    try {
      const { data } = await api.get(`/api/servers/${selectedId}/history?range=${range}`);
      setHistory(data.history || []);
    } catch { setHistory([]); }
    finally { setLoadingHistory(false); }
  }, [selectedId, range]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const selected = sites.find(s => s._id === selectedId);

  const chartData = history.map((h, i) => ({
    i,
    rt: h.responseTime || 0,
    status: h.status,
    time: h.time ? new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
  }));

  const upCount = history.filter(h => h.status === 'up').length;
  const downCount = history.filter(h => h.status === 'down').length;
  const uptime = history.length ? Math.round((upCount / history.length) * 1000) / 10 : null;
  const avgRt = chartData.filter(d => d.rt > 0).length
    ? Math.round(chartData.filter(d => d.rt > 0).reduce((a, d) => a + d.rt, 0) / chartData.filter(d => d.rt > 0).length)
    : 0;
  const maxRt = chartData.length ? Math.max(...chartData.map(d => d.rt)) : 0;

  const SLOTS = 40;
  const barHistory = history.length >= SLOTS ? history.slice(-SLOTS) : [
    ...Array(SLOTS - history.length).fill({ status: 'empty' }),
    ...history,
  ];

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Performance</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Response time & uptime charts</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Site selector */}
        {loadingSites ? <div className="spinner" /> : sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No sites yet</div>
            <div className="empty-desc">Add a site to see performance charts</div>
          </div>
        ) : (
          <>
            <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ marginBottom: 12 }}>
              {sites.map(s => (
                <option key={s._id} value={s._id}>{s.name || s.url}</option>
              ))}
            </select>

            {/* Range selector */}
            <div style={{ display: 'flex', background: '#1e1350', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
              {RANGES.map(r => (
                <button key={r.value} onClick={() => setRange(r.value)} style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: range === r.value ? '#7c3aed' : 'transparent',
                  color: range === r.value ? '#fff' : '#8b7fb8',
                }}>{r.label}</button>
              ))}
            </div>

            {/* Stats */}
            {selected && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Uptime', value: uptime !== null ? `${uptime}%` : '—', color: uptime === null ? '#6b7280' : uptime >= 99 ? '#10b981' : uptime >= 95 ? '#f59e0b' : '#ef4444' },
                  { label: 'Avg Response', value: avgRt ? `${avgRt}ms` : '—', color: avgRt < 500 ? '#10b981' : avgRt < 1200 ? '#f59e0b' : '#ef4444' },
                  { label: 'Max Response', value: maxRt ? `${maxRt}ms` : '—', color: '#8b7fb8' },
                  { label: 'Incidents', value: downCount, color: downCount > 0 ? '#ef4444' : '#10b981' },
                ].map(stat => (
                  <div key={stat.label} style={{ flex: 1, background: '#1e1350', borderRadius: 12, padding: '12px 8px', border: '1px solid #2d1f6e', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#8b7fb8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {loadingHistory ? <div className="spinner" /> : history.length === 0 ? (
              <div style={{ background: '#1e1350', borderRadius: 14, padding: '32px 16px', border: '1px solid #2d1f6e', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 14, color: '#8b7fb8' }}>No data for this range yet</div>
              </div>
            ) : (
              <>
                {/* Response time area chart */}
                <div style={{ background: '#1e1350', borderRadius: 14, padding: '16px', border: '1px solid #2d1f6e', marginBottom: 14 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>Response Time</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide tick={false} />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#1a1040', border: '1px solid #2d1f6e', borderRadius: 8, fontSize: 11 }}
                        formatter={v => [`${v}ms`, 'Response']}
                        labelFormatter={l => l}
                      />
                      <Area type="monotone" dataKey="rt" stroke="#7c3aed" strokeWidth={2} fill="url(#rtGrad)" dot={false} activeDot={{ r: 4, fill: '#7c3aed' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Uptime bar */}
                <div style={{ background: '#1e1350', borderRadius: 14, padding: '16px', border: '1px solid #2d1f6e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div className="section-title" style={{ margin: 0 }}>Uptime History</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: uptime === null ? '#6b7280' : uptime >= 99 ? '#10b981' : uptime >= 90 ? '#f59e0b' : '#ef4444' }}>
                      {uptime !== null ? `${uptime}%` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {barHistory.map((h, i) => (
                      <div key={i} style={{
                        flex: 1, height: 28, borderRadius: 3,
                        background: h.status === 'up' ? '#10b981' : h.status === 'down' ? '#ef4444' : '#2d1f6e',
                        opacity: h.status === 'empty' ? 0.25 : 0.85,
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#4a4070' }}>
                    <span>{upCount} up</span>
                    <span>{downCount} down</span>
                    <span>{history.length} checks</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
