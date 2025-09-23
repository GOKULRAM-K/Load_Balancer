// src/components/TimeseriesChart.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function TimeseriesChart({ data }: { data: any[] }) {
  // data expected as [{ ts, vuf, neutral }]
  const formatted = data.map((d) => ({
    time: new Date(d.ts).toLocaleTimeString(),
    vuf: Number((d.vuf ?? 0).toFixed(4)),
    neutral: Number((d.neutral ?? 0).toFixed(2)),
  }));

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Timeseries (VUF & Neutral)
      </Typography>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis
              yAxisId="left"
              domain={[0, "dataMax + 0.02"]}
              tickFormatter={(v) => v.toFixed(3)}
            />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="vuf"
              stroke="#0369a1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="neutral"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
}
