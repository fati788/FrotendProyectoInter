import AppShell from './AppShell';
import EsquemaBalsasIndustrial from './EsquemaBalsasIndustrial.jsx';
import SectoresPanel from './SectoresPanel.jsx';
import { useTheme } from '../App.js';

function SectionHeader({ label, title, sub, accent }) {
    return (
        <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <span style={{
            fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.12em',
            color: accent, textTransform: 'uppercase',
            background: `${accent}18`, border: `1px solid ${accent}30`,
            padding: '2px 8px', borderRadius: 6,
            fontFamily: "'JetBrains Mono', monospace",
        }}>
          {label}
        </span>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    {title}
                </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', marginLeft: 2 }}>{sub}</p>
        </div>
    );
}

export default function IoTDashboard() {
    const { dark } = useTheme();

    return (
        <AppShell>
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

                <div style={{ animation: 'fadeInUp 0.6s 0.1s ease both', marginBottom: '2.5rem' }}>
                    <SectionHeader label="SCADA" title="Esquema Hidráulico — Balsas" sub="Visualización en tiempo real · Actualización cada 10 s" accent="#60a5fa" />
                    <div style={{
                        background: dark ? 'rgba(11,22,40,0.5)' : 'rgba(255,255,255,0.7)',
                        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 18, overflow: 'hidden', padding: '1.5rem',
                        boxShadow: dark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
                    }}>
                        <EsquemaBalsasIndustrial />
                    </div>
                </div>

                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent)', margin: '2.5rem 0' }} />

                <div style={{ animation: 'fadeInUp 0.6s 0.2s ease both' }}>
                    <SectionHeader label="PARCELAS" title="Sectores de Cultivo" sub="Datos de parcelas y gestión por sector" accent="#34d399" />
                    <SectoresPanel />
                </div>

            </main>
        </AppShell>
    );
}