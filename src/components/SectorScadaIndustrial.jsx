import React, { useEffect, useMemo, useState } from 'react';
import { sensorService, modoHumedadService } from '../api/apiservice.jsx';

// ─── IDs de sensores por sector ───────────────────────────────────────────────
const LEVEL_SENSOR_BY_SECTOR = { 2: 6, 3: 7, 4: 8 };
const SCADA_IDS_BY_SECTOR = {
  2: { pump: 9, flow: 12, pressure: 13, valveA: 10, humidityA: 14, valveB: 11, humidityB: 15 },
  3: { pump: 16, flow: 19, pressure: 20, valveA: 17, humidityA: 21, valveB: 18, humidityB: 22 },
  4: { pump: 23, flow: 26, pressure: 27, valveA: 24, humidityA: 28, valveB: 25, humidityB: 29 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const isOn = e => e === 'ACTIVO' || e === 'on' || e === true;
const fmt = (v, d = 2, s = '') => (v == null || isNaN(Number(v))) ? `N/A${s ? ' ' + s : ''}` : `${Number(v).toFixed(d)}${s ? ' ' + s : ''}`;

async function safeGet(fn) { try { return await fn(); } catch { return null; } }

// ─── Config de popups ─────────────────────────────────────────────────────────
const SENSOR_CFG = {
  tank: { title: 'Sensor Nivel Balsa', unit: 'cm', digits: 2, icon: '📡', color: '#a78bfa' },
  flow: { title: 'Sensor Caudal', unit: 'L/min', digits: 2, icon: '🌊', color: '#34d399' },
  pressure: { title: 'Sensor Presión', unit: 'bar', digits: 2, icon: '🔵', color: '#60a5fa' },
  humidityA: { title: 'Humedad Ramal 1', unit: '%', digits: 2, icon: '💧', color: '#60a5fa' },
  humidityB: { title: 'Humedad Ramal 2', unit: '%', digits: 2, icon: '💧', color: '#60a5fa' },
};
const ACTUATOR_CFG = {
  pump: { title: 'Bomba Centrífuga', onLabel: 'EN MARCHA', offLabel: 'PARADA', actionOn: 'Arrancar', actionOff: 'Parar', icon: '⚙️', color: '#38bdf8' },
  valveA: { title: 'Electroválvula EV-1', onLabel: 'ABIERTA', offLabel: 'CERRADA', actionOn: 'Abrir', actionOff: 'Cerrar', icon: '🔧', color: '#f472b6' },
  valveB: { title: 'Electroválvula EV-2', onLabel: 'ABIERTA', offLabel: 'CERRADA', actionOn: 'Abrir', actionOff: 'Cerrar', icon: '🔧', color: '#f472b6' },
};

// ─── Modal profesional ────────────────────────────────────────────────────────
function ScadaModal({ popup, reading, actuatorState, sensor, onClose, onToggle, actionLoading }) {
  const isSensor = !!SENSOR_CFG[popup.nodeKey];
  const isActuator = !!ACTUATOR_CFG[popup.nodeKey];
  const cfg = SENSOR_CFG[popup.nodeKey] || ACTUATOR_CFG[popup.nodeKey];
  const accent = cfg?.color || '#34d399';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'modalBgIn 0.2s ease both',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes modalBgIn  { from{opacity:0} to{opacity:1} }
        @keyframes modalBoxIn { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
      `}</style>

      <div
        style={{
          background: 'linear-gradient(145deg, #0d1b2e 0%, #0f2040 100%)',
          border: `1px solid ${accent}35`,
          borderRadius: 18,
          padding: '1.6rem',
          width: 320,
          maxWidth: '90vw',
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accent}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
          animation: 'modalBoxIn 0.25s cubic-bezier(0.4,0,0.2,1) both',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 120, height: 120,
          background: `radial-gradient(ellipse at 100% 0%, ${accent}20 0%, transparent 70%)`,
          pointerEvents: 'none', borderRadius: '0 18px 0 0',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${accent}18`, border: `1px solid ${accent}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>
              {cfg?.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Inter',sans-serif" }}>
                {cfg?.title || 'Componente SCADA'}
              </div>
              {sensor?.nombre && (
                <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 1 }}>{sensor.nombre}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >✕</button>
        </div>

        {/* ── SENSOR ─────────────────────────────────────────────────────── */}
        {isSensor && (
          <>
            <div style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${accent}25`,
              borderRadius: 12,
              marginBottom: '1rem',
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                  Última lectura
                </div>
                <span style={{
                  fontSize: '2rem', fontWeight: 700,
                  color: accent,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {fmt(reading, SENSOR_CFG[popup.nodeKey].digits)}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: 6 }}>
                  {SENSOR_CFG[popup.nodeKey].unit}
                </span>
              </div>
              {reading != null && (
                <div style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#34d399',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  padding: '3px 8px', borderRadius: 6,
                }}>✓ OK</div>
              )}
            </div>
            <SensorDataRows sensor={sensor} />
          </>
        )}

        {/* ── ACTUADOR ───────────────────────────────────────────────────── */}
        {isActuator && (() => {
          const actCfg = ACTUATOR_CFG[popup.nodeKey];
          const on = actuatorState;
          return (
            <>
              {/* Estado actual */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                background: on ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${on ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}`,
                borderRadius: 12, marginBottom: '1rem',
              }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Estado actual</span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.06em',
                  color: on ? '#34d399' : '#f87171',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {on == null ? '—' : on ? actCfg.onLabel : actCfg.offLabel}
                </span>
              </div>

              {/* MQTT */}
              {sensor?.topicMQTT && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                    Topic MQTT
                  </div>
                  <code style={{
                    display: 'block', fontSize: '0.72rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.4rem 0.7rem', borderRadius: 7, color: '#94a3b8',
                    fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all',
                  }}>
                    {sensor.topicMQTT}
                  </code>
                </div>
              )}

              {/* Botones control */}
              <div style={{ display: 'flex', gap: 10 }}>
                <CtrlButton
                  label={actCfg.actionOn}
                  active={on === true}
                  color="#34d399"
                  disabled={actionLoading}
                  onClick={() => onToggle(true)}
                />
                <CtrlButton
                  label={actCfg.actionOff}
                  active={on === false}
                  color="#f87171"
                  disabled={actionLoading}
                  onClick={() => onToggle(false)}
                />
              </div>
              {actionLoading && (
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #34d399',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

function SensorDataRows({ sensor }) {
  if (!sensor) return null;
  const rows = [
    { label: 'Tipo', value: sensor.tipo },
    { label: 'Ubicación', value: sensor.ubicacion },
    { label: 'Topic MQTT', value: sensor.topicMQTT, mono: true },
  ].filter(r => r.value);
  if (!rows.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map(r => (
        <div key={r.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>{r.label}</span>
          {r.mono
            ? <code style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 5, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace", maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</code>
            : <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>{r.value}</span>
          }
        </div>
      ))}
    </div>
  );
}

function CtrlButton({ label, active, color, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, padding: '0.6rem',
        background: active ? `${color}20` : 'transparent',
        border: `1.5px solid ${active ? color : color + '40'}`,
        borderRadius: 10,
        color: active ? color : color + 'aa',
        fontSize: '0.8rem', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

// ─── Nodos SVG del SCADA ──────────────────────────────────────────────────────
// Colores del tema oscuro profesional
const T = {
  bg: '#060d1a',
  tankBg: '#0a1628',
  tankStroke: '#1e3a5f',
  waterFill: 'rgba(61,142,240,0.5)',
  waterShine: 'rgba(144,202,255,0.15)',
  pipe: '#2563eb',
  pipeGlow: 'rgba(37,99,235,0.4)',
  sensorBg: '#0d2040',
  sensorStroke: '#3d8ef0',
  sigStroke: '#1e3a5f',
  cardBg: '#0b1e38',
  cardStroke: '#1e3a5f',
  labelMain: '#94a3b8',
  labelBold: '#e2e8f0',
  labelSmall: '#3a4f6a',
  valOnBg: 'rgba(52,211,153,0.12)',
  valOnStroke: '#34d399',
  valOnTxt: '#34d399',
  valOffBg: 'rgba(239,68,68,0.1)',
  valOffStroke: '#f87171',
  valOffTxt: '#f87171',
  pumpOnFill: '#3d8ef0',
  pumpOffFill: '#2a3a58',
  warnAmber: '#f59e0b',
  okGreen: '#34d399',
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function SectorScadaIndustrial({ sector }) {
  const sectorId = Number(sector?.id);

  const [loading, setLoading] = useState(true);
  const [scada, setScada] = useState({ tankLevel: null, pumpOn: null, flow: null, pressure: null, valveAOn: null, humidityA: null, valveBOn: null, humidityB: null });
  const [sensorInfo, setSensorInfo] = useState({ tank: null, pump: null, flow: null, pressure: null, valveA: null, humidityA: null, valveB: null, humidityB: null });
  const [popup, setPopup] = useState({ visible: false, nodeKey: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [modoHumedad, setModoHumedad] = useState(null);

  const ids = useMemo(() => ({
    level: LEVEL_SENSOR_BY_SECTOR[sectorId],
    ...(SCADA_IDS_BY_SECTOR[sectorId] || {}),
  }), [sectorId]);

  const nodeSensorIds = useMemo(() => ({
    tank: ids.level, pump: ids.pump, flow: ids.flow, pressure: ids.pressure,
    valveA: ids.valveA, humidityA: ids.humidityA, valveB: ids.valveB, humidityB: ids.humidityB,
  }), [ids]);

  useEffect(() => {
    modoHumedadService.obtenerModo().then(setModoHumedad).catch(() => setModoHumedad(null));
  }, []);

  const toggleModoHumedad = async () => {
    const nuevo = !modoHumedad;
    try {
      await modoHumedadService.cambiarModo(nuevo);
      setModoHumedad(nuevo);
    } catch (e) {
      console.error('Error cambiando modo humedad:', e);
    }
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const [tS, lR, pS, fS, fR, prS, prR, vaS, haS, haR, vbS, hbS, hbR] = await Promise.all([
        safeGet(() => sensorService.getSensorById(ids.level)),
        safeGet(() => sensorService.getLastSensorReading(ids.level).then(r => r?.valor)),

        safeGet(() => sensorService.getSensorById(ids.pump)),

        safeGet(() => sensorService.getSensorById(ids.flow)),
        safeGet(() => sensorService.getLastSensorReading(ids.flow).then(r => r?.valor)),

        safeGet(() => sensorService.getSensorById(ids.pressure)),
        safeGet(() => sensorService.getLastSensorReading(ids.pressure).then(r => r?.valor)),

        safeGet(() => sensorService.getSensorById(ids.valveA)),

        safeGet(() => sensorService.getSensorById(ids.humidityA)),
        safeGet(() => sensorService.getLastSensorReading(ids.humidityA).then(r => r?.valor)),

        safeGet(() => sensorService.getSensorById(ids.valveB)),

        safeGet(() => sensorService.getSensorById(ids.humidityB)),
        safeGet(() => sensorService.getLastSensorReading(ids.humidityB).then(r => r?.valor)),
      ]);
      if (!alive) return;
      setScada({ tankLevel: lR, pumpOn: pS ? isOn(pS.estado) : null, flow: fR, pressure: prR, valveAOn: vaS ? isOn(vaS.estado) : null, humidityA: haR, valveBOn: vbS ? isOn(vbS.estado) : null, humidityB: hbR });
      setSensorInfo({ tank: tS, pump: pS, flow: fS, pressure: prS, valveA: vaS, humidityA: haS, valveB: vbS, humidityB: hbS });
      setLoading(false);
      setLastUpdate(new Date());
    };
    load();
    const iv = setInterval(load, 10000);
    return () => { alive = false; clearInterval(iv); };
  }, [ids]);

  const tankPct = clamp(((scada.tankLevel ?? 0) / 100) * 100, 0, 100);
  const openPopup = (k) => setPopup({ visible: true, nodeKey: k });
  const closePopup = () => setPopup({ visible: false, nodeKey: null });

  const readingByNode = { tank: scada.tankLevel, flow: scada.flow, pressure: scada.pressure, humidityA: scada.humidityA, humidityB: scada.humidityB };
  const actuatorState = { pump: scada.pumpOn, valveA: scada.valveAOn, valveB: scada.valveBOn };

  /*
  const handleToggle = async (val) => {
    if (!popup.nodeKey) return;
    const sid = nodeSensorIds[popup.nodeKey];
    if (!sid) return;
    try {
      setActionLoading(true);
      const estado = val ? 'ACTIVO' : 'INACTIVO';
      await sensorService.updateActuadorState(sid, estado);
      setScada(p => popup.nodeKey === 'pump' ? { ...p, pumpOn: val } : popup.nodeKey === 'valveA' ? { ...p, valveAOn: val } : { ...p, valveBOn: val });
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };
  */

  const levelColor = (pct) => pct < 25 ? T.warnAmber : T.okGreen;
  const valveBg = (on) => on ? T.valOnBg : T.valOffBg;
  const valveSt = (on) => on ? T.valOnStroke : T.valOffStroke;
  const valveTxt = (on) => on ? T.valOnTxt : T.valOffTxt;

  const lc = levelColor(tankPct);
  const tankH = 180;
  const waterH = Math.max(0, (tankH - 2) * tankPct / 100);
  const waterY = 125 + 1 + (tankH - 2) * (1 - tankPct / 100);

  const actuatorNodeKeys = ['pump', 'valveA', 'valveB'];


  const applyAutomationActions = (actions = []) => {
    const keyBySensorId = actuatorNodeKeys.reduce((acc, key) => {
      const id = nodeSensorIds[key];
      if (id) acc[id] = key;
      return acc;
    }, {});

    setScada((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        const nodeKey = keyBySensorId[action.id];
        if (!nodeKey) return;
        const on = isOn(action.estado);
        if (nodeKey === 'pump') next.pumpOn = on;
        if (nodeKey === 'valveA') next.valveAOn = on;
        if (nodeKey === 'valveB') next.valveBOn = on;
      });
      return next;
    });

    setSensorInfo((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        const nodeKey = keyBySensorId[action.id];
        if (!nodeKey || !next[nodeKey]) return;
        next[nodeKey] = { ...next[nodeKey], estado: action.estado };
      });
      return next;
    });
  };

  const handleActuatorToggle = async (newValue) => {
    if (!popup.nodeKey) return;

    const sensorId = nodeSensorIds[popup.nodeKey];
    if (!sensorId) return;

    try {
      setActionLoading(true);
      const targetState = newValue ? 'ACTIVO' : 'INACTIVO';
      const decision = await sensorService.decideEstadoActuador(sensorId, targetState);

      if (!decision?.permiso) {
        window.alert(decision?.motivo || 'Accion no permitida por reglas de automatizacion');
        return;
      }

      applyAutomationActions(decision.accion || []);
      setPopup({ visible: false, nodeKey: null });
    } catch (error) {
      const motivo = error?.response?.data?.motivo;
      if (motivo) {
        window.alert(motivo);
      } else {
        console.error('Error actualizando actuador:', error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Inter:wght@500;600;700&display=swap');
        .sc-hov { cursor: pointer; transition: opacity 0.18s; }
        .sc-hov:hover { opacity: 0.82; }
        @keyframes flowMove {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -18; }
        }
        @keyframes pumpSpin {
          from { transform-origin: 275px 216px; transform: rotate(0deg); }
          to   { transform-origin: 275px 216px; transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.9; }
        }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .pipe-animated {
          stroke-dasharray: 8 4;
          animation: flowMove 0.7s linear infinite;
        }
        .pump-spin {
          animation: pumpSpin 1.2s linear infinite;
        }
        .glow-pulse {
          animation: glowPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* ── Barra superior ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '1rem', animation: 'fadeInUp 0.4s ease both',
      }}>
        <div style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <span style={{
              fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.12em',
              color: '#60a5fa', textTransform: 'uppercase',
              background: '#60a5fa18', border: '1px solid #60a5fa30',
              padding: '2px 8px', borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace",
            }}>SCADA</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              {sector?.nombre || 'Sector'}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', marginLeft: 2 }}>
            Visualización en tiempo real · Actualización cada 10 s
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Botón modo riego automático por humedad */}
          <button
            onClick={toggleModoHumedad}
            disabled={modoHumedad === null}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.28rem 0.85rem',
              background: modoHumedad ? 'rgba(52,211,153,0.08)' : 'rgba(251,146,60,0.08)',
              border: modoHumedad ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(251,146,60,0.3)',
              borderRadius: 20,
              cursor: modoHumedad === null ? 'default' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: modoHumedad ? '#34d399' : '#fb923c',
              animation: modoHumedad ? 'glowPulse 2s infinite' : 'none',
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.7rem',
              color: modoHumedad ? '#34d399' : '#fb923c',
              fontWeight: 700, letterSpacing: '0.04em',
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: 'nowrap',
            }}>
              {modoHumedad === null ? 'CARGANDO...' : modoHumedad ? 'RIEGO AUTO: ON' : 'RIEGO AUTO: OFF'}
            </span>
          </button>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                border: '1.5px solid rgba(61,142,240,0.3)', borderTop: '1.5px solid #3d8ef0',
                borderRadius: '50%', animation: 'pumpSpin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: '0.7rem', color: '#3d8ef0', fontWeight: 600 }}>Actualizando</span>
            </div>
          )}
          {!loading && lastUpdate && (
            <span style={{ fontSize: '0.68rem', color: '#3a4f6a', fontFamily: "'JetBrains Mono',monospace" }}>
              ● {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ── SVG SCADA ──────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #070f1e 0%, #0a1628 100%)',
        border: '1px solid rgba(37,99,235,0.2)',
        borderRadius: 14,
        overflow: 'hidden',
        padding: '0.5rem',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)',
        animation: 'fadeInUp 0.5s 0.1s ease both',
      }}>
        <svg width="100%" viewBox="0 0 980 440" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id={`cp-stank-${sectorId}`}><rect x="40" y="125" width="140" height={tankH} rx="6" /></clipPath>
            <linearGradient id={`water-grad-${sectorId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id={`tank-grad-${sectorId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="#0d1e38" />
            </linearGradient>
            <filter id={`glow-${sectorId}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <marker id={`arr-${sectorId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={T.pipe} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* ── FONDO GRID sutil ─────────────────────────────────────────── */}
          <defs>
            <pattern id={`grid-${sectorId}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(37,99,235,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="980" height="440" fill={`url(#grid-${sectorId})`} />

          {/* ── BALSA (tanque) ────────────────────────────────────────────── */}
          <g className="sc-hov" onClick={() => openPopup('tank')}>
            {/* Sombra/glow */}
            <rect x="36" y="121" width="148" height={tankH + 8} rx="8" fill="rgba(37,99,235,0.08)" filter={`url(#glow-${sectorId})`} />
            {/* Cuerpo */}
            <rect x="40" y="125" width="140" height={tankH} rx="6" fill={`url(#tank-grad-${sectorId})`} stroke={T.tankStroke} strokeWidth="1.5" />
            {/* Agua */}
            {tankPct > 0 && (
              <rect x="41" y={waterY} width="138" height={waterH} fill={`url(#water-grad-${sectorId})`} clipPath={`url(#cp-stank-${sectorId})`} />
            )}
            {/* Reflejo agua */}
            {tankPct > 5 && (
              <rect x="48" y={waterY + 3} width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
            )}
            {/* Borde */}
            <rect x="40" y="125" width="140" height={tankH} rx="6" fill="none" stroke={T.tankStroke} strokeWidth="1.5" />
            {/* Stripes laterales decorativas */}
            <line x1="40" y1="145" x2="180" y2="145" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="40" y1="165" x2="180" y2="165" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </g>

          {/* Etiqueta balsa */}
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }} x="110" y="320" textAnchor="middle" fill={T.labelBold}>
            BALSA {sector?.nombre?.toUpperCase() || ''}
          </text>
          <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '9px', fontWeight: 700 }} x="110" y="334" textAnchor="middle" fill={lc}>
            {tankPct.toFixed(0)}%
          </text>

          {/* Sensor nivel → badge */}
          <g className="sc-hov" onClick={() => openPopup('tank')}>
            <line x1="110" y1="125" x2="110" y2="98" stroke={T.sigStroke} strokeWidth="1" strokeDasharray="3 2" />
            {/* Icono sensor US */}
            <polygon points="104,82 116,82 113,96 107,96" fill={T.sensorBg} stroke={T.sensorStroke} strokeWidth="1.2" />
            <path d="M106,99 Q110,104 114,99" fill="none" stroke={T.pipe} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M103,103 Q110,109 117,103" fill="none" stroke={T.pipe} strokeWidth="0.7" strokeLinecap="round" opacity="0.4" />
            <line x1="110" y1="82" x2="110" y2="58" stroke={T.sigStroke} strokeWidth="1" strokeDasharray="3 2" />
            {/* Valor */}
            <rect x="70" y="40" width="80" height="20" rx="5" fill={tankPct < 25 ? T.valOffBg : T.valOnBg} stroke={tankPct < 25 ? T.valOffStroke : T.valOnStroke} strokeWidth="0.8" />
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '9px', fontWeight: 700 }} x="110" y="54" textAnchor="middle" fill={lc}>
              {fmt(scada.tankLevel, 1, 'cm')}
            </text>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px' }} x="110" y="30" textAnchor="middle" fill={T.labelSmall}>Sensor US Nivel</text>
          </g>

          {/* ── TUBERÍA: balsa → bomba ────────────────────────────────────── */}
          <line x1="180" y1="216" x2="250" y2="216" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.pumpOn && (
            <line x1="180" y1="216" x2="250" y2="216" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* ── BOMBA ─────────────────────────────────────────────────────── */}
          <g className="sc-hov" onClick={() => openPopup('pump')}>
            {scada.pumpOn && (
              <circle cx="275" cy="216" r="30" fill="none" stroke={T.valOnStroke} strokeWidth="1.5" opacity="0.3" className="glow-pulse" />
            )}
            <circle cx="275" cy="216" r="26" fill={T.tankBg} stroke={scada.pumpOn ? T.valOnStroke : T.tankStroke} strokeWidth="1.5" />
            <circle cx="275" cy="216" r="18" fill="none" stroke={scada.pumpOn ? T.pumpOnFill : T.labelSmall} strokeWidth="1" strokeDasharray={scada.pumpOn ? 'none' : '3 2'} />
            <g className={scada.pumpOn ? 'pump-spin' : ''}>
              <polygon points="266,210 288,216 266,222" fill={scada.pumpOn ? T.pumpOnFill : T.pumpOffFill} />
            </g>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }} x="275" y="250" textAnchor="middle" fill={T.labelSmall}>BOMBA</text>
            <rect x="253" y="253" width="44" height="14" rx="4" fill={valveBg(scada.pumpOn)} stroke={valveSt(scada.pumpOn)} strokeWidth="0.8" />
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '8px', fontWeight: 700 }} x="275" y="263" textAnchor="middle" fill={valveTxt(scada.pumpOn)}>
              {scada.pumpOn == null ? 'N/A' : scada.pumpOn ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ── TUBERÍA: bomba → caudal ───────────────────────────────────── */}
          <line x1="301" y1="216" x2="390" y2="216" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.pumpOn && (
            <line x1="301" y1="216" x2="390" y2="216" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* ── SENSOR CAUDAL ─────────────────────────────────────────────── */}
          <g className="sc-hov" onClick={() => openPopup('flow')}>
            <rect x="390" y="186" width="96" height="60" rx="10" fill={T.cardBg} stroke={T.cardStroke} strokeWidth="1.2" />
            <rect x="391" y="187" width="94" height="14" rx="9 9 0 0" fill="rgba(37,99,235,0.15)" />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px', fontWeight: 600, letterSpacing: '0.04em' }} x="438" y="197" textAnchor="middle" fill={T.labelMain}>CAUDAL</text>
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px', fontWeight: 700 }} x="438" y="222" textAnchor="middle" fill={T.okGreen}>
              {fmt(scada.flow, 1)}
            </text>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px' }} x="438" y="236" textAnchor="middle" fill={T.labelSmall}>L/min</text>
          </g>

          {/* ── TUBERÍA: caudal → presión ─────────────────────────────────── */}
          <line x1="486" y1="216" x2="572" y2="216" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.pumpOn && (
            <line x1="486" y1="216" x2="572" y2="216" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* ── SENSOR PRESIÓN ────────────────────────────────────────────── */}
          <g className="sc-hov" onClick={() => openPopup('pressure')}>
            <rect x="572" y="186" width="96" height="60" rx="10" fill={T.cardBg} stroke={T.cardStroke} strokeWidth="1.2" />
            <rect x="573" y="187" width="94" height="14" rx="9 9 0 0" fill="rgba(37,99,235,0.15)" />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px', fontWeight: 600, letterSpacing: '0.04em' }} x="620" y="197" textAnchor="middle" fill={T.labelMain}>PRESIÓN</text>
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px', fontWeight: 700 }} x="620" y="222" textAnchor="middle" fill="#60a5fa">
              {fmt(scada.pressure, 2)}
            </text>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px' }} x="620" y="236" textAnchor="middle" fill={T.labelSmall}>bar</text>
          </g>

          {/* ── TUBERÍA: presión → colector ───────────────────────────────── */}
          <line x1="668" y1="216" x2="740" y2="216" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.pumpOn && (
            <line x1="668" y1="216" x2="740" y2="216" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* ── COLECTOR VERTICAL ─────────────────────────────────────────── */}
          <line x1="740" y1="110" x2="740" y2="330" stroke={T.pipe} strokeWidth="7" strokeLinecap="round" />
          <circle cx="740" cy="216" r="9" fill={T.pipe} />

          {/* Indicadores de ramal */}
          <circle cx="740" cy="130" r="6" fill={T.pipe} opacity="0.7" />
          <circle cx="740" cy="310" r="6" fill={T.pipe} opacity="0.7" />

          {/* ── RAMAL A (superior) ────────────────────────────────────────── */}
          <line x1="740" y1="130" x2="820" y2="130" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.valveAOn && (
            <line x1="740" y1="130" x2="820" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* Válvula A */}
          <g className="sc-hov" onClick={() => openPopup('valveA')}>
            <rect x="822" y="116" width="32" height="28" rx="7" fill={valveBg(scada.valveAOn)} stroke={valveSt(scada.valveAOn)} strokeWidth="1.3" />
            <line x1="829" y1="120" x2="847" y2="136" stroke={valveSt(scada.valveAOn)} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="847" y1="120" x2="829" y2="136" stroke={valveSt(scada.valveAOn)} strokeWidth="1.8" strokeLinecap="round" />
            <rect x="832" y="107" width="12" height="10" rx="2" fill={valveSt(scada.valveAOn)} />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px', fontWeight: 700 }} x="838" y="152" textAnchor="middle" fill={T.labelSmall}>EV-1</text>
            <rect x="818" y="155" width="40" height="12" rx="4" fill={valveBg(scada.valveAOn)} stroke={valveSt(scada.valveAOn)} strokeWidth="0.8" />
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '7.5px', fontWeight: 700 }} x="838" y="164" textAnchor="middle" fill={valveTxt(scada.valveAOn)}>
              {scada.valveAOn == null ? 'N/A' : scada.valveAOn ? 'ABIERTA' : 'CERRADA'}
            </text>
          </g>

          {/* Tubería post válvula A */}
          <line x1="854" y1="130" x2="888" y2="130" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />

          {/* Sensor humedad A */}
          <g className="sc-hov" onClick={() => openPopup('humidityA')}>
            <rect x="888" y="100" width="82" height="60" rx="10" fill={T.cardBg} stroke={T.cardStroke} strokeWidth="1.2" />
            <rect x="889" y="101" width="80" height="14" rx="9 9 0 0" fill="rgba(96,165,250,0.12)" />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px', fontWeight: 600, letterSpacing: '0.04em' }} x="929" y="111" textAnchor="middle" fill={T.labelMain}>HUMEDAD 1</text>
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px', fontWeight: 700 }} x="929" y="136" textAnchor="middle"
              fill={scada.humidityA != null && scada.humidityA < 30 ? T.warnAmber : T.okGreen}>
              {fmt(scada.humidityA, 1)}
            </text>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px' }} x="929" y="150" textAnchor="middle" fill={T.labelSmall}>%</text>
          </g>

          {/* ── RAMAL B (inferior) ────────────────────────────────────────── */}
          <line x1="740" y1="310" x2="820" y2="310" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />
          {scada.valveBOn && (
            <line x1="740" y1="310" x2="820" y2="310" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" className="pipe-animated" />
          )}

          {/* Válvula B */}
          <g className="sc-hov" onClick={() => openPopup('valveB')}>
            <rect x="822" y="296" width="32" height="28" rx="7" fill={valveBg(scada.valveBOn)} stroke={valveSt(scada.valveBOn)} strokeWidth="1.3" />
            <line x1="829" y1="300" x2="847" y2="316" stroke={valveSt(scada.valveBOn)} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="847" y1="300" x2="829" y2="316" stroke={valveSt(scada.valveBOn)} strokeWidth="1.8" strokeLinecap="round" />
            <rect x="832" y="287" width="12" height="10" rx="2" fill={valveSt(scada.valveBOn)} />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px', fontWeight: 700 }} x="838" y="332" textAnchor="middle" fill={T.labelSmall}>EV-2</text>
            <rect x="818" y="335" width="40" height="12" rx="4" fill={valveBg(scada.valveBOn)} stroke={valveSt(scada.valveBOn)} strokeWidth="0.8" />
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '7.5px', fontWeight: 700 }} x="838" y="344" textAnchor="middle" fill={valveTxt(scada.valveBOn)}>
              {scada.valveBOn == null ? 'N/A' : scada.valveBOn ? 'ABIERTA' : 'CERRADA'}
            </text>
          </g>

          {/* Tubería post válvula B */}
          <line x1="854" y1="310" x2="888" y2="310" stroke={T.pipe} strokeWidth="6" strokeLinecap="round" />

          {/* Sensor humedad B */}
          <g className="sc-hov" onClick={() => openPopup('humidityB')}>
            <rect x="888" y="280" width="82" height="60" rx="10" fill={T.cardBg} stroke={T.cardStroke} strokeWidth="1.2" />
            <rect x="889" y="281" width="80" height="14" rx="9 9 0 0" fill="rgba(96,165,250,0.12)" />
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px', fontWeight: 600, letterSpacing: '0.04em' }} x="929" y="291" textAnchor="middle" fill={T.labelMain}>HUMEDAD 2</text>
            <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px', fontWeight: 700 }} x="929" y="316" textAnchor="middle"
              fill={scada.humidityB != null && scada.humidityB < 30 ? T.warnAmber : T.okGreen}>
              {fmt(scada.humidityB, 1)}
            </text>
            <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px' }} x="929" y="330" textAnchor="middle" fill={T.labelSmall}>%</text>
          </g>

          {/* ── LEYENDA ───────────────────────────────────────────────────── */}
          <rect x="42" y="348" width="156" height="80" rx="8" fill="rgba(10,22,40,0.8)" stroke="rgba(37,99,235,0.15)" strokeWidth="1" />
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em' }} x="54" y="364" fill={T.labelSmall}>LEYENDA</text>
          <line x1="54" y1="374" x2="84" y2="374" stroke={T.pipe} strokeWidth="5" strokeLinecap="round" />
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px' }} x="92" y="378" fill={T.labelSmall}>Tubería</text>
          <line x1="54" y1="389" x2="84" y2="389" stroke={T.sigStroke} strokeWidth="1" strokeDasharray="4 3" strokeLinecap="round" />
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px' }} x="92" y="393" fill={T.labelSmall}>Señal sensor</text>
          <rect x="54" y="400" width="14" height="10" rx="3" fill={T.valOnBg} stroke={T.valOnStroke} strokeWidth="1" />
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px' }} x="76" y="408" fill={T.labelSmall}>Válvula abierta</text>
          <rect x="54" y="413" width="14" height="10" rx="3" fill={T.valOffBg} stroke={T.valOffStroke} strokeWidth="1" />
          <text style={{ fontFamily: 'Inter,sans-serif', fontSize: '7.5px' }} x="76" y="421" fill={T.labelSmall}>Válvula cerrada</text>

          {/* Footer */}
          <text style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '7px' }} x="44" y="434" fill={T.labelSmall}>
            Agrotech IoT · Sistema SCADA · Actualización 10s
          </text>
        </svg>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {popup.visible && (
        <ScadaModal
          popup={popup}
          reading={readingByNode[popup.nodeKey]}
          actuatorState={actuatorState[popup.nodeKey]}
          sensor={sensorInfo[popup.nodeKey]}
          onClose={closePopup}
          onToggle={handleActuatorToggle}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}