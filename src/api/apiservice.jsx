import axios from 'axios';

// Configura la URL base de tu API
//const API_BASE_URL = 'http://3.209.189.183:8080/'; // Cambia esto por tu URL
const API_BASE_URL = 'http://localhost:8080/'; // Cambia esto por tu URL

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Servicios para sensores
export const sensorService = {

    // Obtener todos los sensores
    getAllSensors: async () => {
        try {
            console.log("Recargando sensores...");
            const response = await api.get('/sensor');
            return response.data;
        } catch (error) {
            console.error('Error fetching sensors:', error);
            throw error;
        }
    },

    // Obtener estadísticas de un sensor
    getSensorStats: async (sensorId, startDate, endDate) => {
        try {
            const response = await api.post('/lectura/bySensorIdAndFecha', {
                sensorId,
                fechaDesde: startDate,
                fechaHasta: endDate,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching stats for sensor ${sensorId}:`, error);
            throw error;
        }
    },

    // Obtener un sensor por su ID
    getSensorById: async (sensorId) => {
        try {
            const response = await api.get(`/sensor/${sensorId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sensor ${sensorId}:`, error);
            throw error;
        }
    },

    // Modificar estado de un sensor de tipo ACTUADOR
    updateActuadorState: async (sensorId, estado) => {
        try {
            //console.log(sensorId, estado);
            const response = await api.put(`sensor/sensores/${sensorId}`, {
                estado: estado
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating sensor state ${sensorId}:`, error);
            throw error;
        }
    },

    // Obtener la última lectura de un sensor
    getLastSensorReading: async (sensorId) => {
        const response = await api.get(`/lectura/bySensorId/${sensorId}`);
        const lecturas = response.data;
        // Devuelve la última por fecha, o null si no hay ninguna
        return lecturas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))[0] ?? null;
    },

    // Obtener TODAS las lecturas de todos los sensores
    getAllReadings: async () => {
        try {
            const response = await api.get('/lectura');
            return response.data;
        } catch (error) {
            console.error('Error fetching readings:', error);
            throw error;
        }
    },

    //Obtener sensores por sector
    getSensorsBySector: async (sectorId) => {
        try {
            const response = await api.get(`/sensor/bySectorId/${sectorId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sensors for sector ${sectorId}:`, error);
            throw error;
        }
    },

    // Pide al backend la decisión de automatización
    decideEstadoActuador: async (actuadorId, actuadorEstado) => {
        try {
            const response = await api.post('/automatizar/actuadores', {
                id: actuadorId,
                estado: actuadorEstado,
            });
            return response.data;
        } catch (error) {
            console.error(`Error decidiendo el estado del actuador ${actuadorId}:`, error);
            throw error;
        }
    }
};

// Servicios para sectores
export const sectorService = {

    // Obtener los sectores con IDs 2, 3 y 4
    getSectorInfo: async () => {
        try {
            console.log("Obteniendo información de sectores...");
            const response = await api.get('/sectores');
            // Filtrar solo los sectores 2, 3 y 4
            const sectores = response.data.filter(sector => [2, 3, 4].includes(sector.id));
            return sectores.sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Error fetching sectors:', error);
            throw error;
        }
    },
};
