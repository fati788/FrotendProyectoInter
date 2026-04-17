import React, { useState, useEffect } from 'react';
import { sensorService } from '../api/apiservice.jsx';
import { useTheme } from '../App.js';

const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const pctFromLevel = (levelCm, maxCm) => {
  if (levelCm == null || maxCm == null || maxCm <= 0) return 0;
  return clamp((levelCm / maxCm) * 100, 0, 100);
};

// ─── Popup Modal ─────────────────────────────────────────────────────────────
function Modal({ popup, state, sensorData, onClose, onPumpToggle, onValveToggle }) {
  if (!popup.visible) return null;

  const getSensorObj = (id) =>
    id === 'bp' ? sensorData.mainTank : sensorData.tanks[id];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">
            {popup.type === 'pump'   && '⚙️ Bomba centrífuga'}
            {popup.type === 'valve'  && `🔧 Electroválvula ${popup.id?.toUpperCase()}`}
            {popup.type === 'sensor' && `📡 Sensor nivel — ${
              popup.id === 'bp' ? 'Balsa Principal' :
              popup.id === 'b1' ? 'Balsa 1' :
              popup.id === 'b2' ? 'Balsa 2' : 'Balsa 3'
            }`}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── PUMP ────────────────────────────────────────────────────────── */}
        {popup.type === 'pump' && (
          <>
            <div className="modal-row">
              <span className="modal-label">Estado</span>
              <span className={`badge ${state.pump.estado ? 'badge-ok' : 'badge-error'}`}>
                {state.pump.estado ? 'En marcha' : 'Parada'}
              </span>
            </div>
            <div className="modal-row">
              <span className="modal-label">Topic MQTT</span>
              <code className="modal-code">{state.pump.topicMQTT || '—'}</code>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className={`ctrl-btn ctrl-btn-on ${state.pump.estado ? 'active' : ''}`}
                onClick={() => onPumpToggle(true)}
              >Arrancar</button>
              <button
                className={`ctrl-btn ctrl-btn-off ${!state.pump.estado ? 'active' : ''}`}
                onClick={() => onPumpToggle(false)}
              >Parar</button>
            </div>
          </>
        )}

        {/* ── VALVE ───────────────────────────────────────────────────────── */}
        {popup.type === 'valve' && popup.id && (
          <>
            <div className="modal-row">
              <span className="modal-label">Estado</span>
              <span className={`badge ${state[popup.id]?.estado ? 'badge-ok' : 'badge-warn'}`}>
                {state[popup.id]?.estado ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
            <div className="modal-row">
              <span className="modal-label">Topic MQTT</span>
              <code className="modal-code">{state[popup.id]?.topicMQTT || '—'}</code>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className={`ctrl-btn ctrl-btn-on ${state[popup.id]?.estado ? 'active' : ''}`}
                onClick={() => onValveToggle(popup.id, true)}
              >Abrir</button>
              <button
                className={`ctrl-btn ctrl-btn-off ${!state[popup.id]?.estado ? 'active' : ''}`}
                onClick={() => onValveToggle(popup.id, false)}
              >Cerrar</button>
            </div>
          </>
        )}

        {/* ── SENSOR ──────────────────────────────────────────────────────── */}
        {popup.type === 'sensor' && popup.id && (() => {
          const s = getSensorObj(popup.id);
          if (!s) return null;
          const pct = Math.round((s.distanceCm / s.maxDistanceCm) * 100);
          const warn = s.distanceCm < 25;
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className="sensor-value-big" style={{ color: warn ? 'var(--amber)' : 'var(--green)' }}>
                  {s.distanceCm}<span className="sensor-value-unit"> cm</span>
                </span>
                <span className={`badge ${warn ? 'badge-warn' : 'badge-ok'}`}>
                  {warn ? '⚠ Alerta' : '✓ Normal'}
                </span>
              </div>
              <div className="level-bar-track">
                <div className="level-bar-fill" style={{
                  width: `${pct}%`,
                  background: warn ? 'var(--amber)' : 'var(--green)'
                }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--txt-muted)', marginBottom:'1rem' }}>
                <span>{pct}% del nivel</span>
                <span>Máx {s.maxDistanceCm} cm</span>
              </div>
              {s.nombre && (
                <div className="modal-row"><span className="modal-label">Nombre</span><span className="modal-value">{s.nombre}</span></div>
              )}
              {s.tipo && (
                <div className="modal-row"><span className="modal-label">Tipo</span><span className="modal-value">{s.tipo}</span></div>
              )}
              {s.ubicacion && (
                <div className="modal-row"><span className="modal-label">Ubicación</span><span className="modal-value">{s.ubicacion}</span></div>
              )}
              {s.topicMQTT && (
                <div className="modal-row"><span className="modal-label">Topic MQTT</span><code className="modal-code">{s.topicMQTT}</code></div>
              )}
            </>
          );
        })()}

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EsquemaBalsasIndustrial() {
  const { dark } = useTheme();

  const ACTUADORES    = { bomba: 1, ev1: 2, ev2: 3, ev3: 4 };
const SENSORES_NIVEL = {
  mainTank: 2, // 👈 ESTE es el que tiene cm reales
  b1: 6,
  b2: 7,
  b3: 8
};

  const [state, setState] = useState({
    pump: { estado: null, topicMQTT: '' },
    ev1:  { estado: null, topicMQTT: '' },
    ev2:  { estado: null, topicMQTT: '' },
    ev3:  { estado: null, topicMQTT: '' },
  });

  const [sensorData, setSensorData] = useState({
    mainTank: { distanceCm: 0, maxDistanceCm: 100 },
    tanks: {
      b1: { distanceCm: 0, maxDistanceCm: 100 },
      b2: { distanceCm: 0, maxDistanceCm: 100 },
      b3: { distanceCm: 0, maxDistanceCm: 100 },
    },
  });

  const [popup, setPopup] = useState({ visible: false, type: '', id: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActuadores();
    loadSensores();
    const iv = setInterval(() => { loadActuadores(); loadSensores(); }, 10000);
    return () => clearInterval(iv);
  }, []);

  const loadActuadores = async () => {
    try {
      setLoading(true);
      const [bomba, ev1, ev2, ev3] = await Promise.all([
        sensorService.getSensorById(ACTUADORES.bomba),
        sensorService.getSensorById(ACTUADORES.ev1),
        sensorService.getSensorById(ACTUADORES.ev2),
        sensorService.getSensorById(ACTUADORES.ev3),
      ]);
      const isOn = e => e === 'ARRANCADO' || e === 'on' || e === true;
      setState({
        pump: { estado: isOn(bomba.estado), topicMQTT: bomba.topicMQTT || 'actuadores/bomba' },
        ev1:  { estado: isOn(ev1.estado),   topicMQTT: ev1.topicMQTT  || 'actuadores/ev1/cmd' },
        ev2:  { estado: isOn(ev2.estado),   topicMQTT: ev2.topicMQTT  || 'actuadores/ev2/cmd' },
        ev3:  { estado: isOn(ev3.estado),   topicMQTT: ev3.topicMQTT  || 'actuadores/ev3/cmd' },
      });
    } catch (e) { console.error('Error loading actuadores:', e); }
    finally { setLoading(false); }
  };

  const loadSensores = async () => {
    try {
      setLoading(true);
      const [mts, mtr, b1s, b1r, b2s, b2r, b3s, b3r] = await Promise.all([
        sensorService.getSensorById(SENSORES_NIVEL.mainTank),
        sensorService.getLastSensorReading(SENSORES_NIVEL.mainTank),
        sensorService.getSensorById(SENSORES_NIVEL.b1),
        sensorService.getLastSensorReading(SENSORES_NIVEL.b1),
        sensorService.getSensorById(SENSORES_NIVEL.b2),
        sensorService.getLastSensorReading(SENSORES_NIVEL.b2),
        sensorService.getSensorById(SENSORES_NIVEL.b3),
        sensorService.getLastSensorReading(SENSORES_NIVEL.b3),
      ]);
      setSensorData({
        mainTank: { ...mts, distanceCm: mtr.valor, maxDistanceCm: 100 },
        tanks: {
          b1: { ...b1s, distanceCm: b1r.valor, maxDistanceCm: 100 },
          b2: { ...b2s, distanceCm: b2r.valor, maxDistanceCm: 100 },
          b3: { ...b3s, distanceCm: b3r.valor, maxDistanceCm: 100 },
        },
      });
    } catch (e) { console.error('Error loading sensores:', e); }
    finally { setLoading(false); }
  };

  const handlePumpToggle = async (val) => {
    try {
      await sensorService.updateActuadorState(ACTUADORES.bomba, val ? 'ARRANCADO' : 'PARADO');
      setState(s => ({ ...s, pump: { ...s.pump, estado: val } }));
      setPopup({ visible: false });
    } catch (e) { console.error('Error pump toggle:', e); }
  };

  const handleValveToggle = async (id, val) => {
    try {
      await sensorService.updateActuadorState(ACTUADORES[id], val ? 'ARRANCADO' : 'PARADO');
      setState(s => ({ ...s, [id]: { ...s[id], estado: val } }));
      setPopup({ visible: false });
    } catch (e) { console.error('Error valve toggle:', e); }
  };

  const principalPct = pctFromLevel(sensorData.mainTank.distanceCm, sensorData.mainTank.maxDistanceCm);
  const b1Pct = pctFromLevel(sensorData.tanks.b1.distanceCm, sensorData.tanks.b1.maxDistanceCm);
  const b2Pct = pctFromLevel(sensorData.tanks.b2.distanceCm, sensorData.tanks.b2.maxDistanceCm);
  const b3Pct = pctFromLevel(sensorData.tanks.b3.distanceCm, sensorData.tanks.b3.maxDistanceCm);

  // ─── Theme colours inside SVG ───────────────────────────────────────────────
  const C = dark ? {
    lblFill:      '#8fa0bc',
    lblBoldFill:  '#c8d5e8',
    lblSmFill:    '#4d5f7a',
    tankBg:       '#1a2236',
    tankStroke:   '#2a3a58',
    waterFill:    'rgba(61,142,240,0.45)',
    pipeStroke:   '#3d8ef0',
    sensorBg:     '#0d2040',
    sensorStroke: '#3d8ef0',
    sigStroke:    '#3a4f6a',
    valOnBg:      'rgba(34,197,94,0.15)',
    valOnStroke:  '#22c55e',
    valOffBg:     'rgba(239,68,68,0.15)',
    valOffStroke: '#ef4444',
    pumpBg:       '#1a2236',
    pumpStroke:   '#2a3a58',
    impeller:     '#3d8ef0',
    legBg:        '#161c28',
    legStroke:    '#252f42',
    valOkTxt:     '#22c55e',
    valWarnTxt:   '#f59e0b',
    colBg:        '#3d8ef0',
  } : {
    lblFill:      '#4a5f7a',
    lblBoldFill:  '#1e3a5f',
    lblSmFill:    '#6b7fa0',
    tankBg:       '#e8f0fd',
    tankStroke:   '#93b4f0',
    waterFill:    'rgba(37,99,235,0.25)',
    pipeStroke:   '#2563eb',
    sensorBg:     '#dbeafe',
    sensorStroke: '#2563eb',
    sigStroke:    '#93b4f0',
    valOnBg:      'rgba(22,163,74,0.12)',
    valOnStroke:  '#16a34a',
    valOffBg:     'rgba(220,38,38,0.12)',
    valOffStroke: '#dc2626',
    pumpBg:       '#f0f4f9',
    pumpStroke:   '#cbd5e8',
    impeller:     '#2563eb',
    legBg:        '#f8fafc',
    legStroke:    '#d1dae8',
    valOkTxt:     '#16a34a',
    valWarnTxt:   '#d97706',
    colBg:        '#2563eb',
  };

  const warnColor   = dark ? '#ef4444' : '#dc2626';
  const warnTxtClr  = dark ? '#ef4444' : '#dc2626';

  const levelColor = (pct) =>
    pct < 25 ? (dark ? '#f59e0b' : '#d97706') : (dark ? '#22c55e' : '#16a34a');

  // ─── Valve symbol ────────────────────────────────────────────────────────────
  const ValveSym = ({ cx, cy, open, id, onClick }) => {
    const bg     = open ? C.valOnBg     : C.valOffBg;
    const stroke = open ? C.valOnStroke : C.valOffStroke;
    const txt    = open ? C.valOkTxt    : C.valWarnTxt;
    return (
      <g className="scada-hov" onClick={onClick}>
        <rect x={cx-14} y={cy-14} width="28" height="28" rx="6" fill={bg} stroke={stroke} strokeWidth="1.3"/>
        <line x1={cx-7} y1={cy-7} x2={cx+7} y2={cy+7} stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1={cx+7} y1={cy-7} x2={cx-7} y2={cy+7} stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x={cx-4} y={cy-22} width="8" height="10" rx="2" fill={stroke}/>
        <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'9px',fontWeight:700}} x={cx} y={cy+28} textAnchor="middle" fill={C.lblSmFill}>{id.toUpperCase()}</text>
        <rect x={cx-22} y={cy+31} width="44" height="13" rx="3" fill={bg} stroke={stroke} strokeWidth="0.8"/>
        <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'8.5px',fontWeight:700}} x={cx} y={cy+41} textAnchor="middle" fill={txt}>
          {open ? 'ABIERTA' : 'CERRADA'}
        </text>
      </g>
    );
  };

  // ─── Small tank ──────────────────────────────────────────────────────────────
  const SmallTank = ({ x, y, w, h, pct, label, sensorId, cpId }) => {
    const lc = levelColor(pct);
    const warn = pct < 25;
    return (
      <g className="scada-hov" onClick={() => setPopup({ visible: true, type: 'sensor', id: sensorId })}>
        <rect x={x} y={y} width={w} height={h} rx="5" fill={C.tankBg} stroke={C.tankStroke} strokeWidth="1.3"/>
        <rect x={x+1} y={y+1+(h-2)*(1-pct/100)} width={w-2} height={(h-2)*pct/100}
          fill={C.waterFill} clipPath={`url(#${cpId})`}/>
        <rect x={x} y={y} width={w} height={h} rx="5" fill="none" stroke={C.tankStroke} strokeWidth="1.3"/>
        <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'10px',fontWeight:700}} x={x+w/2} y={y+h-8} textAnchor="middle" fill={C.lblBoldFill}>{label}</text>
        {/* Sensor */}
        <line x1={x+w/2} y1={y} x2={x+w/2} y2={y-12} stroke={C.sigStroke} strokeWidth="1"/>
        <polygon points={`${x+w/2-6},${y-12} ${x+w/2+6},${y-12} ${x+w/2+4},${y-24} ${x+w/2-4},${y-24}`}
          fill={C.sensorBg} stroke={C.sensorStroke} strokeWidth="1"/>
        <path d={`M${x+w/2-4},${y-10} Q${x+w/2},${y-6} ${x+w/2+4},${y-10}`}
          fill="none" stroke={C.pipeStroke} strokeWidth="1" strokeLinecap="round"/>
        <line x1={x+w/2} y1={y-24} x2={x+w/2} y2={y-38} stroke={C.sigStroke} strokeWidth="1" strokeDasharray="3 2"/>
        <rect x={x+w/2-24} y={y-52} width="48" height="16" rx="4" fill={warn ? C.valOffBg : C.valOnBg} stroke={warn ? C.valOffStroke : C.valOnStroke} strokeWidth="0.8"/>
        <text style={{fontFamily:'JetBrains Mono,monospace',fontSize:'8px',fontWeight:700}} x={x+w/2} y={y-41} textAnchor="middle" fill={lc}>
          {sensorId === 'b1' ? sensorData.tanks.b1.distanceCm :
           sensorId === 'b2' ? sensorData.tanks.b2.distanceCm :
                                sensorData.tanks.b3.distanceCm} cm
        </text>
      </g>
    );
  };

  return (
    <div className="scada-inner">
      <svg width="100%" viewBox="0 0 700 490" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={C.pipeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <clipPath id="cp-bp2"><rect x="42" y="112" width="136" height="176" rx="4"/></clipPath>
          <clipPath id="cp-b1-2"><rect x="482" y="62" width="96" height="66" rx="4"/></clipPath>
          <clipPath id="cp-b2-2"><rect x="482" y="202" width="96" height="66" rx="4"/></clipPath>
          <clipPath id="cp-b3-2"><rect x="482" y="342" width="96" height="66" rx="4"/></clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── BALSA PRINCIPAL ────────────────────────────────────────────── */}
        <rect x="40" y="110" width="140" height="180" rx="7" fill={C.tankBg} stroke={C.tankStroke} strokeWidth="1.5"/>
        <rect x="42" y={112+(176*(100-principalPct)/100)} width="136" height={176*principalPct/100}
          fill={C.waterFill} clipPath="url(#cp-bp2)"/>
        <rect x="40" y="110" width="140" height="180" rx="7" fill="none" stroke={C.tankStroke} strokeWidth="1.5"/>
        <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'11px',fontWeight:700,letterSpacing:'0.04em'}} x="110" y="262" textAnchor="middle" fill={C.lblBoldFill}>BALSA PRINCIPAL</text>
        <text style={{fontFamily:'JetBrains Mono,monospace',fontSize:'9px',fontWeight:500}} x="110" y="275" textAnchor="middle" fill={levelColor(principalPct)}>{principalPct.toFixed(0)}%</text>

        {/* Sensor BP */}
        <g className="scada-hov" onClick={() => setPopup({ visible: true, type: 'sensor', id: 'bp' })}>
          <line x1="110" y1="110" x2="110" y2="96" stroke={C.sigStroke} strokeWidth="1"/>
          <polygon points="104,80 116,80 113,94 107,94" fill={C.sensorBg} stroke={C.sensorStroke} strokeWidth="1"/>
          <path d="M106,97 Q110,102 114,97" fill="none" stroke={C.pipeStroke} strokeWidth="1" strokeLinecap="round"/>
          <path d="M103,101 Q110,107 117,101" fill="none" stroke={C.pipeStroke} strokeWidth="0.6" strokeLinecap="round" opacity="0.5"/>
          <line x1="110" y1="80" x2="110" y2="52" stroke={C.sigStroke} strokeWidth="1" strokeDasharray="3 2"/>
          <rect x="78" y="38" width="64" height="17" rx="4" fill={sensorData.mainTank.distanceCm < 25 ? C.valOffBg : C.valOnBg} stroke={sensorData.mainTank.distanceCm < 25 ? C.valOffStroke : C.valOnStroke} strokeWidth="0.8"/>
          <text style={{fontFamily:'JetBrains Mono,monospace',fontSize:'8.5px',fontWeight:700}} x="110" y="50" textAnchor="middle" fill={levelColor(principalPct)}>{sensorData.mainTank.distanceCm} cm</text>
          <text style={{fontFamily:'Inter,sans-serif',fontSize:'8px'}} x="110" y="28" textAnchor="middle" fill={C.lblSmFill}>Sensor US Nivel</text>
        </g>

        {/* ── PIPE: Balsa → Bomba ────────────────────────────────────────── */}
        <line x1="180" y1="200" x2="226" y2="200" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <line x1="196" y1="197" x2="210" y2="200" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <line x1="212" y1="197" x2="224" y2="200" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>

        {/* ── BOMBA ─────────────────────────────────────────────────────── */}
        <g className="scada-hov" onClick={() => setPopup({ visible: true, type: 'pump', id: null })}>
          <circle cx="252" cy="200" r="26" fill={C.pumpBg} stroke={C.pumpStroke} strokeWidth="1.5"/>
          <circle cx="252" cy="200" r="18" fill="none" stroke={state.pump.estado ? C.valOnStroke : C.sigStroke} strokeWidth="1" strokeDasharray={state.pump.estado ? 'none' : '3 2'}/>
          <polygon points="243,195 265,200 243,205" fill={state.pump.estado ? C.impeller : C.sigStroke}/>
          {state.pump.estado && (
            <circle cx="252" cy="200" r="26" fill="none" stroke={C.valOnStroke} strokeWidth="1.5" opacity="0.3" filter="url(#glow)"/>
          )}
          <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'9px',fontWeight:700,letterSpacing:'0.04em'}} x="252" y="236" textAnchor="middle" fill={C.lblSmFill}>BOMBA</text>
          <rect x="231" y="239" width="42" height="13" rx="3" fill={state.pump.estado ? C.valOnBg : C.valOffBg} stroke={state.pump.estado ? C.valOnStroke : C.valOffStroke} strokeWidth="0.8"/>
          <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'8.5px',fontWeight:700}} x="252" y="249" textAnchor="middle" fill={state.pump.estado ? C.valOkTxt : warnTxtClr}>
            {state.pump.estado ? 'ON' : 'OFF'}
          </text>
        </g>

        {/* ── PIPE: Bomba → Colector ─────────────────────────────────────── */}
        <line x1="278" y1="200" x2="348" y2="200" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <line x1="294" y1="197" x2="308" y2="200" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <line x1="322" y1="197" x2="336" y2="200" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>

        {/* ── COLECTOR VERTICAL ─────────────────────────────────────────── */}
        <line x1="348" y1="95" x2="348" y2="375" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <circle cx="348" cy="200" r="8" fill={C.colBg}/>
        <circle cx="348" cy="235" r="8" fill={C.colBg}/>
        <circle cx="348" cy="375" r="8" fill={C.colBg}/>

        {/* ── RAMAL 1 ───────────────────────────────────────────────────── */}
        <line x1="348" y1="95" x2="422" y2="95" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <line x1="366" y1="92" x2="380" y2="95" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <line x1="395" y1="92" x2="409" y2="95" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <ValveSym cx={438} cy={95} open={state.ev1.estado} id="ev1" onClick={() => setPopup({ visible: true, type: 'valve', id: 'ev1' })}/>
        <line x1="452" y1="95" x2="480" y2="95" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <SmallTank x={480} y={60} w={100} h={70} pct={b1Pct} label="Balsa 1" sensorId="b1" cpId="cp-b1-2"/>

        {/* ── RAMAL 2 ───────────────────────────────────────────────────── */}
        <line x1="348" y1="235" x2="422" y2="235" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <line x1="366" y1="232" x2="380" y2="235" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <line x1="395" y1="232" x2="409" y2="235" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <ValveSym cx={438} cy={235} open={state.ev2.estado} id="ev2" onClick={() => setPopup({ visible: true, type: 'valve', id: 'ev2' })}/>
        <line x1="452" y1="235" x2="480" y2="235" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <SmallTank x={480} y={200} w={100} h={70} pct={b2Pct} label="Balsa 2" sensorId="b2" cpId="cp-b2-2"/>

        {/* ── RAMAL 3 ───────────────────────────────────────────────────── */}
        <line x1="348" y1="375" x2="422" y2="375" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <line x1="366" y1="372" x2="380" y2="375" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <line x1="395" y1="372" x2="409" y2="375" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr2)"/>
        <ValveSym cx={438} cy={375} open={state.ev3.estado} id="ev3" onClick={() => setPopup({ visible: true, type: 'valve', id: 'ev3' })}/>
        <line x1="452" y1="375" x2="480" y2="375" stroke={C.pipeStroke} strokeWidth="6" strokeLinecap="round"/>
        <SmallTank x={480} y={340} w={100} h={70} pct={b3Pct} label="Balsa 3" sensorId="b3" cpId="cp-b3-2"/>

        {/* ── LEYENDA ───────────────────────────────────────────────────── */}
        <rect x="40" y="328" width="166" height="104" rx="8" fill={C.legBg} stroke={C.legStroke} strokeWidth="1"/>
        <text style={{fontFamily:'Rajdhani,sans-serif',fontSize:'10px',fontWeight:700,letterSpacing:'0.06em'}} x="52" y="346" fill={C.lblBoldFill}>LEYENDA</text>
        <line x1="52" y1="360" x2="86" y2="360" stroke={C.pipeStroke} strokeWidth="5" strokeLinecap="round"/>
        <text style={{fontFamily:'Inter,sans-serif',fontSize:'9px'}} x="94" y="364" fill={C.lblSmFill}>Tubería de agua</text>
        <line x1="52" y1="376" x2="86" y2="376" stroke={C.sigStroke} strokeWidth="1" strokeDasharray="4 3" strokeLinecap="round"/>
        <text style={{fontFamily:'Inter,sans-serif',fontSize:'9px'}} x="94" y="380" fill={C.lblSmFill}>Señal sensor</text>
        <rect x="52" y="388" width="16" height="11" rx="3" fill={C.valOnBg} stroke={C.valOnStroke} strokeWidth="1"/>
        <text style={{fontFamily:'Inter,sans-serif',fontSize:'9px'}} x="76" y="397" fill={C.lblSmFill}>EV abierta</text>
        <rect x="52" y="404" width="16" height="11" rx="3" fill={C.valOffBg} stroke={C.valOffStroke} strokeWidth="1"/>
        <text style={{fontFamily:'Inter,sans-serif',fontSize:'9px'}} x="76" y="413" fill={C.lblSmFill}>EV cerrada</text>

        {/* Footer text */}
        <text style={{fontFamily:'JetBrains Mono,monospace',fontSize:'7.5px'}} x="40" y="462" fill={C.lblSmFill}>Agrotech DAW 2025 · Sistema distribución hídrica</text>
        {loading && (
          <text style={{fontFamily:'Inter,sans-serif',fontSize:'8px'}} x="660" y="462" textAnchor="end" fill={C.lblSmFill}>● Actualizando…</text>
        )}
      </svg>

      <Modal
        popup={popup}
        state={state}
        sensorData={sensorData}
        onClose={() => setPopup({ visible: false })}
        onPumpToggle={handlePumpToggle}
        onValveToggle={handleValveToggle}
      />
    </div>
  );
}

export const ejemploDatos = {
  mainTank: { distanceCm: 72, maxDistanceCm: 100 },
  tanks: {
    b1: { distanceCm: 45, maxDistanceCm: 100 },
    b2: { distanceCm: 18, maxDistanceCm: 100 },
    b3: { distanceCm: 61, maxDistanceCm: 100 },
  },
  valves: { ev1Open: true, ev2Open: false, ev3Open: true },
};
