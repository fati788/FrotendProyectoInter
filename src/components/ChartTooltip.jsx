import { G } from "../constants/palette";

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────
// Custom Recharts tooltip rendered on hover over line / bar charts.
// Displays the timestamp label and the reading value + unit.

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background:   "#fff",
        border:       "1px solid #e2e8f0",
        borderRadius: 8,
        padding:      "8px 12px",
        fontSize:     11,
        fontFamily:   "'DM Mono', monospace",
        boxShadow:    "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: 2 }}>{label}</div>
      <div style={{ color: G[700], fontWeight: 700, fontSize: 14 }}>
        {payload[0].value}{" "}
        <span style={{ fontSize: 11, fontWeight: 400 }}>
          {payload[0].payload?.unidad}
        </span>
      </div>
    </div>
  );
}
