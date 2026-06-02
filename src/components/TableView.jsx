import { useTheme } from "../App.js";
import { G } from "../constants/palette";

// ─── Badge de origen ──────────────────────────────────────────────────────────
function OrigenBadge({ origen }) {
  const isLora = origen === "LORA";
  return (
    <span style={{
      display:      "inline-block",
      padding:      "1px 6px",
      borderRadius: 6,
      fontSize:     9,
      fontWeight:   700,
      letterSpacing:"0.05em",
      background:   isLora ? "rgba(167,139,250,0.15)" : "rgba(52,211,153,0.12)",
      border:       isLora ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(52,211,153,0.3)",
      color:        isLora ? "#a78bfa" : "#34d399",
    }}>
      {isLora ? "LoRa" : "MQTT"}
    </span>
  );
}

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
// Props:
//   data  Array<{ id, valor, unidad, timeDay, sensorId, origen? }>
//   unit  string  — e.g. "Litros", "Bar"

const HEADERS = ["#", "Valor", "Unidad", "Timestamp", "Origen"];

export default function TableView({ data, unit }) {
  const { dark } = useTheme();
  const rows = [...data].reverse();

  const rowEven  = dark ? "rgba(255,255,255,0.02)" : "#fafafa";
  const rowOdd   = dark ? "transparent"            : "#fff";
  const rowBorder= dark ? "rgba(255,255,255,0.05)" : "#f1f5f9";
  const numColor = dark ? "#475569"                : "#cbd5e1";
  const tsColor  = dark ? "#64748b"                : "#64748b";
  const unitColor= dark ? "#94a3b8"                : "#94a3b8";

  return (
    <div style={{ overflowY: "auto", maxHeight: 260 }}>
      <table
        style={{
          width:          "100%",
          borderCollapse: "collapse",
          fontSize:       11,
          fontFamily:     "'JetBrains Mono', monospace",
        }}
      >
        <thead>
          <tr style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : G[100]}` }}>
            {HEADERS.map(h => (
              <th
                key={h}
                style={{
                  padding:       "6px 8px",
                  textAlign:     "left",
                  color:         dark ? "#475569" : "#94a3b8",
                  fontWeight:    600,
                  letterSpacing: "0.06em",
                  fontSize:      9,
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              style={{
                borderBottom: i < rows.length - 1 ? `1px solid ${rowBorder}` : "none",
                background:   i % 2 === 0 ? rowEven : rowOdd,
              }}
            >
              <td style={{ padding: "5px 8px", color: numColor, fontSize: 10 }}>
                {data.length - i}
              </td>
              <td style={{ padding: "5px 8px", color: G[700], fontWeight: 700 }}>
                {row.valor != null ? Number(row.valor).toFixed(2) : '—'}
              </td>
              <td style={{ padding: "5px 8px", color: unitColor }}>
                {unit}
              </td>
              <td style={{ padding: "5px 8px", color: tsColor }}>
                {row.timeDay?.slice(11) ?? "—"}
              </td>
              <td style={{ padding: "5px 8px" }}>
                {row.origen ? <OrigenBadge origen={row.origen} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
