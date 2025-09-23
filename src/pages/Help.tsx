// src/pages/Help.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Help() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Help & About
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">Project summary</Typography>
        <Typography paragraph>
          SIH'25 — Feeder Balancer: a prototype for dynamic phase balancing at
          distribution feeders to reduce Voltage Unbalance Factor (VUF) and
          neutral current during high rooftop PV injection.
        </Typography>

        <Typography variant="subtitle2">System (short)</Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Hardware"
              secondary="ESP32 controllers with CT & voltage sensors, SSR-based load switching (demo uses lamp/heater)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Edge"
              secondary="Raspberry Pi running MQTT broker, Node-RED + Python control daemon."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Cloud / DB"
              secondary="Supabase (demo), InfluxDB in target stack for time-series."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Frontend"
              secondary="React + MUI, Leaflet for map, Recharts for graphs."
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2">Demo script (for judges)</Typography>
        <ol>
          <li>Open Home — observe map and top alerts.</li>
          <li>Click the worst node on the map to open Node Detail.</li>
          <li>
            Switch to Manual mode (confirm) and open Manual Control — send a
            sample command.
          </li>
          <li>
            Observe Event Log and Events tab — see ack and before/after VUF
            improvement.
          </li>
          <li>
            Go to Reports → Generate PDF for the node — download and show the
            judge.
          </li>
        </ol>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2">Quick contacts & repo</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            href="#"
            target="_blank"
          >
            Project Repo
          </Button>
          <Typography variant="body2" color="text.secondary">
            Lead: Your Name • Email: you@domain
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">FAQ & Tips</Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Why Supabase?"
              secondary="Provides a quick, free backend for demo persistence and realtime events without heavy infra."
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="How does Manual vs Auto work?"
              secondary="Manual enables direct SSR switching via UI; Auto lets the control daemon decide and act automatically."
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="How to reproduce an issue?"
              secondary="Use Nodes table to find a node with Critical status, open its detail, and send manual command — watch events/BeforeAfter."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
