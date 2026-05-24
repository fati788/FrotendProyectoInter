import React, { useState, useEffect } from 'react';
import { sensorService } from '../api/apiservice.jsx';
import { useTheme } from '../App.js';

const clamp   = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const pctFrom = (cm, max)   => (!cm || !max || max<=0) ? 0 : clamp((cm/max)*100, 0, 100);

// ─── Helpers modal ─────────────────────────────────────────────────────────────
function MqttBadge({ topic }) {
  return (
    <div style={{ marginBottom:'0.6rem' }}>
      <div style={{ fontSize:'0.65rem', color:'#2a3f5f', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700, marginBottom:4 }}>Topic MQTT</div>
      <code style={{ display:'block', fontSize:'0.72rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', padding:'0.4rem 0.7rem', borderRadius:7, color:'#64748b', fontFamily:"'JetBrains Mono',monospace", wordBreak:'break-all' }}>
        {topic}
      </code>
    </div>
  );
}

function CtrlBtn({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'0.65rem',
      background: active ? `${color}20` : 'transparent',
      border:`1.5px solid ${active ? color : color+'50'}`,
      borderRadius:11, color: active ? color : color+'99',
      fontSize:'0.82rem', fontWeight:700, cursor:'pointer',
      transition:'all 0.2s', fontFamily:"'Inter',sans-serif",
    }}>{label}</button>
  );
}

