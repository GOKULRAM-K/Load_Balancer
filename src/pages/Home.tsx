// src/pages/Home.tsx
import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlaceIcon from "@mui/icons-material/Place";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import StatusMarker from "../components/StatusMarker";
import MapLegend from "../components/MapLegend";
import "leaflet/dist/leaflet.css";
import FleetKPIs from "../components/FleetKPIs";
import TopAlerts from "../components/TopAlerts";

// Demo sample nodes with encoded IDs and sample telemetry
const SAMPLE_NODES = [
  {
    id: "TVPM-PATT-FD01-TX01",
    name: "Node A — Trivandrum",
    district: "Thiruvananthapuram",
    taluk: "Pattom",
    feeder: "FD01",
    status: "Warning: High VUF",
    lat: 8.5241,
    lng: 76.9366,
    telemetry: { vuf: 0.035, neutral: 3.8 },
  },
  {
    id: "ERNA-KOCH-FD02-TX05",
    name: "Node B — Kochi",
    district: "Ernakulam",
    taluk: "Kochi",
    feeder: "FD02",
    status: "Fault: Neutral High",
    lat: 9.9816,
    lng: 76.2999,
    telemetry: { vuf: 0.048, neutral: 6.2 },
  },
  {
    id: "KOZH-CALI-FD03-TX09",
    name: "Node C — Kozhikode",
    district: "Kozhikode",
    taluk: "Calicut",
    feeder: "FD03",
    status: "OK",
    lat: 11.2588,
    lng: 75.7804,
    telemetry: { vuf: 0.012, neutral: 0.9 },
  },
  {
    id: "PLKD-OTTY-FD01-TX12",
    name: "Node D — Palakkad",
    district: "Palakkad",
    taluk: "Ottapalam",
    feeder: "FD01",
    status: "OK",
    lat: 10.8505,
    lng: 76.2711,
    telemetry: { vuf: 0.018, neutral: 1.4 },
  },
  {
    id: "ALPY-MANN-FD04-TX08",
    name: "Node E — Alappuzha",
    district: "Alappuzha",
    taluk: "Mannar",
    feeder: "FD04",
    status: "OK",
    lat: 9.4981,
    lng: 76.3388,
    telemetry: { vuf: 0.022, neutral: 2.5 },
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Fleet Overview
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Left: Map with nodes */}
        <Box sx={{ flex: "1 1 65%", minWidth: 400 }}>
          <Paper
            elevation={2}
            sx={{ p: 2, height: 520, width: "100%", position: "relative" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PlaceIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Map</Typography>
            </Box>

            <MapContainer
              center={[10.1632, 76.6413]}
              zoom={7}
              style={{ height: 440, width: "100%", borderRadius: 6 }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {SAMPLE_NODES.map((n) => (
                <StatusMarker
                  key={n.id}
                  node={n as any}
                  onView={() => navigate(`/nodes/${n.id}`)}
                />
              ))}
            </MapContainer>

            {/* Legend positioned inside the Paper (absolute) */}
            <Box
              sx={{ position: "absolute", right: 12, top: 72, zIndex: 1200 }}
            >
              <MapLegend />
            </Box>
          </Paper>
        </Box>

        {/* Right: KPIs and Alerts */}
        <Box
          sx={{
            flex: "1 1 30%",
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FleetKPIs nodes={SAMPLE_NODES} />
          {/* keep the Top Alerts Paper below as before */}
          <Paper elevation={2} sx={{ p: 2 }}>
            {/* Top Alerts — dynamic, top 3 */}
            <Box sx={{ mt: 0 }}>
              <TopAlerts
                nodes={SAMPLE_NODES as any}
                onView={(id) => navigate(`/nodes/${id}`)}
              />
            </Box>

            <Button
              sx={{ mt: 2 }}
              variant="contained"
              fullWidth
              onClick={() => navigate("/nodes")}
            >
              View nodes
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
