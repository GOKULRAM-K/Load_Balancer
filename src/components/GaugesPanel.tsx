// src/components/GaugesPanel.tsx
import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/**
 * Simple responsive gauge cards using CSS grid (avoids MUI Grid typing issues).
 * Expects `sample` shape: { voltage_r, voltage_y, voltage_b, neutral, vuf }
 */
export default function GaugesPanel({ sample }: { sample?: any }) {
  const vr = sample?.voltage_r ?? 0;
  const vy = sample?.voltage_y ?? 0;
  const vb = sample?.voltage_b ?? 0;
  const neutral = sample?.neutral ?? 0;
  const vuf = sample?.vuf ?? 0;

  const Card = ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
  }) => (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Realtime Gauges
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        <Card title="Voltage R" value={`${vr.toFixed(1)} V`} />
        <Card title="Voltage Y" value={`${vy.toFixed(1)} V`} />
        <Card title="Voltage B" value={`${vb.toFixed(1)} V`} />
        <Card
          title="Neutral Current"
          value={`${neutral.toFixed(2)} A`}
          subtitle={`VUF: ${vuf.toFixed(3)}`}
        />
      </Box>
    </Paper>
  );
}