// ─── Modal premium ─────────────────────────────────────────────────────────────
function Modal({ popup, state, sensorData, onClose, onPumpToggle, onValveToggle }) {
  if (!popup.visible) return null;

  const tankName = { bp:'Balsa Principal', b1:'Balsa 1', b2:'Balsa 2', b3:'Balsa 3' };
  const valveLabels = { ev1:'Electroválvula EV-1', ev2:'Electroválvula EV-2', ev3:'Electroválvula EV-3' };
  const getSensor   = (id) => id==='bp' ? sensorData.mainTank : sensorData.tanks[id];
  const isValveOn   = popup.id ? state[popup.id]?.estado : false;
  const accent = popup.type==='pump'?'#38bdf8':popup.type==='valve'?'#f472b6':'#a78bfa';

  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'bgFI 0.2s ease both' }} onClick={onClose}>
      <style>{`
        @keyframes bgFI   { from{opacity:0} to{opacity:1} }
        @keyframes boxSI  { from{opacity:0;transform:scale(0.91) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spinM  { to{transform:rotate(360deg)} }
      `}</style>
      <div style={{ background:'linear-gradient(145deg,#0b1829,#0d2040)',border:`1px solid ${accent}35`,borderRadius:20,padding:'1.6rem',width:340,maxWidth:'92vw',boxShadow:`0 28px 70px rgba(0,0,0,0.65),0 0 0 1px ${accent}20,inset 0 1px 0 rgba(255,255,255,0.05)`,animation:'boxSI 0.26s cubic-bezier(.4,0,.2,1) both',position:'relative',overflow:'hidden' }} onClick={e=>e.stopPropagation()}>

        {/* Corner glow */}
        <div style={{ position:'absolute',top:0,right:0,width:130,height:130,background:`radial-gradient(ellipse at 100% 0%,${accent}18 0%,transparent 70%)`,pointerEvents:'none' }}/>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:`${accent}15`,border:`1.5px solid ${accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>
              {popup.type==='pump'?'⚙️':popup.type==='valve'?'🔧':'📡'}
            </div>
            <div>
              <div style={{ fontSize:'0.92rem',fontWeight:700,color:'#f1f5f9',fontFamily:"'Inter',sans-serif" }}>
                {popup.type==='pump'  && 'Bomba Centrífuga'}
                {popup.type==='valve' && (valveLabels[popup.id]||'Electroválvula')}
                {popup.type==='sensor'&& `Sensor Nivel — ${tankName[popup.id]||'Balsa'}`}
              </div>
              <div style={{ fontSize:'0.68rem',color:'#2a3f5f',marginTop:1,fontFamily:"'JetBrains Mono',monospace" }}>
                {popup.type==='pump'  && 'Actuador · Sistema impulsión'}
                {popup.type==='valve' && 'Actuador · Control de riego'}
                {popup.type==='sensor'&& 'Sensor US · Medición nivel'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#475569',cursor:'pointer',fontSize:'0.9rem',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        </div>

        {/* PUMP */}
        {popup.type==='pump' && (<>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.85rem 1rem',background:state.pump.estado?'rgba(56,189,248,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${state.pump.estado?'rgba(56,189,248,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:12,marginBottom:'1rem' }}>
            <span style={{ fontSize:'0.78rem',color:'#64748b',fontWeight:600 }}>Estado</span>
            <span style={{ fontSize:'0.82rem',fontWeight:800,letterSpacing:'0.06em',color:state.pump.estado?'#38bdf8':'#f87171',fontFamily:"'JetBrains Mono',monospace" }}>
              {state.pump.estado?'▶ EN MARCHA':'■ PARADA'}
            </span>
          </div>
          {state.pump.topicMQTT && <MqttBadge topic={state.pump.topicMQTT}/>}
          <div style={{ display:'flex',gap:10,marginTop:'1rem' }}>
            <CtrlBtn label="Arrancar" active={state.pump.estado===true}  color="#34d399" onClick={()=>onPumpToggle(true)}/>
            <CtrlBtn label="Parar"    active={state.pump.estado===false} color="#f87171" onClick={()=>onPumpToggle(false)}/>
          </div>
        </>)}

        {/* VALVE */}
        {popup.type==='valve' && popup.id && (<>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.85rem 1rem',background:isValveOn?'rgba(52,211,153,0.08)':'rgba(245,158,11,0.08)',border:`1px solid ${isValveOn?'rgba(52,211,153,0.25)':'rgba(245,158,11,0.25)'}`,borderRadius:12,marginBottom:'1rem' }}>
            <span style={{ fontSize:'0.78rem',color:'#64748b',fontWeight:600 }}>Estado</span>
            <span style={{ fontSize:'0.82rem',fontWeight:800,letterSpacing:'0.06em',color:isValveOn?'#34d399':'#f59e0b',fontFamily:"'JetBrains Mono',monospace" }}>
              {isValveOn?'◆ ABIERTA':'◇ CERRADA'}
            </span>
          </div>
          {state[popup.id]?.topicMQTT && <MqttBadge topic={state[popup.id].topicMQTT}/>}
          <div style={{ display:'flex',gap:10,marginTop:'1rem' }}>
            <CtrlBtn label="Abrir"  active={isValveOn===true}  color="#34d399" onClick={()=>onValveToggle(popup.id,true)}/>
            <CtrlBtn label="Cerrar" active={isValveOn===false} color="#f87171" onClick={()=>onValveToggle(popup.id,false)}/>
          </div>
        </>)}

        {/* SENSOR */}
        {popup.type==='sensor' && popup.id && (()=>{
          const s    = getSensor(popup.id);
          if (!s) return null;
          const cm   = s.distanceCm??0;
          const max  = s.maxDistanceCm??100;
          const pct  = clamp((cm/max)*100,0,100);
          const warn = pct < 25;
          return (<>
            <div style={{ padding:'1rem',background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:12,marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.65rem',color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:6 }}>Nivel actual</div>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'space-between' }}>
                <div>
                  <span style={{ fontSize:'2.2rem',fontWeight:700,color:warn?'#f59e0b':'#a78bfa',fontFamily:"'JetBrains Mono',monospace" }}>{cm}</span>
                  <span style={{ fontSize:'0.9rem',color:'#64748b',marginLeft:6 }}>cm</span>
                </div>
                <span style={{ fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:6,color:warn?'#f59e0b':'#34d399',background:warn?'rgba(245,158,11,0.1)':'rgba(52,211,153,0.1)',border:`1px solid ${warn?'rgba(245,158,11,0.3)':'rgba(52,211,153,0.3)'}` }}>
                  {warn?'⚠ ALERTA':'✓ NORMAL'}
                </span>
              </div>
              <div style={{ height:6,background:'rgba(255,255,255,0.07)',borderRadius:3,marginTop:10,overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:3,background:warn?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#7c3aed,#a78bfa)',width:`${pct}%`,transition:'width 0.5s ease' }}/>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'#2a3f5f',marginTop:4 }}>
                <span>{pct.toFixed(0)}% del máximo</span>
                <span>Máx {max} cm</span>
              </div>
            </div>
            {[{l:'Nombre',v:s.nombre},{l:'Tipo',v:s.tipo},{l:'Ubicación',v:s.ubicacion},{l:'Topic MQTT',v:s.topicMQTT,mono:true}].filter(r=>r.v).map(r=>(
              <div key={r.l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:'0.72rem',color:'#475569',fontWeight:600 }}>{r.l}</span>
                {r.mono
                  ? <code style={{ fontSize:'0.68rem',background:'rgba(255,255,255,0.05)',padding:'2px 7px',borderRadius:5,color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace",maxWidth:190,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.v}</code>
                  : <span style={{ fontSize:'0.78rem',color:'#e2e8f0',fontWeight:600 }}>{r.v}</span>
                }
              </div>
            ))}
          </>);
        })()}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function EsquemaBalsasIndustrial() {
  const { dark } = useTheme();

  const ACTUADORES     = { bomba:1, ev1:2, ev2:3, ev3:4 };
  const SENSORES_NIVEL = { mainTank:7, b1:6, b2:7, b3:8 };

  const [state, setState] = useState({
    pump:{ estado:null, topicMQTT:'' },
    ev1: { estado:null, topicMQTT:'' },
    ev2: { estado:null, topicMQTT:'' },
    ev3: { estado:null, topicMQTT:'' },
  });
  const [sensorData, setSensorData] = useState({
    mainTank:{ distanceCm:0, maxDistanceCm:100 },
    tanks:{ b1:{ distanceCm:0, maxDistanceCm:100 }, b2:{ distanceCm:0, maxDistanceCm:100 }, b3:{ distanceCm:0, maxDistanceCm:100 } },
  });
  const [popup,   setPopup]   = useState({ visible:false, type:'', id:null });
  const [loading, setLoading] = useState(true);
  const [lastTs,  setLastTs]  = useState(null);

  useEffect(() => {
    const fetchAll = () => { loadActuadores(); loadSensores(); };
    fetchAll();
    const iv = setInterval(fetchAll, 10000);
    return () => clearInterval(iv);
  }, []);

  const loadActuadores = async () => {
    try {
      const [bomba,ev1,ev2,ev3] = await Promise.all([
        sensorService.getSensorById(ACTUADORES.bomba),
        sensorService.getSensorById(ACTUADORES.ev1),
        sensorService.getSensorById(ACTUADORES.ev2),
        sensorService.getSensorById(ACTUADORES.ev3),
      ]);
      const on = e => e==='ACTIVO'||e==='on'||e===true;
      setState({
        pump:{ estado:on(bomba.estado), topicMQTT:bomba.topicMQTT||'actuadores/bomba' },
        ev1: { estado:on(ev1.estado),   topicMQTT:ev1.topicMQTT||'actuadores/ev1/cmd' },
        ev2: { estado:on(ev2.estado),   topicMQTT:ev2.topicMQTT||'actuadores/ev2/cmd' },
        ev3: { estado:on(ev3.estado),   topicMQTT:ev3.topicMQTT||'actuadores/ev3/cmd' },
      });
    } catch(e){ console.error('actuadores:',e); }
    finally { setLoading(false); setLastTs(new Date()); }
  };

  const loadSensores = async () => {
    try {
      const [mts,mtr,b1s,b1r,b2s,b2r,b3s,b3r] = await Promise.all([
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
        mainTank:{ ...mts, distanceCm:mtr?.valor??0, maxDistanceCm:100 },
        tanks:{
          b1:{ ...b1s, distanceCm:b1r?.valor??0, maxDistanceCm:100 },
          b2:{ ...b2s, distanceCm:b2r?.valor??0, maxDistanceCm:100 },
          b3:{ ...b3s, distanceCm:b3r?.valor??0, maxDistanceCm:100 },
        },
      });
    } catch(e){ console.error('sensores:',e); }
  };

  const applyAutomationActions = (actions = []) => {
    const keyBySensorId = {
      [ACTUADORES.bomba]: 'pump',
      [ACTUADORES.ev1]: 'ev1',
      [ACTUADORES.ev2]: 'ev2',
      [ACTUADORES.ev3]: 'ev3'
    };

    setState((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        const key = keyBySensorId[action.id];
        if (!key || !next[key]) return;
        next[key] = { ...next[key], estado: action.estado === 'ACTIVO' };
      });
      return next;
    });
  };

  /** 
  const handlePumpToggle = async (val) => {
    try {
      const targetState = newValue ? 'ACTIVO' : 'INACTIVO';
      await sensorService.updateActuadorState(ACTUADORES.bomba, val?'ACTIVO':'INACTIVO');
      setState(s => ({ ...s, pump:{ ...s.pump, estado:val } }));
      setPopup({ visible:false });
    } catch(e){ console.error(e); }
  };
  */

  
  const handlePumpToggle = async (newValue) => {
    if (newValue && !state.ev1.estado && !state.ev2.estado && !state.ev3.estado) {
      window.alert('No se puede arrancar la bomba sin ninguna electroválvula abierta.');
      return;
    }
    try {
      const targetState = newValue ? 'ACTIVO' : 'INACTIVO';
      const decision = await sensorService.decideEstadoActuador(ACTUADORES.bomba, targetState);

      if (!decision?.permiso) {
        window.alert(decision?.motivo || 'Accion no permitida por reglas de automatizacion');
        return;
      }

      applyAutomationActions(decision.accion || []);
      setPopup({ visible: false });
    } catch (error) {
      const motivo = error?.response?.data?.motivo;
      if (motivo) {
        window.alert(motivo);
      } else {
        console.error('Error updating pump:', error);
      }
    }
  };

  const handleValveToggle = async (valveId, newValue) => {
    try {
      const sensorId = ACTUADORES[valveId];
      const targetState = newValue ? 'ACTIVO' : 'INACTIVO';
      const decision = await sensorService.decideEstadoActuador(sensorId, targetState);

      if (!decision?.permiso) {
        window.alert(decision?.motivo || 'Accion no permitida por reglas de automatizacion');
        return;
      }

      applyAutomationActions(decision.accion || []);
      setPopup({ visible: false });
    } catch (error) {
      const motivo = error?.response?.data?.motivo;
      if (motivo) {
        window.alert(motivo);
      } else {
        console.error(`Error updating ${valveId}:`, error);
      }
    }
  };
  

  /*
  const handleValveToggle = async (id, val) => {
    try {
      await sensorService.updateActuadorState(ACTUADORES[id], val?'ACTIVO':'INACTIVO');
      setState(s => ({ ...s, [id]:{ ...s[id], estado:val } }));
      setPopup({ visible:false });
    } catch(e){ console.error(e); }
  };
  */

  const bpPct = pctFrom(sensorData.mainTank.distanceCm, sensorData.mainTank.maxDistanceCm);
  const b1Pct = pctFrom(sensorData.tanks.b1.distanceCm, sensorData.tanks.b1.maxDistanceCm);
  const b2Pct = pctFrom(sensorData.tanks.b2.distanceCm, sensorData.tanks.b2.maxDistanceCm);
  const b3Pct = pctFrom(sensorData.tanks.b3.distanceCm, sensorData.tanks.b3.maxDistanceCm);

  // Colores tema
  const C = dark ? {
    tankBg:'#0a1628', tankBg2:'#0d1e38', tankStroke:'#1e3a5f',
    waterA:'rgba(61,142,240,0.55)', waterB:'rgba(37,99,235,0.78)',
    pipe:'#2563eb', sigLine:'#1a2e4a', cardBg:'#0b1e38', cardStroke:'#1a3052',
    lblBold:'#e2e8f0', lblDim:'#2a3f5f', lblMain:'#94a3b8',
    sensorBg:'#0a1628', sensorStroke:'#3d8ef0',
    valOnBg:'rgba(52,211,153,0.1)', valOnSt:'#34d399', valOnTxt:'#34d399',
    valOffBg:'rgba(245,158,11,0.1)', valOffSt:'#f59e0b', valOffTxt:'#f59e0b',
    pumpOn:'#3d8ef0', pumpOff:'#1e3a5f',
    okGreen:'#34d399', warnAmber:'#f59e0b', gridLine:'rgba(37,99,235,0.05)',
    legBg:'rgba(8,18,34,0.9)', legStroke:'rgba(37,99,235,0.15)',
  } : {
    tankBg:'#e8f0fd', tankBg2:'#dbeafe', tankStroke:'#93b4f0',
    waterA:'rgba(37,99,235,0.22)', waterB:'rgba(37,99,235,0.48)',
    pipe:'#2563eb', sigLine:'#93b4f0', cardBg:'#f0f6ff', cardStroke:'#bfdbfe',
    lblBold:'#1e3a5f', lblDim:'#93b4f0', lblMain:'#4a5f7a',
    sensorBg:'#dbeafe', sensorStroke:'#2563eb',
    valOnBg:'rgba(22,163,74,0.1)', valOnSt:'#16a34a', valOnTxt:'#16a34a',
    valOffBg:'rgba(217,119,6,0.1)', valOffSt:'#d97706', valOffTxt:'#d97706',
    pumpOn:'#2563eb', pumpOff:'#bfdbfe',
    okGreen:'#16a34a', warnAmber:'#d97706', gridLine:'rgba(37,99,235,0.04)',
    legBg:'rgba(240,246,255,0.95)', legStroke:'rgba(37,99,235,0.2)',
  };

  const lvlColor = (pct) => pct<25 ? C.warnAmber : C.okGreen;

  // Valve component
  const Valve = ({ cx, cy, open, id, label }) => (
    <g className="sc-hov" onClick={() => setPopup({ visible:true, type:'valve', id })}>
      <rect x={cx-15} y={cy-15} width="30" height="30" rx="7" fill={open?C.valOnBg:C.valOffBg} stroke={open?C.valOnSt:C.valOffSt} strokeWidth="1.4"/>
      <line x1={cx-7} y1={cy-7} x2={cx+7} y2={cy+7} stroke={open?C.valOnSt:C.valOffSt} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1={cx+7} y1={cy-7} x2={cx-7} y2={cy+7} stroke={open?C.valOnSt:C.valOffSt} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x={cx-4} y={cy-24} width="8" height="10" rx="2" fill={open?C.valOnSt:C.valOffSt}/>
      <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',fontWeight:700}} x={cx} y={cy+28} textAnchor="middle" fill={C.lblDim}>{label}</text>
      <rect x={cx-25} y={cy+32} width="50" height="13" rx="4" fill={open?C.valOnBg:C.valOffBg} stroke={open?C.valOnSt:C.valOffSt} strokeWidth="0.8"/>
      <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',fontWeight:700}} x={cx} y={cy+42} textAnchor="middle" fill={open?C.valOnTxt:C.valOffTxt}>
        {open==null?'N/A':open?'ABIERTA':'CERRADA'}
      </text>
    </g>
  );

  // Small tank component
  const SmallTank = ({ x, y, w, h, pct, label, sensorId, cpId, cmVal }) => {
    const lc   = lvlColor(pct);
    const warn = pct < 25;
    const waterH2 = Math.max(0, (h-2)*pct/100);
    const waterY2 = y+1+(h-2)*(1-pct/100);
    return (
      <g className="sc-hov" onClick={() => setPopup({ visible:true, type:'sensor', id:sensorId })}>
        <rect x={x} y={y} width={w} height={h} rx="6" fill={C.tankBg} stroke={C.tankStroke} strokeWidth="1.3"/>
        {pct>0 && <rect x={x+1} y={waterY2} width={w-2} height={waterH2} fill={C.waterA} clipPath={`url(#${cpId})`}/>}
        {pct>10 && <rect x={x+5} y={waterY2+3} width="16" height="2.5" rx="1.2" fill="rgba(255,255,255,0.12)"/>}
        <rect x={x} y={y} width={w} height={h} rx="6" fill="none" stroke={C.tankStroke} strokeWidth="1.3"/>
        <text style={{fontFamily:"'Inter',sans-serif",fontSize:'9px',fontWeight:700,letterSpacing:'0.04em'}} x={x+w/2} y={y+h-8} textAnchor="middle" fill={C.lblBold}>{label}</text>
        <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',fontWeight:700}} x={x+w/2} y={y+h-20} textAnchor="middle" fill={lc}>{pct.toFixed(0)}%</text>
        <line x1={x+w/2} y1={y} x2={x+w/2} y2={y-14} stroke={C.sigLine} strokeWidth="1"/>
        <polygon points={`${x+w/2-6},${y-14} ${x+w/2+6},${y-14} ${x+w/2+4},${y-26} ${x+w/2-4},${y-26}`} fill={C.sensorBg} stroke={C.sensorStroke} strokeWidth="1.1"/>
        <path d={`M${x+w/2-4},${y-11} Q${x+w/2},${y-7} ${x+w/2+4},${y-11}`} fill="none" stroke={C.pipe} strokeWidth="1.1" strokeLinecap="round"/>
        <line x1={x+w/2} y1={y-26} x2={x+w/2} y2={y-42} stroke={C.sigLine} strokeWidth="1" strokeDasharray="3 2"/>
        <rect x={x+w/2-26} y={y-58} width="52" height="17" rx="5" fill={warn?C.valOffBg:C.valOnBg} stroke={warn?C.valOffSt:C.valOnSt} strokeWidth="0.8"/>
        <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8.5px',fontWeight:700}} x={x+w/2} y={y-46} textAnchor="middle" fill={lc}>{cmVal} cm</text>
      </g>
    );
  };



  return (
    <div style={{ width:'100%', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Inter:wght@500;600;700&display=swap');
        .sc-hov { cursor:pointer; transition:opacity 0.18s; }
        .sc-hov:hover { opacity:0.82; }
        @keyframes flowMove { from{stroke-dashoffset:0} to{stroke-dashoffset:-18} }
        @keyframes pumpRot  { to{transform:rotate(360deg)} }
        @keyframes glowP    { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .pipe-anim { stroke-dasharray:8 4; animation:flowMove 0.65s linear infinite; }
        .glow-p    { animation:glowP 2s ease-in-out infinite; }
      `}</style>

      {/* Barra superior */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',animation:'fadeInUp 0.4s ease both' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:3,height:18,borderRadius:2,background:'linear-gradient(180deg,#2563eb,#60a5fa)' }}/>
          <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:dark?'#e2e8f0':'#1e3a5f',fontFamily:"'Inter',sans-serif" }}>
            Esquema Hidráulico — Distribución Hídrica
          </h3>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          {loading && (
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ display:'inline-block',width:10,height:10,border:'1.5px solid rgba(37,99,235,0.3)',borderTop:'1.5px solid #2563eb',borderRadius:'50%',animation:'pumpRot 0.8s linear infinite' }}/>
              <span style={{ fontSize:'0.7rem',color:'#2563eb',fontWeight:600 }}>Actualizando</span>
            </div>
          )}
          {!loading && lastTs && (
            <span style={{ fontSize:'0.68rem',color:dark?'#1e3a5f':'#93b4f0',fontFamily:"'JetBrains Mono',monospace" }}>
              ● {lastTs.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
          )}
        </div>
      </div>

      {/* Contenedor SVG */}
      <div style={{ background:dark?'linear-gradient(160deg,#060d1a,#09162a)':'linear-gradient(160deg,#f0f6ff,#e8f0fd)',border:dark?'1px solid rgba(37,99,235,0.18)':'1px solid rgba(37,99,235,0.2)',borderRadius:14,overflow:'hidden',padding:'0.5rem',boxShadow:dark?'inset 0 1px 0 rgba(255,255,255,0.02),0 6px 28px rgba(0,0,0,0.45)':'0 4px 20px rgba(37,99,235,0.1)',animation:'fadeInUp 0.5s 0.1s ease both' }}>
        <svg width="100%" viewBox="0 0 700 490" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="cp-bp2"><rect x="42" y="112" width="136" height="176" rx="4"/></clipPath>
            <clipPath id="cp-b1-2"><rect x="482" y="62" width="100" height="68" rx="4"/></clipPath>
            <clipPath id="cp-b2-2"><rect x="482" y="202" width="100" height="68" rx="4"/></clipPath>
            <clipPath id="cp-b3-2"><rect x="482" y="342" width="100" height="68" rx="4"/></clipPath>
            <linearGradient id="waterGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={dark?"0.55":"0.28"}/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity={dark?"0.82":"0.52"}/>
            </linearGradient>
            <linearGradient id="tankBodyGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.tankBg}/>
              <stop offset="100%" stopColor={C.tankBg2}/>
            </linearGradient>
            <filter id="glowF2">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <pattern id="gridP2" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke={C.gridLine} strokeWidth="0.5"/>
            </pattern>
          </defs>

          <rect width="700" height="490" fill="url(#gridP2)"/>

          {/* BALSA PRINCIPAL */}
          {bpPct > 25 && <rect x="36" y="106" width="152" height="192" rx="10" fill="none" stroke={C.pipe} strokeWidth="1" opacity="0.2" className="glow-p"/>}
          <rect x="40" y="110" width="140" height="180" rx="7" fill="url(#tankBodyGrad2)" stroke={C.tankStroke} strokeWidth="1.5"/>
          {bpPct>0 && <rect x="42" y={112+(176*(1-bpPct/100))} width="136" height={176*bpPct/100} fill="url(#waterGrad2)" clipPath="url(#cp-bp2)"/>}
          {bpPct>5 && <rect x="52" y={112+(176*(1-bpPct/100))+4} width="40" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>}
          <line x1="40" y1="150" x2="180" y2="150" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
          <line x1="40" y1="190" x2="180" y2="190" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
          <line x1="40" y1="230" x2="180" y2="230" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
          <rect x="40" y="110" width="140" height="180" rx="7" fill="none" stroke={C.tankStroke} strokeWidth="1.5"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'10px',fontWeight:800,letterSpacing:'0.08em'}} x="110" y="264" textAnchor="middle" fill={C.lblBold}>BALSA PRINCIPAL</text>
          <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',fontWeight:700}} x="110" y="278" textAnchor="middle" fill={lvlColor(bpPct)}>{bpPct.toFixed(0)}%</text>

          {/* Sensor BP */}
          <g className="sc-hov" onClick={() => setPopup({ visible:true, type:'sensor', id:'bp' })}>
            <line x1="110" y1="110" x2="110" y2="96" stroke={C.sigLine} strokeWidth="1"/>
            <polygon points="104,80 116,80 113,94 107,94" fill={C.sensorBg} stroke={C.sensorStroke} strokeWidth="1.2"/>
            <path d="M106,97 Q110,102 114,97" fill="none" stroke={C.pipe} strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M103,101 Q110,107 117,101" fill="none" stroke={C.pipe} strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
            <line x1="110" y1="80" x2="110" y2="52" stroke={C.sigLine} strokeWidth="1" strokeDasharray="3 2"/>
            <rect x="76" y="36" width="68" height="18" rx="5" fill={bpPct<25?C.valOffBg:C.valOnBg} stroke={bpPct<25?C.valOffSt:C.valOnSt} strokeWidth="0.8"/>
            <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8.5px',fontWeight:700}} x="110" y="49" textAnchor="middle" fill={lvlColor(bpPct)}>{sensorData.mainTank.distanceCm} cm</text>
            <text style={{fontFamily:"'Inter',sans-serif",fontSize:'7.5px'}} x="110" y="25" textAnchor="middle" fill={C.lblDim}>Sensor US Nivel</text>
          </g>

          {/* Pipe Balsa → Bomba */}
          <line x1="180" y1="200" x2="226" y2="200" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.pump.estado && <line x1="180" y1="200" x2="226" y2="200" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}

          {/* BOMBA */}
          <g className="sc-hov" onClick={() => setPopup({ visible:true, type:'pump', id:null })}>
            {state.pump.estado && <circle cx="252" cy="200" r="30" fill="none" stroke={C.valOnSt} strokeWidth="1.5" opacity="0.25" className="glow-p"/>}
            <circle cx="252" cy="200" r="26" fill={C.tankBg} stroke={state.pump.estado?C.valOnSt:C.tankStroke} strokeWidth="1.5"/>
            <circle cx="252" cy="200" r="18" fill="none" stroke={state.pump.estado?C.pumpOn:C.lblDim} strokeWidth="1" strokeDasharray={state.pump.estado?'none':'3 2'}/>
            <polygon points="243,195 265,200 243,205" fill={state.pump.estado?C.pumpOn:C.pumpOff} style={state.pump.estado?{transformOrigin:'252px 200px',animation:'pumpRot 1.3s linear infinite'}:{}}/>
            <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8.5px',fontWeight:700,letterSpacing:'0.06em'}} x="252" y="236" textAnchor="middle" fill={C.lblDim}>BOMBA</text>
            <rect x="231" y="239" width="42" height="13" rx="4" fill={state.pump.estado?C.valOnBg:C.valOffBg} stroke={state.pump.estado?C.valOnSt:C.valOffSt} strokeWidth="0.8"/>
            <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',fontWeight:700}} x="252" y="249" textAnchor="middle" fill={state.pump.estado?C.valOnTxt:C.valOffTxt}>
              {state.pump.estado==null?'N/A':state.pump.estado?'ON':'OFF'}
            </text>
          </g>

          {/* Pipe Bomba → Colector */}
          <line x1="278" y1="200" x2="348" y2="200" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.pump.estado && <line x1="278" y1="200" x2="348" y2="200" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}

          {/* COLECTOR */}
          <line x1="348" y1="95" x2="348" y2="375" stroke={C.pipe} strokeWidth="7" strokeLinecap="round"/>
          <circle cx="348" cy="200" r="9" fill={C.pipe}/>
          <circle cx="348" cy="95"  r="7" fill={C.pipe} opacity="0.75"/>
          <circle cx="348" cy="235" r="7" fill={C.pipe} opacity="0.75"/>
          <circle cx="348" cy="375" r="7" fill={C.pipe} opacity="0.75"/>

          {/* RAMAL 1 */}
          <line x1="348" y1="95"  x2="420" y2="95"  stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev1.estado && <line x1="348" y1="95" x2="420" y2="95" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <Valve cx={436} cy={95}  open={state.ev1.estado} id="ev1" label="EV-1"/>
          <line x1="452" y1="95"  x2="480" y2="95"  stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev1.estado && <line x1="452" y1="95" x2="480" y2="95" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <SmallTank x={480} y={60}  w={104} h={72} pct={b1Pct} label="Balsa 1" sensorId="b1" cpId="cp-b1-2" cmVal={sensorData.tanks.b1.distanceCm}/>

          {/* RAMAL 2 */}
          <line x1="348" y1="235" x2="420" y2="235" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev2.estado && <line x1="348" y1="235" x2="420" y2="235" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <Valve cx={436} cy={235} open={state.ev2.estado} id="ev2" label="EV-2"/>
          <line x1="452" y1="235" x2="480" y2="235" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev2.estado && <line x1="452" y1="235" x2="480" y2="235" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <SmallTank x={480} y={200} w={104} h={72} pct={b2Pct} label="Balsa 2" sensorId="b2" cpId="cp-b2-2" cmVal={sensorData.tanks.b2.distanceCm}/>

          {/* RAMAL 3 */}
          <line x1="348" y1="375" x2="420" y2="375" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev3.estado && <line x1="348" y1="375" x2="420" y2="375" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <Valve cx={436} cy={375} open={state.ev3.estado} id="ev3" label="EV-3"/>
          <line x1="452" y1="375" x2="480" y2="375" stroke={C.pipe} strokeWidth="6" strokeLinecap="round"/>
          {state.ev3.estado && <line x1="452" y1="375" x2="480" y2="375" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" className="pipe-anim"/>}
          <SmallTank x={480} y={340} w={104} h={72} pct={b3Pct} label="Balsa 3" sensorId="b3" cpId="cp-b3-2" cmVal={sensorData.tanks.b3.distanceCm}/>

          {/* LEYENDA */}
          <rect x="40" y="325" width="170" height="114" rx="9" fill={C.legBg} stroke={C.legStroke} strokeWidth="1"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8.5px',fontWeight:800,letterSpacing:'0.1em'}} x="52" y="342" fill={C.lblDim}>LEYENDA</text>
          <line x1="52" y1="356" x2="88" y2="356" stroke={C.pipe} strokeWidth="5" strokeLinecap="round"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8px'}} x="96" y="360" fill={C.lblDim}>Tubería de agua</text>
          <line x1="52" y1="372" x2="88" y2="372" stroke={C.sigLine} strokeWidth="1" strokeDasharray="4 3" strokeLinecap="round"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8px'}} x="96" y="376" fill={C.lblDim}>Señal sensor</text>
          <rect x="52" y="384" width="15" height="11" rx="3" fill={C.valOnBg} stroke={C.valOnSt} strokeWidth="1"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8px'}} x="75" y="393" fill={C.lblDim}>Válvula abierta</text>
          <rect x="52" y="400" width="15" height="11" rx="3" fill={C.valOffBg} stroke={C.valOffSt} strokeWidth="1"/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8px'}} x="75" y="409" fill={C.lblDim}>Válvula cerrada</text>
          <circle cx="60" cy="422" r="4" fill={C.pipe}/>
          <text style={{fontFamily:"'Inter',sans-serif",fontSize:'8px'}} x="72" y="426" fill={C.lblDim}>Nodo colector</text>

          {/* Footer */}
          <text style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px'}} x="40" y="464" fill={C.lblDim}>Agrotech IoT · Distribución hídrica · Act. 10 s</text>
          {loading && <text style={{fontFamily:"'Inter',sans-serif",fontSize:'7.5px'}} x="658" y="464" textAnchor="end" fill={C.pipe}>● Cargando…</text>}
        </svg>
      </div>

      <Modal
        popup={popup}
        state={state}
        sensorData={sensorData}
        onClose={() => setPopup({ visible:false })}
        onPumpToggle={handlePumpToggle}
        onValveToggle={handleValveToggle}
      />
    </div>
  );
}

export const ejemploDatos = {
  mainTank:{ distanceCm:72, maxDistanceCm:100 },
  tanks:{ b1:{ distanceCm:45, maxDistanceCm:100 }, b2:{ distanceCm:18, maxDistanceCm:100 }, b3:{ distanceCm:61, maxDistanceCm:100 } },
  valves:{ ev1Open:true, ev2Open:false, ev3Open:true },
};