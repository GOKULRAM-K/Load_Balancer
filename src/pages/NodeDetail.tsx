// src/pages/NodeDetail.tsx
import React from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { SAMPLE_NODES } from "../mock/sample_nodes";
import useMockTelemetry from "../hooks/useMockTelemetry";
import GaugesPanel from "../components/GaugesPanel";
import TimeseriesChart from "../components/TimeseriesChart";
import ControlPanel from "../components/ControlPanel";
import BeforeAfterPanel from "../components/BeforeAfterPanel";
import EventLog from "../components/EventLog";
import { computeStatus } from "../utils/status";

export default function NodeDetail() {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (!nodeId) return <div>No node selected</div>;

  const nodeMeta = SAMPLE_NODES.find((n) => n.id === nodeId);
  const { latest, timeseries, mode, setMode, events, sendCommand, status } =
    useMockTelemetry(nodeId);

  // confirmation dialog for mode switch
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [targetMode, setTargetMode] = React.useState<"auto" | "manual">("auto");

  function attemptModeChange(next: "auto" | "manual") {
    setTargetMode(next);
    setConfirmOpen(true);
  }
  function applyModeChange() {
    setConfirmOpen(false);
    setMode(targetMode);
  }

  // last ack before/after info: find last command-ack in events
  const lastAck = React.useMemo(() => {
    const ack = events
      .slice()
      .reverse()
      .find((e: any) => e.type === "command-ack");
    return ack ?? null;
  }, [events]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Node Detail — {nodeId}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle1">{nodeMeta?.name ?? nodeId}</Typography>
        <Typography variant="body2" color="text.secondary">
          {nodeMeta?.district} / {nodeMeta?.taluk}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Typography variant="body2">Mode</Typography>
        <Switch
          checked={mode === "manual"}
          onChange={() =>
            attemptModeChange(mode === "manual" ? "auto" : "manual")
          }
        />
        <Typography>{mode === "manual" ? "Manual" : "Auto"}</Typography>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() =>
            alert(
              "Safety: All manual actions require confirmation before send."
            )
          }
        >
          Safety
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm mode change</DialogTitle>
        <DialogContent>
          <Typography>
            Change mode to <strong>{targetMode}</strong> ?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This will allow{" "}
            {targetMode === "manual"
              ? "manual controls"
              : "automatic balancing"}
            .
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={applyModeChange}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, mt: 2 }}
      >
        <Box>
          <GaugesPanel sample={latest} />
          <TimeseriesChart data={timeseries || []} />
          <BeforeAfterPanel before={lastAck?.before} after={lastAck?.after} />
          <EventLog events={events} />
        </Box>

        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Quick Status</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              {status.level.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Severity: {status.severity}/100
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {status.reason.join(" • ")}
            </Typography>
          </Paper>

          <ControlPanel enabled={mode === "manual"} sendCommand={sendCommand} />
        </Box>
      </Box>
    </Box>
  );
}
