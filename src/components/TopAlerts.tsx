// src/components/TopAlerts.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { computeStatus } from "../utils/status";
import type { TelemetrySample } from "../utils/status";

export type AlertNode = {
  id: string;
  name?: string;
  district?: string;
  taluk?: string;
  feeder?: string;
  telemetry?: TelemetrySample;
};

export default function TopAlerts({
  nodes,
  onView,
  max = 3,
}: {
  nodes: AlertNode[];
  onView: (id: string) => void;
  max?: number;
}) {
  // compute status for each node
  const withStatus = nodes.map((n) => {
    const s = computeStatus(n.telemetry);
    return {
      ...n,
      status: s.level,
      severity: s.severity,
      reason: s.reason,
    };
  });

  // sort by descending severity, then vuf if equal
  const sorted = withStatus
    .filter((n) => n.severity > 0)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, max);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6">Top Alerts</Typography>

      <Box sx={{ mt: 1 }}>
        {sorted.length === 0 ? (
          <Typography color="text.secondary">No active alerts</Typography>
        ) : (
          <List dense>
            {sorted.map((n) => {
              const shortReason =
                n.reason && n.reason.length ? n.reason.join(" • ") : "No data";
              const chipColor =
                n.status === "critical"
                  ? "#E74C3C"
                  : n.status === "degraded"
                  ? "#F39C12"
                  : "#2ECC71";

              return (
                <ListItem
                  key={n.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => onView(n.id)}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  }
                  sx={{ py: 0.5 }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>{n.id}</Typography>
                        <Chip
                          label={n.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: chipColor,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {n.name ? `${n.name} — ` : ""}
                        {shortReason}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
}
