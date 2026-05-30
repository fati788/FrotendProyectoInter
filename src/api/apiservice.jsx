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
        const response = await api.post('/automatizar/actuadores', {
            id: actuadorId,
            estado: actuadorEstado,
        });
        return response.data;
    }
};

// Servicios para modo de riego automático
export const modoRiegoService = {

    obtenerModo: async () => {
        const response = await api.get('/automatizar/modo');
        return response.data; // boolean
    },

    cambiarModo: async (automatico) => {
        await api.post('/automatizar/modo', null, { params: { automatico } });
    },
};

// Servicios para la cámara de detección de plagas
const CAMARA_DIRECT_URL = 'https://chinches.caserita-j.es';

export const camaraService = {

    // URLs directas (sin proxy) para el stream y snapshot
    liveUrl:     `${CAMARA_DIRECT_URL}/stream.mjpg`,
    snapshotUrl: `${CAMARA_DIRECT_URL}/live.jpg`,

    // Proxy a través del backend Spring Boot
    getLatest: async () => {
        const response = await api.get('/camara/latest');
        return response.data;
    },

    getHealth: async () => {
        const response = await api.get('/camara/health');
        return response.data;
    },

    getEvents: async (limit = 20, dateFrom = null, dateTo = null) => {
        const params = { limit };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo)   params.date_to   = dateTo;
        const response = await api.get('/camara/events', { params });
        return response.data;
    },

    getStats: async (limit = 288, dateFrom = null, dateTo = null) => {
        const params = { limit };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo)   params.date_to   = dateTo;
        const response = await api.get('/camara/stats', { params });
        return response.data;
    },
};

// Servicios para sectores
export const sectorService = {

    // Obtener los sectores con IDs 2, 3 y 4
    getSectorInfo: async () => {
        try {
            console.log("Obteniendo información de sectores...");
            const response = await api.get('/sectores');
            return response.data.sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Error fetching sectors:', error);
            throw error;
        }
    },
};
