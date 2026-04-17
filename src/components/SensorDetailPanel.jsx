// Componente Panel de Detalles del Sensor
import {SensorIcon} from "./SensorIcon.jsx";
import {useEffect, useState} from "react";
import { Calendar } from 'lucide-react';
import {sensorService} from "../api/apiservice.jsx";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const getDaysAgo = (days) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - days);
    return fecha.toISOString().split('T')[0];
};



export const SensorDetailPanel = ({ sensor, onClose }) => {
    const [dateRange, setDateRange] = useState(
        {start: getDaysAgo(1), end: getDaysAgo(0)});
    const [viewMode, setViewMode] = useState('line'); // 'line' o 'area'
    const [lecturas, setLecturas] = useState([]);
    const [estadoActual, setEstadoActual] = useState(sensor.estado);

    const handleToggleActuador = async () => {
        const nuevoEstado = estadoActual === 'ARRANCADO' ? 'PARADO' : 'ARRANCADO';
        setEstadoActual(nuevoEstado);

        // Llamar API para cambiar estado
        await sensorService.updateActuadorState(sensor.id, nuevoEstado);
    }


    if (!sensor) return null;

    // Aquí irían las llamadas a tu API
    useEffect(() => {
        sensorService.getSensorStats(sensor.id,
            `${dateRange.start}T00:00:00`,
            `${dateRange.end}T23:59:59`
        ).then(data => setLecturas(data));
    }, [dateRange]);

    return (
        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
            {/* Header del panel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                        <SensorIcon type={sensor.tipo}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{sensor.nombre}</h2>
                        <p className="text-slate-400">{sensor.ubicacion}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                >
                    Cerrar
                </button>
            </div>

            {/* Control para actuadores - agregar después del header */}
            {(sensor.tipo === 'BOMBA' || sensor.tipo === 'ELECTROVALVULA') && (
              <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border-2 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Control del Actuador</h3>
                    <p className="text-sm text-slate-400">Estado actual: {sensor.estado ? 'Encendido' : 'Apagado'}</p>
                  </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={estadoActual === 'ARRANCADO'}
                            onChange={handleToggleActuador}
                            className="sr-only peer"
                        />
                        <div className="w-24 h-12 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-colors">
                            <div className={`absolute top-1 left-1 bg-white w-10 h-10 rounded-full transition-transform ${
                                estadoActual === 'ARRANCADO' ? 'translate-x-12' : 'translate-x-0'
                            }`}></div>
                        </div>
                    </label>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2"/>
                        Fecha Inicio
                    </label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2"/>
                        Fecha Fin
                    </label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Gráfico</label>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="line">Líneas</option>
                        <option value="area">Área</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Histórico de Lecturas</h3>
                <ResponsiveContainer width="100%" height={400}>
                    {viewMode === 'line' ? (
                        <LineChart data={lecturas}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="fechaHora"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#cbd5e1',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="valor"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 5 }}
                                activeDot={{ r: 8 }}
                                name={`${sensor.nombre}`}
                            />
                        </LineChart>
                    ) : (
                        <AreaChart data={lecturas}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="fechaHora"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                name={`${sensor.nombre} (${sensor.unidad})`}
                            />
                        </AreaChart>
                    )}
                    </ResponsiveContainer>
                </div>

        </div>
    );
};