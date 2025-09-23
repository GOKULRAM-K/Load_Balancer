// src/components/StatusMarker.tsx
import React from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { computeStatus } from "../utils/status";
import type { TelemetrySample } from "../utils/status";

export interface NodeMeta {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  district?: string;
  taluk?: string;
  feeder?: string;
  telemetry?: TelemetrySample;
}

function createDivIcon(colorHex: string, centerText?: string, pulse = false) {
  const pulseHtml = pulse
    ? `<div class="custom-marker-pulse" style="background:${colorHex}"></div>`
    : "";
  const html = `
    <div style="position:relative; width:44px; height:44px;">
      ${pulseHtml}
      <div class="custom-marker-root" style="background:${colorHex}">
        <div class="custom-marker-num">${centerText ?? ""}</div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "status-div-icon",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

export default function StatusMarker({
  node,
  onView,
}: {
  node: NodeMeta;
  onView: (id: string) => void;
}) {
  const status = computeStatus(node.telemetry);

  const idParts = (node.id || "").split("-");
  const lastSeg = idParts[idParts.length - 1] || "";
  const transformerShort = lastSeg.replace(/[^0-9]/g, "") || lastSeg;

  const icon = React.useMemo(
    () =>
      createDivIcon(
        status.color,
        transformerShort,
        status.level === "degraded" || status.level === "critical"
      ),
    [status.color, transformerShort, status.level]
  );

  const leafIcon = icon as unknown as L.Icon;

  return (
    <Marker position={[node.lat, node.lng]} icon={leafIcon}>
      <Popup>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {node.id}
          </Typography>
          <Typography variant="body2">{node.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {node.district} / {node.taluk} — {node.feeder}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5 }}>
            <Chip
              label={status.level.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: status.color,
                color: "#fff",
                fontWeight: 700,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Severity: {status.severity}/100
            </Typography>
          </Box>

          {status.reason.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {status.reason.join(" • ")}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onView(node.id)}
            >
              View
            </Button>
          </Box>
        </Box>
      </Popup>
    </Marker>
  );
}
