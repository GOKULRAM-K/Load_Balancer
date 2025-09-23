// src/components/ControlPanel.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

export default function ControlPanel({
  enabled,
  sendCommand,
}: {
  enabled: boolean;
  sendCommand: (cmd: any) => Promise<any>;
}) {
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState("R");
  const [load, setLoad] = React.useState("Lamp-01");
  const [ttl, setTtl] = React.useState(60);
  const [sending, setSending] = React.useState(false);
  const [lastAck, setLastAck] = React.useState<any>(null);

  function openModal() {
    setOpen(true);
  }
  function close() {
    if (!sending) setOpen(false);
  }

  async function doSend() {
    setSending(true);
    const payload = { load, phase, ttl };
    try {
      const ack: any = await sendCommand({ type: "switch_load", payload });
      setLastAck(ack);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      setOpen(false);
    }
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">Control</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Manual actuation (SSR switching) — requires Manual mode.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" disabled={!enabled} onClick={openModal}>
          Open Manual Control
        </Button>
        <Button
          disabled={!lastAck}
          variant="outlined"
          onClick={() => alert("Show command history (demo)")}
        >
          Last cmd
        </Button>
      </Stack>

      <Dialog open={open} onClose={close}>
        <DialogTitle>Manual Control — Confirm</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Load</InputLabel>
            <Select
              value={load}
              label="Load"
              onChange={(e) => setLoad(e.target.value as string)}
            >
              <MenuItem value="Lamp-01">Lamp-01</MenuItem>
              <MenuItem value="Heater-01">Heater-01</MenuItem>
              <MenuItem value="Resistive-Load">Resistive-Load</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Phase</InputLabel>
            <Select
              value={phase}
              label="Target Phase"
              onChange={(e) => setPhase(e.target.value as string)}
            >
              <MenuItem value="R">R</MenuItem>
              <MenuItem value="Y">Y</MenuItem>
              <MenuItem value="B">B</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="TTL (seconds)"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={close} disabled={sending}>
            Cancel
          </Button>
          <Button variant="contained" onClick={doSend} disabled={sending}>
            {sending ? "Sending…" : "Confirm & Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
