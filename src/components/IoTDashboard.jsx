import { useState, useEffect } from 'react';
import { useTheme } from '../App.js';
import EsquemaBalsasIndustrial from './EsquemaBalsasIndustrial.jsx';
import SectoresPanel from './SectoresPanel.jsx';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);
const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ThermometerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
);

// ─── WMO weather code → emoji + descripción ───────────────────────────────────
const WMO_CODES = {
  0: { icon: '☀️', label: 'Despejado' },
  1: { icon: '🌤️', label: 'Mayormente despejado' },
  2: { icon: '⛅', label: 'Parcialmente nublado' },
  3: { icon: '☁️', label: 'Nublado' },
  45: { icon: '🌫️', label: 'Niebla' },
  48: { icon: '🌫️', label: 'Niebla helada' },
  51: { icon: '🌦️', label: 'Llovizna leve' },
  53: { icon: '🌦️', label: 'Llovizna' },
  55: { icon: '🌧️', label: 'Llovizna intensa' },
  61: { icon: '🌧️', label: 'Lluvia leve' },
  63: { icon: '🌧️', label: 'Lluvia moderada' },
  65: { icon: '🌧️', label: 'Lluvia intensa' },
  80: { icon: '🌦️', label: 'Chubascos' },
  81: { icon: '⛈️', label: 'Chubascos fuertes' },
  95: { icon: '⛈️', label: 'Tormenta' },
};

function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { icon: '🌡️', label: 'Variable' };
}

// ─── Hook: tiempo real Open-Meteo (Cuevas del Almanzora, Almería) ─────────────
// Lat: 37.3024  Lon: -1.8853
const CUEVAS_LAT = 37.3024;
const CUEVAS_LON = -1.8853;

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [wLoading, setWLoading] = useState(true);
  const [wError, setWError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        setWLoading(true);
        setWError(false);
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${CUEVAS_LAT}&longitude=${CUEVAS_LON}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
          `&timezone=Europe%2FMadrid&forecast_days=3`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (!cancelled) setWeather(json);
      } catch (e) {
        if (!cancelled) setWError(true);
      } finally {
        if (!cancelled) setWLoading(false);
      }
    };
    fetchWeather();
    // Refresco cada 15 min
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { weather, wLoading, wError };
}

// ─── Componente tarjeta día ────────────────────────────────────────────────────
function WeatherDayCard({ dayLabel, code, maxT, minT, precip, isCurrent, currentTemp, humidity, wind }) {
  const { icon, label } = getWeatherInfo(code);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.65rem 1rem',
      background: isCurrent ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
      borderRadius: 12,
      border: isCurrent ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.07)',
      minWidth: 100,
      transition: 'all 0.3s',
      flex: 1,
    }}>
      <span style={{ fontSize: '0.68rem', color: isCurrent ? '#34d399' : '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {dayLabel}
      </span>
      <span style={{ fontSize: '1.6rem', margin: '3px 0' }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginBottom: 5, lineHeight: 1.3, minHeight: 28 }}>
        {label}
      </span>

      {/* Temp actual o max/min */}
      {isCurrent && currentTemp != null ? (
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>
          {Math.round(currentTemp)}°C
        </span>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fb923c' }}>{Math.round(maxT)}°</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>/</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#60a5fa' }}>{Math.round(minT)}°</span>
        </div>
      )}

      {/* Datos adicionales hoy */}
      {isCurrent && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {humidity != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
              <span style={{ color: '#60a5fa' }}><DropIcon /></span> {humidity}%
            </div>
          )}
          {wind != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
              <span style={{ color: '#a78bfa' }}><WindIcon /></span> {Math.round(wind)} km/h
            </div>
          )}
        </div>
      )}

      {/* Precipitación */}
      {precip > 0 && (
        <div style={{ marginTop: 4, fontSize: '0.68rem', color: '#60a5fa', fontWeight: 600 }}>
          💧 {precip.toFixed(1)} mm
        </div>
      )}
    </div>
  );
}

// ─── Weather bar ───────────────────────────────────────────────────────────────
function WeatherBar({ weather, wLoading, wError }) {
  const DAY_LABELS = ['Hoy', 'Mañana', 'Pasado'];

  if (wLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Cargando tiempo real...</span>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#34d399',
            animation: `wDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
        <style>{`@keyframes wDot{0%,80%,100%{opacity:.3;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    );
  }

  if (wError || !weather) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.78rem', color: '#f87171' }}>⚠ No se pudo cargar el tiempo</span>
        <span style={{ fontSize: '0.72rem', color: '#475569' }}>Verifica la conexión a internet</span>
      </div>
    );
  }

  const { current, daily } = weather;

  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
      {[0, 1, 2].map(i => (
        <WeatherDayCard
          key={i}
          dayLabel={DAY_LABELS[i]}
          code={daily.weather_code[i]}
          maxT={daily.temperature_2m_max[i]}
          minT={daily.temperature_2m_min[i]}
          precip={daily.precipitation_sum[i] ?? 0}
          isCurrent={i === 0}
          currentTemp={i === 0 ? current.temperature_2m : null}
          humidity={i === 0 ? current.relative_humidity_2m : null}
          wind={i === 0 ? current.wind_speed_10m : null}
        />
      ))}
    </div>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────────
