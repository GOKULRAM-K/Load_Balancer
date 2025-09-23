// src/components/BeforeAfterPanel.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export default function BeforeAfterPanel({
  before,
  after,
}: {
  before?: any;
  after?: any;
}) {
  if (!before || !after) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1">Before / After</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          No recent commands.
        </Typography>
      </Paper>
    );
  }

  const vufBefore = before.vuf ?? 0;
  const vufAfter = after.vuf ?? 0;
  const delta = vufBefore ? ((vufBefore - vufAfter) / vufBefore) * 100 : 0;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">Before / After</Typography>

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">Before</Typography>
          <Typography variant="h6">{vufBefore.toFixed(3)}</Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">After</Typography>
          <Typography variant="h6">{vufAfter.toFixed(3)}</Typography>
        </Box>

        <Box sx={{ width: 140, textAlign: "center" }}>
          <Chip
            label={`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
            color={delta >= 0 ? "success" : "error"}
            sx={{ fontWeight: 700 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            VUF improvement
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
