import { G } from "../constants/palette";

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
// Renders the last 25 readings as a scrollable table inside the expanded
// SensorCard detail area. Rows are displayed newest-first.
//
// Props:
//   data  Array<{ id, valor, unidad, timeDay, sensorId }>
//   unit  string  — e.g. "Litros", "Bar"

const HEADERS = ["#", "Valor", "Unidad", "Timestamp"];

export default function TableView({ data, unit }) {
  const rows = [...data].reverse();

  return (
    <div style={{ overflowY: "auto", maxHeight: 260 }}>
      <table
        style={{
          width:           "100%",
          borderCollapse: "collapse",
          fontSize:        11,
          fontFamily:      "'DM Mono', monospace",
        }}
      >
        <thead>
          <tr style={{ borderBottom: `1px solid ${G[100]}` }}>
            {HEADERS.map(h => (
              <th
                key={h}
                style={{
                  padding:       "6px 8px",
                  textAlign:     "left",
                  color:         "#94a3b8",
                  fontWeight:    500,
                  letterSpacing: "0.05em",
                  fontSize:      10,
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
                borderBottom: i < rows.length - 1 ? "1px solid #f8fafc" : "none",
                background:   i % 2 === 0 ? "#fafafa" : "#fff",
              }}
            >
              <td style={{ padding: "5px 8px", color: "#cbd5e1", fontSize: 10 }}>
                {data.length - i}
              </td>
              <td style={{ padding: "5px 8px", color: G[700], fontWeight: 700 }}>
                {row.valor}
              </td>
              <td style={{ padding: "5px 8px", color: "#94a3b8" }}>
                {unit}
              </td>
              <td style={{ padding: "5px 8px", color: "#64748b" }}>
                {row.timeDay.slice(11)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
