import React from 'react';

// ─── Paleta de colores por tipo de sensor ──────────────────────────────────────
export const SENSOR_TYPE_META = {
  HUMEDAD:       { color: '#60a5fa', glow: 'rgba(96,165,250,0.25)',   bg: 'rgba(96,165,250,0.1)',   label: 'Humedad' },
  TEMPERATURA:   { color: '#fb923c', glow: 'rgba(251,146,60,0.25)',   bg: 'rgba(251,146,60,0.1)',   label: 'Temperatura' },
  CAUDALIMETRO:  { color: '#34d399', glow: 'rgba(52,211,153,0.25)',   bg: 'rgba(52,211,153,0.1)',   label: 'Caudal' },
  ULTRASONIDOS:  { color: '#a78bfa', glow: 'rgba(167,139,250,0.25)',  bg: 'rgba(167,139,250,0.1)',  label: 'Nivel US' },
  BOMBA:         { color: '#38bdf8', glow: 'rgba(56,189,248,0.25)',   bg: 'rgba(56,189,248,0.1)',   label: 'Bomba' },
  ELECTROVALVULA:{ color: '#f472b6', glow: 'rgba(244,114,182,0.25)',  bg: 'rgba(244,114,182,0.1)',  label: 'Electroválvula' },
  DEFAULT:       { color: '#94a3b8', glow: 'rgba(148,163,184,0.2)',   bg: 'rgba(148,163,184,0.08)', label: 'Sensor' },
};

// ─── SVG icons inline ─────────────────────────────────────────────────────────
const icons = {
  HUMEDAD: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  TEMPERATURA: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  ),
  CAUDALIMETRO: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/>
    </svg>
  ),
  ULTRASONIDOS: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 2 2"/>
    </svg>
  ),
  BOMBA: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  ELECTROVALVULA: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  ),
  DEFAULT: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

/**
 * SensorIcon
 * @param {string}  type       - Tipo de sensor: HUMEDAD | TEMPERATURA | CAUDALIMETRO | ULTRASONIDOS | BOMBA | ELECTROVALVULA
 * @param {number}  size       - Tamaño del icono SVG (default 20)
 * @param {boolean} badge      - Si true, envuelve el icono en un badge circular con fondo y glow
 * @param {number}  badgeSize  - Tamaño del badge contenedor (default 38)
 * @param {boolean} animated   - Si true, añade un anillo pulsante al badge
 */
export const SensorIcon = ({ type = 'DEFAULT', size = 20, badge = false, badgeSize = 38, animated = false }) => {
  const meta = SENSOR_TYPE_META[type] || SENSOR_TYPE_META.DEFAULT;
  const IconComponent = icons[type] || icons.DEFAULT;

  if (!badge) {
    return <IconComponent size={size} color={meta.color} />;
  }

  return (
    <div style={{
      width: badgeSize,
      height: badgeSize,
      borderRadius: '50%',
      background: meta.bg,
      border: `1.5px solid ${meta.color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 12px ${meta.glow}`,
      position: 'relative',
      flexShrink: 0,
      transition: 'box-shadow 0.3s',
    }}>
      {animated && (
        <span style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          border: `1.5px solid ${meta.color}`,
          animation: 'sensorRingPulse 2s ease-out infinite',
          opacity: 0,
        }} />
      )}
      <style>{`
        @keyframes sensorRingPulse {
          0%   { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      <IconComponent size={size} color={meta.color} />
    </div>
  );
};

// ─── SensorTypeBadge: chip de texto con color ─────────────────────────────────
export const SensorTypeBadge = ({ type }) => {
  const meta = SENSOR_TYPE_META[type] || SENSOR_TYPE_META.DEFAULT;
  return (
    <span style={{
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: meta.color,
      background: meta.bg,
      border: `1px solid ${meta.color}35`,
      padding: '2px 8px',
      borderRadius: 6,
      fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
};

export default SensorIcon;