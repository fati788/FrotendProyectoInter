import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkline from './Sparkline';
import TableView from './TableView';
import ChartView from './ChartView';
import { useTheme } from '../App.js';

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
    const { dark } = useTheme();
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
    const max = activeLectures.length ? Math.max(...activeLectures.map(l => l.valor)).toFixed(2) : '—';
    const min = activeLectures.length ? Math.min(...activeLectures.map(l => l.valor)).toFixed(2) : '—';
    const avg = activeLectures.length
        ? (activeLectures.reduce((s, l) => s + l.valor, 0) / activeLectures.length).toFixed(2)
        : '—';

    // ── Colores según tema ───────────────────────────────────────────────────────
    const cardBg       = dark ? 'rgba(13,27,46,0.95)'        : '#ffffff';
    const borderColor  = isOpen
        ? (dark ? 'rgba(52,211,153,0.35)' : '#bbf7d0')
        : (dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0');
    const sepColor     = dark ? 'rgba(255,255,255,0.06)'     : '#f1f5f9';
    const titleColor   = dark ? '#f1f5f9'                    : '#1e293b';
    const valueColor   = dark ? '#f1f5f9'                    : '#0f172a';
    const badgeBg      = dark ? 'rgba(99,102,241,0.18)'      : '#f5f3ff';
    const tabBarBg     = dark ? 'rgba(255,255,255,0.03)'     : '#f8fafc';
    const statsBg      = dark ? 'rgba(52,211,153,0.08)'      : '#f0fdf4';
    const statsBorder  = dark ? 'rgba(52,211,153,0.2)'       : '#bbf7d0';
    const statsVal     = dark ? '#34d399'                    : '#15803d';
    const footerBg     = dark ? 'rgba(255,255,255,0.02)'     : '#fafafa';
    const btnChartSel  = dark ? 'rgba(52,211,153,0.15)'      : '#f0fdf4';
    const btnChartSelBorder = dark ? 'rgba(52,211,153,0.4)'  : '#bbf7d0';
    const btnChartSelColor  = dark ? '#34d399'               : '#15803d';
    const btnChartUnselBorder = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={onToggle}
            style={{
                background:   cardBg,
                border:       `1.5px solid ${borderColor}`,
                borderRadius: 16,
                overflow:     'hidden',
                cursor:       'pointer',
                boxShadow:    isOpen
                    ? (dark
                        ? '0 0 0 1px rgba(52,211,153,0.2), 0 8px 32px rgba(0,0,0,0.4)'
                        : '0 0 0 3px #f0fdf4, 0 8px 32px rgba(34,197,94,0.08)')
                    : (dark
                        ? '0 2px 12px rgba(0,0,0,0.3)'
                        : '0 2px 12px rgba(0,0,0,0.04)'),
                transition: 'box-shadow 0.2s, border-color 0.2s',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* ── Cabecera ─────────────────────────────────────────────── */}
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${sepColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20, color: '#34d399', lineHeight: 1 }}>{icon}</span>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: titleColor, letterSpacing: '-0.02em' }}>
                                {sensor.tipo}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
                                SECTOR {sensor.sectorId} · {sensor.topicMQTT}
                            </div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: '#6366f1',
                        background: badgeBg, padding: '3px 10px', borderRadius: 20,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        {sensor.nombre}
                    </span>
                </div>

                {/* Valor actual + delta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <span style={{ fontSize: 28, fontWeight: 800, color: valueColor, lineHeight: 1 }}>
                            {lastLecture?.valor != null ? Number(lastLecture.valor).toFixed(2) : '—'}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                            {unit}
                        </span>
                    </div>
                    {delta !== null && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                                color: delta > 0 ? '#34d399' : delta < 0 ? '#f87171' : '#64748b',
                            }}>
                                {trend} {Math.abs(delta)} {unit}
                            </div>
                            <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>vs anterior</div>
                        </div>
                    )}
                </div>

                {/* Sparkline */}
                <div style={{ marginTop: 8, opacity: 0.7, height: 40 }}>
                    {lectures.length > 0
                        ? <Sparkline data={activeLectures} />
                        : <div style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', height: '100%' }}>Sin datos históricos</div>
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
                            padding: '10px 18px', background: tabBarBg, borderBottom: `1px solid ${sepColor}`,
                        }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {['chart', 'table'].map(v => (
                                    <button key={v} onClick={e => { e.stopPropagation(); setView(v); }} style={{
                                        padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                        fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: view === v ? 700 : 400,
                                        background: view === v ? '#34d399' : 'transparent',
                                        color: view === v ? (dark ? '#0f172a' : '#fff') : '#64748b',
                                        transition: 'all 0.15s',
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
                                            border: `1px solid ${chartType === ct ? btnChartSelBorder : btnChartUnselBorder}`,
                                            cursor: 'pointer', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                                            background: chartType === ct ? btnChartSel : 'transparent',
                                            color: chartType === ct ? btnChartSelColor : '#64748b',
                                            transition: 'all 0.15s',
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
                            borderTop: `1px solid ${statsBorder}`, background: statsBg,
                        }}>
                            {[{ label: 'MÁX', value: max }, { label: 'MÍN', value: min }, { label: 'AVG', value: avg }].map((stat, i) => (
                                <div key={stat.label} style={{
                                    padding: '10px 0', textAlign: 'center',
                                    borderRight: i < 2 ? `1px solid ${statsBorder}` : 'none',
                                }}>
                                    <div style={{ fontSize: 9, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>{stat.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: statsVal, fontFamily: "'Inter', sans-serif" }}>{stat.value}</div>
                                    <div style={{ fontSize: 9, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>{unit}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{
                padding: '10px 18px', borderTop: isOpen ? 'none' : `1px solid ${sepColor}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isOpen ? tabBarBg : footerBg,
            }}>
                <span style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
                    {lectures.length} lecturas
                </span>
                <span style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
                    {isOpen ? '▲ cerrar' : '▼ detalle'}
                </span>
            </div>
        </motion.div>
    );
}