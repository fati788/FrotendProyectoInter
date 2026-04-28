import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sectorService } from '../api/apiservice.jsx';
import SectorScadaIndustrial from '../components/SectorScadaIndustrial.jsx';
import AppShell from './AppShell.jsx';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
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

  return (
    <AppShell>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* Cabecera de página: botón volver + nombre sector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', animation: 'fadeInDown 0.4s ease both' }}>
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
          {sector && (
            <>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9' }}>
                {sector.nombre}
              </h1>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                padding: '3px 10px', borderRadius: 8, fontFamily: "'JetBrains Mono',monospace",
              }}>
                S-{sector.id?.toString().padStart(2, '0')}
              </span>
            </>
          )}
        </div>

        {loading && <p style={{ color: '#94a3b8' }}>Cargando sector...</p>}

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
    </AppShell>
  );
}
