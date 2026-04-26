import { useEffect, useState } from 'react';
import AppShell from './AppShell';
import SensorCardLecturas from './SensorCardLecturas';
import { sensorService, sectorService } from '../api/apiservice.jsx';

export default function SensoresPage() {
    const [sectorFilter, setSectorFilter] = useState('todos');
    const [openId, setOpenId] = useState(null);

    const [sensors, setSensors] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [sectores, setSectores] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [sensorData, readingData, sectorData] = await Promise.all([
                sensorService.getAllSensors(),
                sensorService.getAllReadings(),
                sectorService.getSectorInfo()
            ]);

            setSensors(sensorData);
            setLectures(readingData);
            setSectores(sectorData);

        } catch (err) {
            console.error(err);
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const TIPOS_VISIBLES = ['HUMEDAD', 'PRESION', 'CAUDAL', 'NIVEL'];

    const filteredSensors = sensors
        .filter(s => TIPOS_VISIBLES.includes(s.tipo?.toUpperCase()))
        .filter(s => sectorFilter === 'todos' || String(s.sectorId) === String(sectorFilter));

    const getLecturesBySensor = (sensorId) =>
        lectures.filter(l => l.sensorId === sensorId);

    return (
        <AppShell>
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

                <div style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>
                        Lecturas de Sensores
                    </h2>

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
                        {sectores.map(s => (
                            <option key={s.id} value={s.id}>
                                Sector {s.id}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && <p style={{ color: '#94a3b8' }}>Cargando...</p>}
                {error && <p style={{ color: '#ef4444' }}>{error}</p>}

                {!loading && !error && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 16,
                        alignItems: 'start'
                    }}>
                        {filteredSensors.map(sensor => (
                            <SensorCardLecturas
                                key={sensor.id}
                                sensor={sensor}
                                lectures={getLecturesBySensor(sensor.id)}
                                isOpen={openId === sensor.id}
                                onToggle={() =>
                                    setOpenId(prev =>
                                        prev === sensor.id ? null : sensor.id
                                    )
                                }
                            />
                        ))}
                    </div>
                )}

            </main>
        </AppShell>
    );
}
