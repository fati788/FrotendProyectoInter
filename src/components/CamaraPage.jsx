import { useState, useEffect, useRef, useCallback } from 'react';
import AppShell from './AppShell.jsx';
import { useTheme } from '../App.js';
import { camaraService } from '../api/apiservice.jsx';

// ─── Iconos ───────────────────────────────────────────────────────────────────
const BugIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M8 2l1.88 1.88M15.12 3.88 17 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
        <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M20 13h-4M17.47 9c1.93-.2 3.53-1.9 3.53-4M18 5a3 3 0 0 0-3-3H9"/>
    </svg>
);
const ThermometerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
);
const DropIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
);
const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);
const ActivityIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTs(ts) {
    if (!ts) return '—';
    try {
        const d = new Date(ts);
        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return ts; }
}
function fmtDate(ts) {
    if (!ts) return '—';
    try {
        const d = new Date(ts);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
            + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, color, dark }) {
    return (
        <div style={{
            flex: 1,
            minWidth: 120,
            background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12,
            padding: '1rem 1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color }}>{icon}</span>
                <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: dark ? '#64748b' : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: value != null ? color : (dark ? '#334155' : '#cbd5e1'),
                    lineHeight: 1,
                }}>
                    {value != null ? value : '—'}
                </span>
                {unit && value != null && (
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.8rem',
                        color: dark ? '#64748b' : '#94a3b8',
                        fontWeight: 600,
                    }}>{unit}</span>
                )}
            </div>
        </div>
    );
}

