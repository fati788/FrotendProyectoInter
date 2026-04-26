import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkline from './Sparkline';
import TableView from './TableView';
import ChartView from './ChartView';

const ICON_BY_TYPE = {
    VOLUMEN:        '◈',
    PULSADOR:       '◎',
    PRESION:        '◉',
    CAUDAL:         '◐',
    HUMEDAD:        '◑',
    BOMBA:          '◒',
    ELECTROVALVULA: '◓',
};

const normalizeLectures = (lectures) =>
    lectures.map(l => ({
        ...l,
        timeDay: l.timeDay ?? l.timestamp ?? l.fecha ?? new Date().toISOString(),
    }));

export default function SensorCardLecturas({ sensor, lectures = [], isOpen, onToggle }) {
    const [view,      setView]      = useState('chart');
    const [chartType, setChartType] = useState('line');

    const icon        = ICON_BY_TYPE[sensor.tipo?.toUpperCase()] ?? '◌';
    const lastLecture = lectures[lectures.length - 1] ?? null;
    const prevLecture = lectures[lectures.length - 2] ?? null;
    const unit        = lastLecture?.unidad ?? '—';

    const delta = lastLecture && prevLecture
        ? (lastLecture.valor - prevLecture.valor).toFixed(2)
        : null;
    const trend = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';

    const activeLectures = normalizeLectures(lectures);
    const max = activeLectures.length ? Math.max(...activeLectures.map(l => l.valor)).toFixed(1) : '—';
    const min = activeLectures.length ? Math.min(...activeLectures.map(l => l.valor)).toFixed(1) : '—';
    const avg = activeLectures.length
        ? (activeLectures.reduce((s, l) => s + l.valor, 0) / activeLectures.length).toFixed(1)
        : '—';


    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={onToggle}
            style={{
                background:   '#fff',
                border:       `1.5px solid ${isOpen ? '#bbf7d0' : '#f1f5f9'}`,
                borderRadius: 16,
                overflow:     'hidden',
                cursor:       'pointer',
                boxShadow:    isOpen
                    ? '0 0 0 3px #f0fdf4, 0 8px 32px rgba(34,197,94,0.08)'
                    : '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                fontFamily: "'Sora', sans-serif",
            }}
        >
            {/* ── Cabecera ─────────────────────────────────────────────── */}
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20, color: '#22c55e', lineHeight: 1 }}>{icon}</span>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                {sensor.tipo}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                                SECTOR {sensor.sectorId} · TOPIC:{sensor.topicMQTT}
                            </div>
                        </div>
                    </div>
                    {/* Badge tipo sensor (sin estado) */}
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: '#6366f1',
                        background: '#f5f3ff', padding: '3px 10px', borderRadius: 20,
                        fontFamily: "'DM Mono', monospace",
                    }}>
            {sensor.nombre}
          </span>
                </div>

                {/* Valor actual + delta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {lastLecture?.valor ?? '—'}
            </span>
                        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4, fontFamily: "'DM Mono', monospace" }}>
              {unit}
            </span>
                    </div>
                    {delta !== null && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                                color: delta > 0 ? '#16a34a' : delta < 0 ? '#ef4444' : '#94a3b8',
                            }}>
                                {trend} {Math.abs(delta)} {unit}
                            </div>
                            <div style={{ fontSize: 10, color: '#cbd5e1', fontFamily: "'DM Mono', monospace" }}>vs anterior</div>
                        </div>
                    )}
                </div>

                {/* Sparkline */}
                <div style={{ marginTop: 8, opacity: 0.6, height: 40 }}>
                    {lectures.length > 0
                        ? <Sparkline data={activeLectures} />
                        : <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', height: '100%' }}>Sin datos históricos</div>
                    }
                </div>
            </div>

            {/* ── Detalle expandible ───────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}
                    >
                        

                        {/* Tabs tabla/gráfico */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 18px', background: '#fafafa', borderBottom: '1px solid #f1f5f9',
                        }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {['chart', 'table'].map(v => (
                                    <button key={v} onClick={e => { e.stopPropagation(); setView(v); }} style={{
                                        padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                        fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: view === v ? 700 : 400,
                                        background: view === v ? '#22c55e' : 'transparent',
                                        color: view === v ? '#fff' : '#94a3b8', transition: 'all 0.15s',
                                    }}>
                                        {v === 'table' ? '↕ Tabla' : '∿ Gráfico'}
                                    </button>
                                ))}
                            </div>
                            {view === 'chart' && (
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {['line', 'bar'].map(ct => (
                                        <button key={ct} onClick={e => { e.stopPropagation(); setChartType(ct); }} style={{
                                            padding: '4px 10px', borderRadius: 6,
                                            border: `1px solid ${chartType === ct ? '#bbf7d0' : '#e2e8f0'}`,
                                            cursor: 'pointer', fontSize: 10, fontFamily: "'DM Mono', monospace",
                                            background: chartType === ct ? '#f0fdf4' : '#fff',
                                            color: chartType === ct ? '#15803d' : '#94a3b8', transition: 'all 0.15s',
                                        }}>
                                            {ct === 'line' ? 'Línea' : 'Barras'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Contenido */}
                        <div style={{ padding: '12px 18px 16px' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view + chartType}
                                    initial={{ opacity: 0, x: view === 'table' ? -12 : 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: view === 'table' ? 12 : -12 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                >
                                    {view === 'table'
                                        ? <TableView data={activeLectures} unit={unit} />
                                        : <ChartView data={activeLectures} chartType={chartType} />
                                    }
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Stats MÁX / MÍN / AVG */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                            borderTop: '1px solid #bbf7d0', background: '#f0fdf4',
                        }}>
                            {[{ label: 'MÁX', value: max }, { label: 'MÍN', value: min }, { label: 'AVG', value: avg }].map((stat, i) => (
                                <div key={stat.label} style={{
                                    padding: '10px 0', textAlign: 'center',
                                    borderRight: i < 2 ? '1px solid #bbf7d0' : 'none',
                                }}>
                                    <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>{stat.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', fontFamily: "'Sora', sans-serif" }}>{stat.value}</div>
                                    <div style={{ fontSize: 9, color: '#cbd5e1', fontFamily: "'DM Mono', monospace" }}>{unit}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{
                padding: '10px 18px', borderTop: isOpen ? 'none' : '1px solid #f8fafc',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isOpen ? '#fafafa' : '#fff',
            }}>
        <span style={{ fontSize: 10, color: '#cbd5e1', fontFamily: "'DM Mono', monospace" }}>
          {lectures.length} lecturas totales
        </span>
                <span style={{ fontSize: 10, color: '#cbd5e1', fontFamily: "'DM Mono', monospace" }}>
          {isOpen ? '▲ cerrar' : '▼ detalle'}
        </span>
            </div>
        </motion.div>
    );
}