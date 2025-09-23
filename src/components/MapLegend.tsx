// src/components/MapLegend.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const LEGEND = [
  { color: "#2ECC71", label: "Operational (Healthy)" },
  { color: "#F39C12", label: "Degraded (At-Risk)" },
  { color: "#E74C3C", label: "Critical (Immediate Attention)" },
];

export default function MapLegend() {
  return (
    <Box className="map-legend" sx={{ width: 260 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Status Legend
      </Typography>

      {LEGEND.map((row) => (
        <Box
          key={row.label}
          sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.75 }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: 1,
              background: row.color,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          />
          <Typography variant="body2">{row.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
