import { Activity, Droplet, Wind, Thermometer, Cog, Waves, AudioWaveform, CircuitBoard } from 'lucide-react';

// Componente para obtener el icono según el tipo de sensor
export const SensorIcon = ({ type }) => {
    const iconProps = { className: "w-6 h-6" };

    switch(type) {
        case 'HUMEDAD': return <Droplet {...iconProps} />;
        case 'TEMPERATURA': return <Thermometer {...iconProps} />;
        case 'CAUDALIMETRO': return <Waves {...iconProps} />;
        case 'ULTRASONIDOS': return <AudioWaveform  {...iconProps} />;
        case 'BOMBA': return <Cog {...iconProps} />;
        case 'ELECTROVALVULA': return <CircuitBoard {...iconProps} />;
        default: return <Activity {...iconProps} />;
    }
};