export default function IoTDashboard() {
  const { dark, toggle } = useTheme();
  const { weather, wLoading, wError } = useWeather();
  const [tick, setTick] = useState(0);

  // Animación de "pulso" de sistema activo
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const isDark = dark;

  const wrapperStyle = {
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: isDark
      ? 'linear-gradient(135deg, #060d1a 0%, #0b1628 40%, #0c1833 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    color: isDark ? '#f1f5f9' : '#0f172a',
    transition: 'background 0.4s, color 0.4s',
  };

  const headerStyle = {
    position: 'sticky', top: 0, zIndex: 100,
    background: isDark
      ? 'rgba(6,13,26,0.85)'
      : 'rgba(248,250,252,0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
    padding: '0 2rem',
  };

  const headerInnerStyle = {
    maxWidth: 1400, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 64,
    gap: 16,
  };

  const subheaderStyle = {
    background: isDark ? 'rgba(11,22,40,0.7)' : 'rgba(241,245,249,0.9)',
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
    backdropFilter: 'blur(12px)',
    padding: '0.75rem 2rem',
  };

  const mainStyle = {
    maxWidth: 1400, margin: '0 auto',
    padding: '2rem 2rem 4rem',
  };

  return (
    <div style={wrapperStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes statusPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50%     { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>

          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeInDown 0.5s ease both' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #34d399, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 14px rgba(52,211,153,0.4)',
              flexShrink: 0,
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
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.04em' }}>
                Sistema de Monitorización
              </div>
            </div>
          </div>

          {/* Centro: estado */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.3rem 1rem',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 20,
            animation: 'fadeInDown 0.5s 0.1s ease both',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#34d399',
              animation: 'statusPulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.04em' }}>
              SISTEMA ACTIVO
            </span>
          </div>

          {/* Derecha: ubicación + toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.72rem', color: '#64748b', fontWeight: 500,
            }}>
              <MapPinIcon />
              <span>Cuevas del Almanzora, Almería</span>
            </div>

            <button
              onClick={toggle}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#f59e0b' : '#475569',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
                flexShrink: 0,
              }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── SUBHEADER: TIEMPO REAL ─────────────────────────────────────────── */}
      <div style={subheaderStyle}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Cabecera de la barra */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          }}>
            <ThermometerIcon />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tiempo en Cuevas del Almanzora
            </span>
            {!wLoading && !wError && (
              <span style={{
                fontSize: '0.65rem', color: '#34d399',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                padding: '1px 8px', borderRadius: 10, fontWeight: 600,
              }}>
                LIVE · Open-Meteo
              </span>
            )}
          </div>

          <WeatherBar weather={weather} wLoading={wLoading} wError={wError} />
        </div>
      </div>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main style={mainStyle}>

        {/* Sección SCADA */}
        <div style={{ animation: 'fadeInUp 0.6s 0.1s ease both', marginBottom: '2.5rem' }}>
          <SectionHeader
            label="SCADA"
            title="Esquema Hidráulico — Balsas"
            sub="Visualización en tiempo real · Actualización cada 10 s"
            accent="#60a5fa"
          />
          <div style={{
            background: isDark ? 'rgba(11,22,40,0.5)' : 'rgba(255,255,255,0.7)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: 18,
            overflow: 'hidden',
            padding: '1.5rem',
            boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <EsquemaBalsasIndustrial />
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
          margin: '2.5rem 0',
        }} />

        {/* Sección Sectores */}
        <div style={{ animation: 'fadeInUp 0.6s 0.2s ease both' }}>
          <SectionHeader
            label="PARCELAS"
            title="Sectores de Cultivo"
            sub="Datos de parcelas y gestión por sector"
            accent="#34d399"
          />
          <SectoresPanel />
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ label, title, sub, accent }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <span style={{
          fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.12em',
          color: accent, textTransform: 'uppercase',
          background: `${accent}18`, border: `1px solid ${accent}30`,
          padding: '2px 8px', borderRadius: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {label}
        </span>
        <h2 style={{
          margin: 0, fontSize: '1.2rem', fontWeight: 700,
          color: '#f1f5f9', letterSpacing: '-0.02em',
          fontFamily: "'Inter', sans-serif",
        }}>
          {title}
        </h2>
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', marginLeft: 2 }}>
        {sub}
      </p>
    </div>
  );
}