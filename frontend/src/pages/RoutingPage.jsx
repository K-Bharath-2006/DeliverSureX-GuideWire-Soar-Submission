import { useState } from 'react';
import axios from 'axios';

// ─── Helpers ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const formatDuration = (mins) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const CROWD_OPTIONS = [
  { value: 'LOW',    label: 'Low',    emoji: '🟢', desc: 'Clear area – choose fastest route' },
  { value: 'MEDIUM', label: 'Medium', emoji: '🟡', desc: 'Some crowd – prefer balanced route' },
  { value: 'HIGH',   label: 'High',   emoji: '🔴', desc: 'Heavy crowd – avoid congested routes' },
];

const RISK_COLORS = {
  LOW:    { bg: 'rgba(16,185,129,0.15)', border: '#10b981', text: '#10b981', label: 'LOW RISK' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)',  border: '#f59e0b', text: '#f59e0b', label: 'MEDIUM RISK' },
  HIGH:   { bg: 'rgba(239,68,68,0.15)',   border: '#ef4444', text: '#ef4444', label: 'HIGH RISK 🚨' },
};

const TRAFFIC_PILL = {
  LOW:    { bg: '#10b98120', color: '#10b981', label: '🟢 Light Traffic' },
  MEDIUM: { bg: '#f59e0b20', color: '#f59e0b', label: '🟡 Moderate Traffic' },
  HIGH:   { bg: '#ef444420', color: '#ef4444', label: '🔴 Heavy Traffic' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function InputField({ id, label, placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        step="any"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#f1f5f9',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = '#6366f1')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

function RouteCard({ route, isSelected }) {
  const pill = TRAFFIC_PILL[route.trafficLevel] ?? TRAFFIC_PILL.MEDIUM;

  return (
    <div
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 14,
        padding: '16px 20px',
        position: 'relative',
        transition: 'all 0.25s',
        animation: 'fadeSlideIn 0.4s ease both',
      }}
    >
      {isSelected && (
        <span style={{
          position: 'absolute', top: -10, right: 14,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          letterSpacing: '0.06em',
        }}>
          ★ SELECTED
        </span>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Route #{route.rank}</p>
          <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
            {formatDuration(route.travelTimeMinutes)}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{route.lengthKm} km</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: pill.bg, color: pill.color,
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            display: 'inline-block', marginBottom: 6,
          }}>
            {pill.label}
          </span>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            Delay: <strong style={{ color: '#f1f5f9' }}>{formatDuration(route.trafficDelayMinutes)}</strong>
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
            Congestion: {Math.round(route.congestionRatio * 100)}%
          </p>
        </div>
      </div>

      {/* Congestion bar */}
      <div style={{ marginTop: 12, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.round(route.congestionRatio * 100)}%`,
          background: route.trafficLevel === 'HIGH' ? '#ef4444' : route.trafficLevel === 'MEDIUM' ? '#f59e0b' : '#10b981',
          borderRadius: 99,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RoutingPage() {
  const [form, setForm] = useState({
    originLat: '', originLon: '', destLat: '', destLon: '', crowdDensity: 'LOW',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/routing/smart-route`, {
        originLat: parseFloat(form.originLat),
        originLon: parseFloat(form.originLon),
        destLat: parseFloat(form.destLat),
        destLon: parseFloat(form.destLon),
        crowdDensity: form.crowdDensity,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch route.');
    } finally {
      setLoading(false);
    }
  };

  const riskStyle = result ? RISK_COLORS[result.riskLevel] ?? RISK_COLORS.LOW : null;
  const selectedCrowd = CROWD_OPTIONS.find(o => o.value === form.crowdDensity);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#0b0f1a', color: '#f1f5f9', padding: '24px 16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(239,68,68,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .crowd-btn:hover { transform: translateY(-1px); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,102,241,0.45) !important; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeSlideIn 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 99, padding: '5px 16px', marginBottom: 16,
          }}>
            <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>🗺️ Smart Routing Engine</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-Powered Route Advisor
          </h1>
          <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: 15 }}>
            Fetches multiple routes from TomTom, ranks them by traffic, then applies your crowd density logic.
          </p>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 28,
          marginBottom: 24,
          animation: 'fadeSlideIn 0.5s ease 0.1s both',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#94a3b8' }}>📍 Route Inputs</h2>

          {/* Coordinates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <InputField id="originLat" label="Origin Latitude"  placeholder="e.g. 13.0827" value={form.originLat} onChange={handleChange('originLat')} />
            <InputField id="originLon" label="Origin Longitude" placeholder="e.g. 80.2707" value={form.originLon} onChange={handleChange('originLon')} />
            <InputField id="destLat"   label="Destination Latitude"  placeholder="e.g. 13.0604" value={form.destLat}   onChange={handleChange('destLat')}   />
            <InputField id="destLon"   label="Destination Longitude" placeholder="e.g. 80.2496" value={form.destLon}   onChange={handleChange('destLon')}   />
          </div>

          {/* Crowd Density Selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Crowd Density
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {CROWD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className="crowd-btn"
                  onClick={() => setForm({ ...form, crowdDensity: opt.value })}
                  style={{
                    flex: 1, minWidth: 140,
                    padding: '12px 16px',
                    background: form.crowdDensity === opt.value
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                      : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.crowdDensity === opt.value ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12,
                    color: '#f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 20 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.originLat || !form.originLon || !form.destLat || !form.destLon}
            className="submit-btn"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Fetching routes…
              </>
            ) : '🚀 Find Smart Route'}
          </button>
        </form>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
            animation: 'fadeSlideIn 0.3s ease both',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div style={{ animation: 'fadeSlideIn 0.5s ease both' }}>

            {/* Risk Banner */}
            <div style={{
              background: riskStyle.bg,
              border: `1px solid ${riskStyle.border}`,
              borderRadius: 16,
              padding: '18px 22px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: riskStyle.border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                animation: result.riskLevel === 'HIGH' ? 'pulse-ring 1.5s infinite' : 'none',
                flexShrink: 0,
              }}>
                {result.riskLevel === 'HIGH' ? '🚨' : result.riskLevel === 'MEDIUM' ? '⚠️' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: riskStyle.text, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {riskStyle.label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 15, color: '#e2e8f0' }}>{result.message}</p>
                {result.triggerInsurance && (
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>
                    🔔 Insurance claim logic has been triggered automatically.
                  </p>
                )}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', textAlign: 'center', flexShrink: 0,
              }}>
                <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Crowd</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>
                  {selectedCrowd?.emoji} {result.crowdDensity}
                </p>
              </div>
            </div>

            {/* Selected Route */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                🏆 Recommended Route
              </h2>
              <RouteCard route={result.selectedRoute} isSelected={true} />
            </div>

            {/* All Routes */}
            {result.allRoutes?.length > 1 && (
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  📋 All Available Routes ({result.allRoutes.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.allRoutes.map((route) => (
                    <RouteCard
                      key={route.rank}
                      route={route}
                      isSelected={route.rank === result.selectedRoute.rank}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20,
            }}>
              {[
                { label: 'ETA', value: formatDuration(result.selectedRoute.travelTimeMinutes), icon: '⏱' },
                { label: 'Distance', value: `${result.selectedRoute.lengthKm} km`, icon: '📏' },
                { label: 'Traffic Delay', value: formatDuration(result.selectedRoute.trafficDelayMinutes), icon: '🚦' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '16px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22 }}>{stat.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginTop: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
