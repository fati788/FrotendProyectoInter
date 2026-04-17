import { useTheme } from '../App.js';
import EsquemaBalsasIndustrial from './EsquemaBalsasIndustrial.jsx';
import SectoresPanel from './SectoresPanel.jsx';

// ─── Iconos SVG inline (sin dependencias extra) ──────────────────────────────
const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);

// ─── Datos del tiempo ─────────────────────────────────────────────────────────
const weatherForecast = [
  { day: 'Hoy',    temp: '25°',  condition: 'Soleado',  icon: '☀️' },
  { day: 'Mañana', temp: '22°',  condition: 'Nublado',  icon: '⛅' },
  { day: 'Pasado', temp: '20°',  condition: 'Lluvia',   icon: '🌧️' },
];

export default function IoTDashboard() {
  const { dark, toggle } = useTheme();

  return (
    <div className="app-wrapper">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon"><ActivityIcon /></div>
            <div>
              <div className="brand-name">Agrotech IoT</div>
              <div className="brand-sub">Sistema de Monitorización</div>
            </div>
          </div>

          <div className="header-controls">
            <div className="status-pill">
              <span className="status-dot" />
              Sistema activo
            </div>
            <button className="theme-toggle" onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'} aria-label="Cambiar tema">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Weather Bar ────────────────────────────────────────────────────── */}
      <div className="app-subheader">
        <div className="weather-bar">
          <span className="weather-label">
            <CloudIcon />
            Predicción — Próximos 3 días
          </span>
          <div className="weather-cards">
            {weatherForecast.map((f, i) => (
              <div key={i} className="weather-card">
                <span style={{fontSize:'1.1rem'}}>{f.icon}</span>
                <div>
                  <div className="weather-day">{f.day}</div>
                  <div className="weather-temp">{f.temp}</div>
                  <div className="weather-cond">{f.condition}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="app-main">

        {/* SCADA */}
        <div className="section-header">
          <h2 className="section-title">Esquema Hidráulico — Balsas</h2>
          <p className="section-sub">Visualización SCADA en tiempo real · Actualización cada 10 s</p>
        </div>

        <div className="scada-wrapper">
          <EsquemaBalsasIndustrial />
        </div>

        <hr className="section-divider" />

        {/* Sectores */}
        <div className="section-header">
          <h2 className="section-title">Sectores de Cultivo</h2>
          <p className="section-sub">Información detallada de las parcelas y cultivos asociados</p>
        </div>

        <SectoresPanel />

      </main>
    </div>
  );
}
