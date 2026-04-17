import React, { useState, useEffect } from 'react';
import { sectorService } from '../api/apiservice.jsx';

// ─── Iconos inline ────────────────────────────────────────────────────────────
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 0 0 1.6 1.2A47.1 47.1 0 0 0 16 14c-1 4-2.25 6-6 8"/>
    <path d="M3.82 19.34C6.16 12.18 13.67 7.64 21 7c-.2 3.85-2.1 7.38-5 9.5"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── Sector Card ─────────────────────────────────────────────────────────────
function SectorCard({ sector }) {
  const rows = [
    sector.cultivo  && { icon: <LeafIcon />,   label: 'Cultivo',     val: sector.cultivo,                           color: 'var(--green)' },
    sector.parcela  && { icon: <GridIcon />,   label: 'Parcela',     val: sector.parcela,                           color: 'var(--accent)' },
    sector.superficie && { icon: <GridIcon />, label: 'Superficie',  val: `${sector.superficie.toFixed(2)} m²`,     color: 'var(--amber)' },
    (sector.latitud || sector.longitud) && {
      icon: <MapPinIcon />, label: 'Coordenadas',
      val: `${sector.latitud?.toFixed(5) ?? 'N/A'} N · ${sector.longitud?.toFixed(5) ?? 'N/A'} E`,
      color: 'var(--red)',
    },
  ].filter(Boolean);

  return (
    <div className="sector-card">
      <div className="sector-card-header">
        <span className="sector-card-name">{sector.nombre}</span>
        <span className="sector-card-id">ID #{sector.id}</span>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="sector-info-row">
          <div className="sector-info-icon" style={{ color: row.color, borderColor: 'var(--border)' }}>
            {row.icon}
          </div>
          <div>
            <div className="sector-info-label">{row.label}</div>
            <div className="sector-info-value">{row.val}</div>
          </div>
        </div>
      ))}

      <button className="sector-detail-btn">Ver detalles</button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function SectoresPanel() {
  const [sectores, setSectores] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    sectorService.getSectorInfo()
      .then(data => setSectores(data))
      .catch(err  => { console.error(err); setError('No se pudieron cargar los sectores'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="state-box">
      <span className="spinner" style={{marginBottom:'0.75rem'}} />
      <p style={{marginTop:'0.75rem'}}>Cargando sectores…</p>
    </div>
  );

  if (error) return (
    <div className="state-box">
      <p className="state-error"><AlertIcon />{error}</p>
    </div>
  );

  if (sectores.length === 0) return (
    <div className="state-box"><p>No hay sectores disponibles.</p></div>
  );

  return (
    <div className="sectors-grid">
      {sectores.map(s => <SectorCard key={s.id} sector={s} />)}
    </div>
  );
}
