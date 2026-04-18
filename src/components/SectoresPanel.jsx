import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectorService } from '../api/apiservice.jsx';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}>
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}>
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ─── Colores por sector ────────────────────────────────────────────────────────
const SECTOR_PALETTE = [
  { accent: '#34d399', glow: 'rgba(52,211,153,0.15)', badge: 'rgba(52,211,153,0.12)', badgeBorder: 'rgba(52,211,153,0.3)' },
  { accent: '#60a5fa', glow: 'rgba(96,165,250,0.15)', badge: 'rgba(96,165,250,0.12)', badgeBorder: 'rgba(96,165,250,0.3)' },
  { accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)', badge: 'rgba(245,158,11,0.12)', badgeBorder: 'rgba(245,158,11,0.3)' },
];

// ─── Loader minimalista ────────────────────────────────────────────────────────
function PulseLoader({ color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: color || '#34d399',
          animation: `sectorDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes sectorDot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

// ─── Tarjeta de sector ─────────────────────────────────────────────────────────
function SectorCard({ sector, index, palette, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { accent, glow, badge, badgeBorder } = palette;

  const cardStyle = {
    position: 'relative',
    background: hovered
      ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(17,27,52,0.98) 100%)'
      : 'linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(17,24,46,0.92) 100%)',
    border: `1px solid ${hovered ? accent + '60' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 16,
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    transform: hovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
    boxShadow: hovered
      ? `0 20px 40px ${glow}, 0 0 0 1px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.06)`
      : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
    animationDelay: `${index * 0.12}s`,
    animation: 'cardSlideIn 0.6s cubic-bezier(0.4,0,0.2,1) both',
  };

  return (
    <>
      <style>{`
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={cardStyle} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

        {/* Glow corner */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 120, height: 120,
          background: `radial-gradient(ellipse at 100% 0%, ${glow} 0%, transparent 70%)`,
          borderRadius: '0 16px 0 0', pointerEvents: 'none',
          opacity: hovered ? 1 : 0.5, transition: 'opacity 0.35s',
        }} />

        {/* Número de sector */}
        <div style={{
          position: 'absolute', top: 16, right: 18,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
          color: accent, opacity: 0.7,
        }}>
          S-{sector.id?.toString().padStart(2, '0') || (index + 2).toString().padStart(2, '0')}
        </div>

        {/* Encabezado */}
        <div style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: badge, border: `1px solid ${badgeBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, transition: 'all 0.3s',
              boxShadow: hovered ? `0 0 14px ${glow}` : 'none',
            }}>
              <LeafIcon />
            </div>
            <div>
              <h3 style={{
                margin: 0, fontSize: '1rem', fontWeight: 700,
                color: '#f1f5f9', letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
              }}>
                {sector.nombre}
              </h3>
              <span style={{
                fontSize: '0.7rem', color: accent, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {sector.cultivo || 'Sin cultivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.3rem' }}>
          {sector.parcela && (
            <DataRow icon={<GridIcon />} label="Parcela" value={sector.parcela} color="#94a3b8" iconColor="#60a5fa" />
          )}
          {sector.superficie != null && (
            <DataRow icon={<GridIcon />} label="Superficie" value={`${Number(sector.superficie).toFixed(2)} m²`} color="#94a3b8" iconColor="#f59e0b" />
          )}
          {(sector.latitud || sector.longitud) && (
            <DataRow
              icon={<MapPinIcon />}
              label="Coordenadas"
              value={`${sector.latitud?.toFixed(4) ?? '—'} N · ${sector.longitud?.toFixed(4) ?? '—'} E`}
              color="#94a3b8" iconColor="#f472b6"
              mono
            />
          )}
        </div>

        {/* Botón */}
        <button
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '0.62rem 1rem',
            background: hovered ? accent : 'transparent',
            border: `1.5px solid ${hovered ? accent : accent + '50'}`,
            borderRadius: 10,
            color: hovered ? '#0f172a' : accent,
            fontSize: '0.82rem', fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            fontFamily: "'Inter', sans-serif",
            boxShadow: hovered ? `0 4px 14px ${glow}` : 'none',
          }}
        >
          Ver detalles SCADA
          <span style={{ transition: 'transform 0.25s', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}>
            <ArrowRightIcon />
          </span>
        </button>
      </div>
    </>
  );
}

function DataRow({ icon, label, value, color, iconColor, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: iconColor, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{
          fontSize: mono ? '0.78rem' : '0.85rem',
          color: color || '#cbd5e1',
          fontWeight: 600,
          fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : "'Inter',sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton de carga ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16, padding: '1.5rem',
      animation: 'skeletonPulse 1.8s ease-in-out infinite',
    }}>
      <style>{`
        @keyframes skeletonPulse {
          0%,100% { opacity: 0.5; } 50% { opacity: 1; }
        }
        .sk-line { background: rgba(255,255,255,0.07); border-radius: 6px; }
      `}</style>
      <div className="sk-line" style={{width:'40%', height:12, marginBottom:10}} />
      <div className="sk-line" style={{width:'70%', height:18, marginBottom:20}} />
      <div className="sk-line" style={{width:'100%', height:10, marginBottom:8}} />
      <div className="sk-line" style={{width:'85%', height:10, marginBottom:8}} />
      <div className="sk-line" style={{width:'60%', height:10, marginBottom:24}} />
      <div className="sk-line" style={{width:'100%', height:36}} />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function SectoresPanel() {
  const navigate = useNavigate();
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadSectores(); }, []);

  const loadSectores = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await sectorService.getSectorInfo();
      setSectores(data);
    } catch (err) {
      console.error('Error loading sectors:', err);
      setError('No se pudieron cargar los sectores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const containerStyle = {
    padding: '0.25rem 0',
  };

  const headerRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.4rem',
    flexWrap: 'wrap',
    gap: 12,
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes spinOnce {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Cabecera de sección */}
      <div style={headerRowStyle}>
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
          }}>
            <div style={{
              width: 4, height: 22, borderRadius: 2,
              background: 'linear-gradient(180deg, #34d399, #60a5fa)',
            }} />
            <h2 style={{
              margin: 0, fontSize: '1.25rem', fontWeight: 700,
              color: '#f1f5f9', fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em',
            }}>
              Sectores de Cultivo
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', marginLeft: 14 }}>
            {sectores.length > 0 ? `${sectores.length} parcelas activas · Última carga en tiempo real` : 'Cargando datos de parcelas...'}
          </p>
        </div>

        {/* Botón refresh */}
        <button
          onClick={() => loadSectores(true)}
          disabled={loading || refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '0.45rem 1rem',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 8,
            color: '#34d399', fontSize: '0.78rem', fontWeight: 600,
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing ? 0.6 : 1,
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span style={{ animation: refreshing ? 'spinOnce 0.8s linear infinite' : 'none' }}>
            <RefreshIcon />
          </span>
          Actualizar
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <PulseLoader color="#34d399" />
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Conectando con la API de sectores...</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '1.1rem 1.4rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          color: '#f87171',
          animation: 'cardSlideIn 0.4s ease both',
        }}>
          <AlertIcon />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>Error de conexión</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{error}</div>
          </div>
          <button
            onClick={() => loadSectores()}
            style={{
              marginLeft: 'auto', padding: '0.35rem 0.85rem',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 7, color: '#f87171', fontSize: '0.76rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de tarjetas */}
      {!loading && !error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.25rem',
          }}>
            {sectores.map((sector, i) => (
              <SectorCard
                key={sector.id}
                sector={sector}
                index={i}
                palette={SECTOR_PALETTE[i % SECTOR_PALETTE.length]}
                onClick={() => navigate(`/sector/${sector.id}`)}
              />
            ))}
          </div>

          {sectores.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: 'rgba(15,23,42,0.5)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: 16,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌱</div>
              <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>No hay sectores disponibles</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}