import React from 'react';
import { ResponsiveContainer, LineChart, Line } from "recharts";

export default function Sparkline({ data }) {
    if (!data || data.length === 0) return <div style={{height: 40}}></div>;

    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}