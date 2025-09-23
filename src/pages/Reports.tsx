// src/pages/Reports.tsx
import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { supabase } from "../services/supabaseClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { SAMPLE_NODES } from "../mock/sample_nodes"; // fallback when not using Supabase
import { computeStatus } from "../utils/status";
import TimeseriesChart from "../components/TimeseriesChart";

/**
 * Reports page (prototype)
 * - Select Node or Fleet
 * - Choose a sample window (last N minutes)
 * - Renders a preview panel (summary + timeseries + before/after)
 * - Generates a PDF from the preview
 *
 * For the demo we use SAMPLE_NODES if Supabase isn't configured.
 */

type NodeOption = {
  id: string;
  name: string;
};

export default function Reports() {
  const [mode, setMode] = React.useState<"node" | "fleet">("node");
  const [selectedNode, setSelectedNode] = React.useState<string>(
    SAMPLE_NODES[0].id
  );
  const [minutes, setMinutes] = React.useState<number>(60);
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    severity?: "success" | "error";
  }>({ open: false, msg: "", severity: "success" });
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  // nodes list — try Supabase first, fallback to SAMPLE_NODES
  const [nodes, setNodes] = React.useState<NodeOption[]>(() =>
    SAMPLE_NODES.map((n) => ({ id: n.id, name: n.name }))
  );

  React.useEffect(() => {
    // try to load from supabase if available (non-blocking)
    (async () => {
      try {
        const { data, error } = await supabase.from("nodes").select("id,name");
        if (!error && data) {
          setNodes(data.map((r: any) => ({ id: r.id, name: r.name })));
          // if current selected node not in list, set first
          if (!data.find((d: any) => d.id === selectedNode)) {
            setSelectedNode(data[0]?.id ?? selectedNode);
          }
        }
      } catch (e) {
        // ignore, we already have SAMPLE_NODES
      }
    })();
  }, []);

  // Build a short report data snapshot (prototype uses SAMPLE_NODES or DB telemetry)
  async function buildReportData() {
    // For prototype: fetch telemetry samples (we used useMockTelemetry in NodeDetail)
    // Here we will approximate: either call supabase events/time series if available,
    // or generate a synthetic timeseries for the last `minutes`.
    setLoading(true);
    try {
      // Try to fetch node telemetry from Supabase (if telemetry in nodes table)
      const { data: nodeRow } = await supabase
        .from("nodes")
        .select("telemetry, name")
        .eq("id", selectedNode)
        .limit(1)
        .single();
      // if not found, fallback to SAMPLE_NODES
      let telemetry = null;
      if (nodeRow?.telemetry) {
        telemetry =
          typeof nodeRow.telemetry === "string"
            ? JSON.parse(nodeRow.telemetry)
            : nodeRow.telemetry;
      } else {
        const found = SAMPLE_NODES.find((n) => n.id === selectedNode);
        telemetry = found?.telemetry ?? {
          vuf: 0.02,
          neutral: 1.0,
          ts: Date.now(),
        };
      }

      // For timeseries we will synthesize a small array around current value (for prototype)
      const now = Date.now();
      const timeseries = [];
      for (
        let i = minutes * 60;
        i >= 0;
        i -= Math.max(1, Math.floor((minutes * 60) / 60))
      ) {
        const ts = now - i * 1000;
        // small fluctuation around telemetry.vuf
        const vuf = Math.max(
          0,
          (telemetry.vuf ?? 0.02) + (Math.random() - 0.5) * 0.01
        );
        const neutral = Math.max(
          0,
          (telemetry.neutral ?? 1) + (Math.random() - 0.5) * 0.6
        );
        timeseries.push({ ts, vuf, neutral });
      }

      return {
        nodeId: selectedNode,
        nodeName:
          nodeRow?.name ??
          SAMPLE_NODES.find((s) => s.id === selectedNode)?.name ??
          selectedNode,
        telemetry,
        timeseries,
      };
    } catch (err) {
      console.warn(err);
      setSnack({
        open: true,
        msg: "Failed to build report data (Supabase unavailable)",
        severity: "error",
      });
      // fallback
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Generate PDF from previewRef
  async function generatePdf() {
    setLoading(true);
    try {
      const data = await buildReportData();
      if (!data) {
        setLoading(false);
        return;
      }

      // Render preview area to canvas
      const el = previewRef.current;
      if (!el) {
        setSnack({ open: true, msg: "Preview not ready", severity: "error" });
        setLoading(false);
        return;
      }

      // temporarily show the preview (it should be visible in DOM), then render
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // keep margins
      const margin = 32;
      // fit image within page width minus margins, scale proportionally
      const availableWidth = pageWidth - margin * 2;
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = availableWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.text(`Feeder Balancer — Report`, margin, 40);
      pdf.text(`Node: ${data.nodeId} — ${data.nodeName}`, margin, 58);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 76);
      pdf.addImage(imgData, "PNG", margin, 92, imgWidth, imgHeight);

      // footer
      pdf.setFontSize(9);
      pdf.text("SIH'25 Feeder Balancer — Demo Report", margin, pageHeight - 30);
      const outName = `report-${data.nodeId}-${Date.now()}.pdf`;
      pdf.save(outName);
      setSnack({
        open: true,
        msg: `PDF generated: ${outName}`,
        severity: "success",
      });
    } catch (e) {
      console.error(e);
      setSnack({
        open: true,
        msg: "Failed to generate PDF",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Render preview (declared inside so it can reference built data synchronously for the demo)
  const [previewData, setPreviewData] = React.useState<any>(null);
  async function refreshPreview() {
    setLoading(true);
    const d = await buildReportData();
    setPreviewData(d);
    setLoading(false);
  }

  React.useEffect(() => {
    // initialize preview
    refreshPreview();
  }, [selectedNode, minutes, mode]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Mode</InputLabel>
            <Select
              value={mode}
              label="Mode"
              onChange={(e) => setMode(e.target.value as any)}
            >
              <MenuItem value="node">Single Node</MenuItem>
              <MenuItem value="fleet">Fleet Summary</MenuItem>
            </Select>
          </FormControl>

          {mode === "node" && (
            <FormControl size="small" sx={{ minWidth: 320 }}>
              <InputLabel>Node</InputLabel>
              <Select
                value={selectedNode}
                label="Node"
                onChange={(e) => setSelectedNode(e.target.value as string)}
              >
                {nodes.map((n) => (
                  <MenuItem key={n.id} value={n.id}>
                    {n.id} — {n.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Window (minutes)"
            size="small"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
            sx={{ width: 160 }}
          />

          <Box sx={{ flex: 1 }} />

          <Button
            variant="outlined"
            onClick={() => refreshPreview()}
            disabled={loading}
          >
            Refresh Preview
          </Button>

          <Button
            variant="contained"
            onClick={() => generatePdf()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Working…" : "Generate PDF"}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Preview</Typography>
        <Divider sx={{ my: 1 }} />

        <div
          ref={previewRef as any}
          id="report-preview"
          style={{ padding: 12, background: "#fff" }}
        >
          {previewData ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Node: {previewData.nodeId} — {previewData.nodeName}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Paper sx={{ p: 1, minWidth: 160 }}>
                  <Typography variant="caption">Avg VUF</Typography>
                  <Typography variant="h6">
                    {(previewData.telemetry?.vuf ?? 0).toFixed(3)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Neutral: {(previewData.telemetry?.neutral ?? 0).toFixed(2)}{" "}
                    A
                  </Typography>
                </Paper>

                <Paper sx={{ p: 1, minWidth: 160 }}>
                  <Typography variant="caption">Window</Typography>
                  <Typography variant="h6">{minutes} minutes</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Samples: {previewData.timeseries.length}
                  </Typography>
                </Paper>
              </Box>

              <TimeseriesChart data={previewData.timeseries} />
            </Box>
          ) : (
            <Typography color="text.secondary">No preview data</Typography>
          )}
        </div>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
