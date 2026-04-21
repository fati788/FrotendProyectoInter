import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { G } from "../constants/palette";
import ChartTooltip from "./ChartTooltip";

// ─── CHART VIEW ───────────────────────────────────────────────────────────────
// Full chart rendered inside the expanded SensorCard detail area.
// Supports two modes toggled by `chartType`:
//   "line" — smooth line chart with an average reference line
//   "bar"  — bar chart with rounded tops
//
// Props:
//   data       Array<{ valor, timeDay, unidad }>
//   chartType  "line" | "bar"

const TICK_STYLE = {
  fontSize:   9,
  fill:       "#94a3b8",
  fontFamily: "'DM Mono', monospace",
};


const MARGIN = { top: 8, right: 8, bottom: 8, left: -10 };

export default function ChartView({ data, chartType }) {
  const avg = data.reduce((s, d) => s + d.valor, 0) / data.length;

  // Attach a readable time tick every 6 data points to avoid axis clutter
  const tickedData = data.map((d, i) => ({
    ...d,
    tick: i % 6 === 0 ? d.timeDay.slice(11, 16) : "",
  }));

  const sharedAxes = (
    <>
      <XAxis
        dataKey="tick"
        tick={TICK_STYLE}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        tick={TICK_STYLE}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip content={<ChartTooltip />} />
    </>
  );

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={tickedData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={G[50]} />
            {sharedAxes}
            <ReferenceLine
              y={avg}
              stroke={G[300]}
              strokeDasharray="4 4"
              label={{
                value:      "AVG",
                position:   "right",
                fontSize:   9,
                fill:       G[500],
                fontFamily: "'DM Mono', monospace",
              }}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={G[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: G[500], stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        ) : (
          <BarChart data={tickedData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={G[50]} vertical={false} />
            {sharedAxes}
            <Bar dataKey="valor" fill={G[200]} radius={[3, 3, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
