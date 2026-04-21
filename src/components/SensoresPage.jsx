import { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import SensorCardLecturas from './SensorCardLecturas';
import { sensorService } from '../api/apiservice.jsx';

export default function SensoresPage() {
    const [sectorFilter, setSectorFilter] = useState('todos');
    const [openId, setOpenId] = useState(null);

    const [sensors, setSensors] = useState([]);
    const [lectures, setLectures] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [sensorData, readingData] = await Promise.all([
                sensorService.getAllSensors(),
                sensorService.getAllReadings()
            ]);

            setSensors(sensorData);
            setLectures(readingData);

        } catch (err) {
            console.error(err);
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    // Sectores únicos dinámicos
    const sectores = useMemo(() => {
        const unique = [...new Set(sensors.map(s => s.sector))];
        return unique.sort((a, b) => a - b);
    }, [sensors]);

    const filteredSensors = sectorFilter === 'todos'
        ? sensors
        : sensors.filter(s => String(s.sector) === String(sectorFilter));

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

                {/* Filtro */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <select
                        value={sectorFilter}
                        onChange={e => {
                            setSectorFilter(e.target.value);
                            setOpenId(null);
                        }}
                    >
                        <option value="todos">Todos los sectores</option>

                        {sectores.map(s => (
                            <option key={s} value={s}>
                                Sector {s}
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
                        gap: 16
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