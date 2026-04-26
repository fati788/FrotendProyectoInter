import { useState } from 'react';
import AppShell from './AppShell';
import SensorCardLecturas from './SensorCardLecturas';

const MOCK_SENSORS = [
    { id: 1, name: 'Sensor Presión Balsa A', type: 'PRESION', sector: 1 },
    { id: 2, name: 'Caudalímetro Principal', type: 'CAUDAL',  sector: 1 },
    { id: 3, name: 'Humedad Sector 2',       type: 'HUMEDAD', sector: 2 },
    { id: 4, name: 'Volumen Depósito Norte', type: 'VOLUMEN', sector: 2 },
];

const generateMockLectures = (n = 20, base = 50, variance = 10) =>
    Array.from({ length: n }, (_, i) => ({
        valor:     parseFloat((base + (Math.random() - 0.5) * variance * 2).toFixed(2)),
        unidad:    'bar',
        timestamp: new Date(Date.now() - (n - i) * 10 * 60000).toISOString(),
    }));

const MOCK_LECTURES = {
    1: generateMockLectures(20, 3.2,  0.8),
    2: generateMockLectures(20, 12.5, 3),
    3: generateMockLectures(20, 68,   12),
    4: generateMockLectures(20, 1200, 150),
};

const SECTORES = [1, 2, 3];

export default function SensoresPage() {
    const [sectorFilter, setSectorFilter] = useState('todos');
    const [openId, setOpenId] = useState(null);

    const filteredSensors = sectorFilter === 'todos'
        ? MOCK_SENSORS
        : MOCK_SENSORS.filter(s => String(s.sector) === String(sectorFilter));

    return (
        <AppShell>
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

                <div style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>Lecturas de Sensores</h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
                        {filteredSensors.length} sensor{filteredSensors.length !== 1 ? 'es' : ''} monitorizados
                    </p>
                </div>

                {/* Filtro sector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
            SECTOR
          </span>
                    <select
                        value={sectorFilter}
                        onChange={e => { setSectorFilter(e.target.value); setOpenId(null); }}
                        style={{
                            padding: '6px 28px 6px 12px', borderRadius: 8,
                            border: '1.5px solid #e2e8f0', fontSize: 11,
                            fontFamily: "'DM Mono', monospace", color: '#334155',
                            background: '#fff', outline: 'none', cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                        }}
                    >
                        <option value="todos">Todos los sectores</option>
                        {SECTORES.map(s => <option key={s} value={s}>Sector {s}</option>)}
                    </select>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
                    {filteredSensors.map(sensor => (
                        <SensorCardLecturas
                            key={sensor.id}
                            sensor={sensor}
                            lectures={MOCK_LECTURES[sensor.id] ?? []}
                            isOpen={openId === sensor.id}
                            onToggle={() => setOpenId(prev => prev === sensor.id ? null : sensor.id)}
                        />
                    ))}
                </div>

            </main>
        </AppShell>
    );
}