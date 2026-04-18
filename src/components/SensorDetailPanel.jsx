import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sectorService } from '../api/apiservice.jsx';
import SectorScadaIndustrial from '../components/SectorScadaIndustrial.jsx';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);
const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

// ─── WMO codes ────────────────────────────────────────────────────────────────
const WMO_CODES = {
  0: { icon: '☀️', label: 'Despejado' }, 1: { icon: '🌤️', label: 'Mayormente despejado' },
  2: { icon: '⛅', label: 'Parcialmente nublado' }, 3: { icon: '☁️', label: 'Nublado' },
  45: { icon: '🌫️', label: 'Niebla' }, 51: { icon: '🌦️', label: 'Llovizna leve' },
  61: { icon: '🌧️', label: 'Lluvia leve' }, 63: { icon: '🌧️', label: 'Lluvia moderada' },
  80: { icon: '🌦️', label: 'Chubascos' }, 95: { icon: '⛈️', label: 'Tormenta' },
};
const getWeatherInfo = c => WMO_CODES[c] ?? { icon: '🌡️', label: 'Variable' };

// ─── Hook weather ─────────────────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);
  const [wLoading, setWLoading] = useState(true);
  const [wError, setWError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=37.3024&longitude=-1.8853&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FMadrid&forecast_days=3`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!cancelled) setWeather(json);
      } catch { if (!cancelled) setWError(true); }
      finally { if (!cancelled) setWLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  return { weather, wLoading, wError };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #060d1a 0%, #0b1628 40%, #0c1833 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(52,211,153,0.15)',
          borderTop: '3px solid #34d399',
          animation: 'spin 0.9s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontFamily: "'Inter',sans-serif" }}>
          Cargando sector...
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ─── InfoPill ─────────────────────────────────────────────────────────────────
function InfoPill({ icon, label, value, iconColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.7rem 1rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
    }}>
      <span style={{ color: iconColor || '#94a3b8', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function SectorDetailPage() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const [sector, setSector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { weather, wLoading, wError } = useWeather();

  useEffect(() => { loadSectorDetail(); }, [sectorId]);

  const loadSectorDetail = async () => {
    try {
      setLoading(true); setError(null);
      const data = await sectorService.getSectorInfo();
      const found = data.find(s => s.id === parseInt(sectorId));
      if (found) setSector(found);
      else setError('Sector no encontrado');
    } catch {
      setError('No se pudo cargar el detalle del sector');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const DAY_LABELS = ['Hoy', 'Mañana', 'Pasado'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060d1a 0%, #0b1628 40%, #0c1833 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#f1f5f9',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,0.5)} 50%{box-shadow:0 0 0 6px rgba(52,211,153,0)} }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,13,26,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 2rem',
        animation: 'fadeInDown 0.4s ease both',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64, gap: 16,
        }}>
          {/* Left: back + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Volver al inicio"
            >
              <ArrowLeftIcon />
            </button>

            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #34d399, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 14px rgba(52,211,153,0.35)',
            }}>
              <ActivityIcon />
            </div>
            <div>
              <div style={{
                fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #34d399, #60a5fa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                HydraControl
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                Sistema de Monitorización IoT
              </div>
            </div>
          </div>

          {/* Right: sector badge */}
          {sector && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.3rem 1rem',
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: 20,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', animation: 'pulse2 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.04em' }}>
                {sector.nombre}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── SUBHEADER: TIEMPO REAL ─────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(11,22,40,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        padding: '0.8rem 2rem',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🌡 Cuevas del Almanzora · Predicción 3 días
            </span>
            {!wLoading && !wError && (
              <span style={{
                fontSize: '0.62rem', color: '#34d399', fontWeight: 700,
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                padding: '1px 7px', borderRadius: 8,
              }}>LIVE</span>
            )}
          </div>

          {wLoading && <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>Cargando datos meteorológicos...</p>}
          {wError && <p style={{ margin: 0, fontSize: '0.78rem', color: '#f87171' }}>⚠ No se pudo cargar el tiempo</p>}
          {!wLoading && !wError && weather && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {[0, 1, 2].map(i => {
                const { icon, label } = getWeatherInfo(weather.daily.weather_code[i]);
                const isToday = i === 0;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.5rem 1rem',
                    background: isToday ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                    border: isToday ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: isToday ? '#34d399' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        {DAY_LABELS[i]}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isToday ? (
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'JetBrains Mono',monospace" }}>
                            {Math.round(weather.current.temperature_2m)}°C
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
                            {Math.round(weather.daily.temperature_2m_max[i])}° / {Math.round(weather.daily.temperature_2m_min[i])}°
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{label}</span>
                      </div>
                    </div>
                    {isToday && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginLeft: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
                          <span style={{ color: '#60a5fa' }}><DropIcon /></span> {weather.current.relative_humidity_2m}%
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
                          <span style={{ color: '#a78bfa' }}><WindIcon /></span> {Math.round(weather.current.wind_speed_10m)} km/h
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '1.2rem 1.5rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 14, color: '#f87171',
            animation: 'fadeInUp 0.4s ease',
          }}>
            <AlertIcon />
            <div>
              <div style={{ fontWeight: 700 }}>Error</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>{error}</div>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                marginLeft: 'auto', padding: '0.4rem 1rem',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              Volver
            </button>
          </div>
        )}

        {sector && (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>

            {/* Info del sector */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{
                  width: 4, height: 24, borderRadius: 2,
                  background: 'linear-gradient(180deg, #34d399, #60a5fa)',
                }} />
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  {sector.nombre}
                </h1>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                  padding: '3px 10px', borderRadius: 8,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  S-{sector.id?.toString().padStart(2, '0')}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 10,
              }}>
                {sector.cultivo && <InfoPill icon={<LeafIcon />} label="Cultivo" value={sector.cultivo} iconColor="#34d399" />}
                {sector.parcela && <InfoPill icon={<GridIcon />} label="Parcela" value={sector.parcela} iconColor="#60a5fa" />}
                {sector.superficie != null && (
                  <InfoPill icon={<GridIcon />} label="Superficie" value={`${Number(sector.superficie).toFixed(2)} m²`} iconColor="#f59e0b" />
                )}
                {(sector.latitud || sector.longitud) && (
                  <InfoPill
                    icon={<MapPinIcon />}
                    label="Coordenadas"
                    value={`${sector.latitud?.toFixed(4) ?? '—'} N · ${sector.longitud?.toFixed(4) ?? '—'} E`}
                    iconColor="#f472b6"
                  />
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent)',
              margin: '2rem 0',
            }} />

            {/* SCADA */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.12em', color: '#60a5fa',
                  background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                  padding: '2px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace",
                }}>SCADA</span>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Panel de Control — {sector.nombre}
                </h2>
              </div>
              <div style={{
                background: 'rgba(11,22,40,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18, overflow: 'hidden', padding: '1.5rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              }}>
                <SectorScadaIndustrial sector={sector} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}