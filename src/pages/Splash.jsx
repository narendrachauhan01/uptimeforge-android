import { useEffect, useState } from 'react';

export default function Splash({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade-out after 2 seconds
    const t1 = setTimeout(() => setFade(true), 2000);
    // Call onDone after fade completes
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0f0a1e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.6s ease',
      opacity: fade ? 0 : 1,
    }}>
      {/* Glow bg */}
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #7c3aed33 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
      }} />

      {/* Logo */}
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52,
        boxShadow: '0 12px 48px #7c3aed66',
        marginBottom: 28,
        animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        📡
      </div>

      {/* App name */}
      <h1 style={{
        fontSize: 34, fontWeight: 900, color: '#fff',
        letterSpacing: '-0.5px', marginBottom: 8,
        animation: 'fadeUp 0.5s 0.2s ease both',
      }}>
        UptimeForge
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: 14, color: '#a78bfa', marginBottom: 48,
        animation: 'fadeUp 0.5s 0.35s ease both',
      }}>
        Monitor. Alert. Relax.
      </p>

      {/* Loading dots */}
      <div style={{
        display: 'flex', gap: 8,
        animation: 'fadeUp 0.5s 0.5s ease both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#7c3aed',
            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>

      {/* Version */}
      <p style={{
        position: 'absolute', bottom: 40,
        fontSize: 12, color: '#4a4070',
        animation: 'fadeUp 0.5s 0.6s ease both',
      }}>
        v1.0.0
      </p>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
