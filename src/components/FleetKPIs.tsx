// src/components/FleetKPIs.tsx
import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Link from "@mui/material/Link";
import { computeStatus } from "../utils/status";

type NodeRow = {
  id: string;
  name?: string;
  feeder?: string;
  district?: string;
  telemetry?: { vuf?: number; neutral?: number; ts?: number };
  mode?: "auto" | "manual";
};

export default function FleetKPIs({ nodes }: { nodes: NodeRow[] }) {
  // Defensive defaults
  const total = nodes.length;
  const online = nodes.filter((n) => !!n.telemetry).length;
  const offline = total - online;

  // Avg VUF (compute over nodes that have vuf)
  const vufValues = nodes
    .map((n) => n.telemetry?.vuf ?? NaN)
    .filter((v) => !isNaN(v));
  const avgVuf = vufValues.length
    ? vufValues.reduce((a, b) => a + b, 0) / vufValues.length
    : NaN;

  // Balanced count = vuf <= nominal threshold (use same default thresholds as utils)
  const nominalThreshold = 0.02;
  const balancedCount = nodes.filter(
    (n) => (n.telemetry?.vuf ?? 999) <= nominalThreshold
  ).length;
  const balancedPct = total ? Math.round((balancedCount / total) * 100) : 0;

  // Worst node by vuf
  const worst = nodes
    .map((n) => ({ id: n.id, vuf: n.telemetry?.vuf ?? -1 }))
    .filter((x) => x.vuf >= 0)
    .sort((a, b) => b.vuf - a.vuf)[0];

  // Recent actions (simulated / placeholder)
  const recentActionsCount = Math.max(0, Math.round(Math.random() * 3 + 0)); // small random demo value

  // Last update (most recent telemetry timestamp)
  const lastTs = nodes
    .map((n) => n.telemetry?.ts ?? 0)
    .reduce((a, b) => Math.max(a, b), 0);
  const lastUpdated = lastTs ? new Date(lastTs).toLocaleString() : "N/A";

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Fleet KPIs</Typography>
        <IconButton size="small" title="What these metrics mean">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 1.25,
          mt: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total nodes
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {total}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Online / Offline
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            <span style={{ color: "#2ecc71" }}>{online}</span> /{" "}
            <span style={{ color: "#999" }}>{offline}</span>
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            % Balanced (VUF ≤ 0.02)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {balancedPct}%
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={balancedPct}
                sx={{ height: 8, borderRadius: 2 }}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Avg VUF
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isNaN(avgVuf) ? "—" : avgVuf.toFixed(3)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Worst node
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {worst ? (
              <Link href={`#/nodes/${worst.id}`} underline="hover">
                {worst.id}
              </Link>
            ) : (
              <span style={{ color: "#666" }}>—</span>
            )}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Recent actions (last hour)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {recentActionsCount}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Operational"
            size="small"
            sx={{ bgcolor: "#2ECC71", color: "#fff", fontWeight: 700 }}
          />
          <Chip
            label="Degraded"
            size="small"
            sx={{ bgcolor: "#F39C12", color: "#fff", fontWeight: 700 }}
          />
          <Chip
            label="Critical"
            size="small"
            sx={{ bgcolor: "#E74C3C", color: "#fff", fontWeight: 700 }}
          />
        </Stack>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">
            Last update
          </Typography>
          <Typography variant="body2">{lastUpdated}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