// ─── Live Feed con overlay de detecciones ─────────────────────────────────────
function LiveFeed({ latest, dark }) {
    const [imgError, setImgError] = useState(false);
    const imgRef = useRef(null);
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

    // Refrescamos cada 2s con cache-bust para simular el stream
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 2000);
        return () => clearInterval(id);
    }, []);

    const snapshotUrl = `${camaraService.snapshotUrl}?t=${tick}`;

    const boxes = latest?.boxes ?? [];
    const imgW  = latest?.image_width  ?? 640;
    const imgH  = latest?.image_height ?? 480;

    const handleImgLoad = (e) => {
        setImgError(false);
        setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    };

    const streamBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.1)';

    return (
        <div style={{
            background: dark ? 'rgba(6,13,26,0.6)' : '#fff',
            border: streamBorder,
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            {/* Cabecera del feed */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#34d399' }}><CameraIcon /></span>
                    <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: dark ? '#94a3b8' : '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}>Vista en Vivo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#34d399',
                        boxShadow: '0 0 0 0 rgba(52,211,153,0.5)',
                        animation: 'livePulse 2s infinite',
                        display: 'inline-block',
                    }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.05em' }}>LIVE</span>
                </div>
            </div>

            {/* Contenedor del vídeo / imagen + overlay */}
            <div style={{ position: 'relative', background: '#000', lineHeight: 0 }}>
                {imgError ? (
                    <div style={{
                        height: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        color: dark ? '#475569' : '#94a3b8',
                    }}>
                        <span style={{ fontSize: '2.5rem' }}>📷</span>
                        <span style={{ fontSize: '0.82rem' }}>No se puede conectar con la cámara</span>
                    </div>
                ) : (
                    <>
                        {/* Intentamos MJPEG primero; si falla, usamos snapshot polling */}
                        <img
                            ref={imgRef}
                            src={camaraService.liveUrl}
                            alt="Feed en vivo"
                            onError={() => setImgError(true)}
                            onLoad={handleImgLoad}
                            style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'contain' }}
                        />

                        {/* Overlay SVG con las cajas de detección */}
                        {boxes.length > 0 && (
                            <svg
                                viewBox={`0 0 ${imgW} ${imgH}`}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    pointerEvents: 'none',
                                }}
                            >
                                {boxes.map((box, i) => (
                                    <g key={box.id ?? i}>
                                        <rect
                                            x={box.x1} y={box.y1}
                                            width={box.x2 - box.x1} height={box.y2 - box.y1}
                                            fill="rgba(52,211,153,0.12)"
                                            stroke="#34d399"
                                            strokeWidth={2}
                                            rx={3}
                                        />
                                        {/* Etiqueta encima de la caja */}
                                        <rect
                                            x={box.x1} y={Math.max(0, box.y1 - 20)}
                                            width={60} height={18}
                                            fill="rgba(52,211,153,0.85)"
                                            rx={3}
                                        />
                                        <text
                                            x={box.x1 + 4}
                                            y={Math.max(13, box.y1 - 5)}
                                            fill="#0f172a"
                                            fontSize={11}
                                            fontFamily="'JetBrains Mono', monospace"
                                            fontWeight="bold"
                                        >
                                            {box.id ?? `#${i + 1}`}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        )}
                    </>
                )}
            </div>

            {/* Pie del feed */}
            <div style={{
                padding: '0.6rem 1rem',
                borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: '0.68rem', color: dark ? '#475569' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                    {latest?.camera_id ?? '—'} · {latest?.model ?? '—'}
                </span>
                <span style={{ fontSize: '0.68rem', color: dark ? '#475569' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtTs(latest?.timestamp)}
                </span>
            </div>
        </div>
    );
}

// ─── Tabla de eventos ─────────────────────────────────────────────────────────
function EventsTable({ events, dark }) {
    const borderColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
    const rowHover    = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
    const [hovered, setHovered] = useState(null);

    return (
        <div style={{
            background: dark ? 'rgba(6,13,26,0.6)' : '#fff',
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '0.75rem 1rem',
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <span style={{ color: '#a78bfa' }}><ActivityIcon /></span>
                <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: dark ? '#94a3b8' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                }}>Historial de eventos</span>
                {events?.length > 0 && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.65rem',
                        color: '#a78bfa',
                        background: 'rgba(167,139,250,0.1)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        padding: '1px 8px',
                        borderRadius: 10,
                        fontWeight: 600,
                    }}>{events.length} registros</span>
                )}
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
                {!events || events.length === 0 ? (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: dark ? '#334155' : '#cbd5e1',
                        fontSize: '0.82rem',
                    }}>Sin eventos registrados</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{
                                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                            }}>
                                {['Fecha/Hora', 'Insectos', 'Temp.', 'Humedad'].map(h => (
                                    <th key={h} style={{
                                        padding: '0.5rem 0.8rem',
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        color: dark ? '#475569' : '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        fontSize: '0.65rem',
                                        borderBottom: `1px solid ${borderColor}`,
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((ev, i) => {
                                const hasInsects = ev.total_detections > 0;
                                return (
                                    <tr
                                        key={i}
                                        onMouseEnter={() => setHovered(i)}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{
                                            background: hovered === i ? rowHover : 'transparent',
                                            borderBottom: `1px solid ${borderColor}`,
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <td style={{
                                            padding: '0.45rem 0.8rem',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: dark ? '#94a3b8' : '#475569',
                                            whiteSpace: 'nowrap',
                                        }}>{fmtDate(ev.timestamp)}</td>
                                        <td style={{ padding: '0.45rem 0.8rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontWeight: 700,
                                                color: hasInsects ? '#fb923c' : '#34d399',
                                                fontSize: '0.82rem',
                                            }}>
                                                {hasInsects ? '🦟' : '✓'} {ev.total_detections ?? 0}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '0.45rem 0.8rem',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: dark ? '#f59e0b' : '#d97706',
                                            fontWeight: 600,
                                        }}>
                                            {ev.temperature_c != null ? `${ev.temperature_c.toFixed(1)}°C` : '—'}
                                        </td>
                                        <td style={{
                                            padding: '0.45rem 0.8rem',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: dark ? '#60a5fa' : '#3b82f6',
                                            fontWeight: 600,
                                        }}>
                                            {ev.humidity_pct != null ? `${ev.humidity_pct.toFixed(0)}%` : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ─── CamaraPage ───────────────────────────────────────────────────────────────
export default function CamaraPage() {
    const { dark } = useTheme();

    const [latest,     setLatest]     = useState(null);
    const [health,     setHealth]     = useState(null);
    const [events,     setEvents]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);

    // ── Primera carga ───────────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        try {
            const [lat, hlt, evts] = await Promise.all([
                camaraService.getLatest(),
                camaraService.getHealth(),
                camaraService.getEvents(50),
            ]);
            setLatest(lat);
            setHealth(hlt);
            setEvents(evts?.events ?? []);
            setError(null);
        } catch (e) {
            console.error('Error cargando datos cámara:', e);
            setError('No se puede conectar con el servicio de cámara');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // ── Poll latest cada 3 segundos ─────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const lat = await camaraService.getLatest();
                setLatest(lat);
            } catch { /* silencioso */ }
        }, 3000);
        return () => clearInterval(id);
    }, []);

    // ── Poll events cada 30 segundos ────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const evts = await camaraService.getEvents(50);
                setEvents(evts?.events ?? []);
            } catch { /* silencioso */ }
        }, 30_000);
        return () => clearInterval(id);
    }, []);

    // ── Colores tema ────────────────────────────────────────────────────────
    const pageBg      = dark ? 'transparent' : 'transparent';
    const sectionTit  = dark ? '#f1f5f9' : '#0f172a';
    const mutedColor  = dark ? '#64748b'  : '#94a3b8';

    // ── Estado del servicio ─────────────────────────────────────────────────
    const serviceOk = health?.status === 'ok';
    const hasState  = health?.has_state;

    return (
        <AppShell>
            <style>{`
                @keyframes livePulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
                    50%       { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>

            <div style={{
                maxWidth: 1300,
                margin: '0 auto',
                padding: '2rem',
            }}>

                {/* ── Cabecera de página ─────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: '1.5rem',
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            color: sectionTit,
                            fontFamily: "'Inter', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <span>🦟</span>
                            Detección de Plagas — Cámara IA
                        </h2>
                        <p style={{
                            margin: '4px 0 0',
                            fontSize: '0.8rem',
                            color: mutedColor,
                        }}>
                            Monitorización en tiempo real con detección automática de insectos
                        </p>
                    </div>

                    {/* Badges de estado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {health && (
                            <>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: 20,
                                    background: serviceOk ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                                    border:     serviceOk ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(248,113,113,0.3)',
                                    color:      serviceOk ? '#34d399' : '#f87171',
                                }}>
                                    {serviceOk ? '● ONLINE' : '● OFFLINE'}
                                </span>
                                {health.model && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        padding: '3px 10px',
                                        borderRadius: 20,
                                        background: 'rgba(167,139,250,0.1)',
                                        border: '1px solid rgba(167,139,250,0.25)',
                                        color: '#a78bfa',
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {health.model}
                                    </span>
                                )}
                                {health.camera_id && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        padding: '3px 10px',
                                        borderRadius: 20,
                                        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                        border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                                        color: mutedColor,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {health.camera_id}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Error global ───────────────────────────────────────── */}
                {error && !loading && (
                    <div style={{
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        borderRadius: 12,
                        padding: '1rem 1.5rem',
                        marginBottom: '1.5rem',
                        color: '#f87171',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}>
                        <span>⚠</span>
                        <span>{error}</span>
                        <button
                            onClick={loadAll}
                            style={{
                                marginLeft: 'auto',
                                background: 'rgba(248,113,113,0.15)',
                                border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: 8,
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '4px 12px',
                                cursor: 'pointer',
                            }}
                        >Reintentar</button>
                    </div>
                )}

                {/* ── Spinner inicial ─────────────────────────────────────── */}
                {loading && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '3rem',
                        color: mutedColor,
                        fontSize: '0.85rem',
                    }}>
                        <div style={{
                            width: 20, height: 20,
                            border: '2px solid rgba(52,211,153,0.2)',
                            borderTopColor: '#34d399',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        Conectando con la cámara...
                    </div>
                )}

                {/* ── Layout principal ────────────────────────────────────── */}
                {!loading && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        gap: '1.5rem',
                        alignItems: 'start',
                    }}>

                        {/* ── Columna izquierda: feed vivo ───────────────── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <LiveFeed latest={latest} dark={dark} />

                            {/* Resumen de estadísticas globales */}
                            {events.length > 0 && (() => {
                                const totalWithInsects = events.filter(e => e.total_detections > 0).length;
                                const maxDet = Math.max(...events.map(e => e.total_detections ?? 0));
                                const avgDet = (events.reduce((s, e) => s + (e.total_detections ?? 0), 0) / events.length).toFixed(1);
                                return (
                                    <div style={{
                                        background: dark ? 'rgba(6,13,26,0.6)' : '#fff',
                                        border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: 16,
                                        padding: '1rem 1.25rem',
                                    }}>
                                        <div style={{
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            color: mutedColor,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            marginBottom: '0.75rem',
                                        }}>Resumen del período</div>
                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Eventos totales', val: events.length,      col: dark ? '#94a3b8' : '#475569' },
                                                { label: 'Con detección',   val: totalWithInsects,    col: '#fb923c' },
                                                { label: 'Máx. insectos',   val: maxDet,              col: '#f87171' },
                                                { label: 'Media insectos',  val: avgDet,              col: '#a78bfa' },
                                            ].map(({ label, val, col }) => (
                                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ fontSize: '0.65rem', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: col }}>{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* ── Columna derecha: stats + eventos ───────────── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Stats en tiempo real */}
                            <div style={{
                                background: dark ? 'rgba(6,13,26,0.6)' : '#fff',
                                border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
                                borderRadius: 16,
                                padding: '1rem',
                            }}>
                                <div style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: mutedColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: '0.75rem',
                                }}>Estado actual</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <StatCard
                                        icon={<BugIcon />}
                                        label="Insectos detectados"
                                        value={latest?.total_detections}
                                        unit="uds"
                                        color={latest?.total_detections > 0 ? '#fb923c' : '#34d399'}
                                        dark={dark}
                                    />
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <StatCard
                                            icon={<ThermometerIcon />}
                                            label="Temperatura"
                                            value={latest?.temperature_c != null ? latest.temperature_c.toFixed(1) : null}
                                            unit="°C"
                                            color="#f59e0b"
                                            dark={dark}
                                        />
                                        <StatCard
                                            icon={<DropIcon />}
                                            label="Humedad"
                                            value={latest?.humidity_pct != null ? Math.round(latest.humidity_pct) : null}
                                            unit="%"
                                            color="#60a5fa"
                                            dark={dark}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de eventos */}
                            <EventsTable events={events} dark={dark} />
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
