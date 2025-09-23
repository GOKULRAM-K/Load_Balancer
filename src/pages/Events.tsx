// src/pages/Events.tsx
import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { useSupabaseEvents } from "../hooks/useSupabaseEvents";

export default function EventsPage() {
  const navigate = useNavigate();
  const { events } = useSupabaseEvents(50);

  const [filter, setFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const shown = React.useMemo(() => {
    let list = events.slice();
    if (filter !== "all")
      list = list.filter((e) => e.type === filter || e.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.details || "").toLowerCase().includes(q) ||
          (e.node_id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, filter, query]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Events & Logs
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search details or node id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 320 }}
          />
          <Select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="auto-switch">Auto actions</MenuItem>
            <MenuItem value="manual-switch">Manual actions</MenuItem>
            <MenuItem value="command-sent">Command sent</MenuItem>
            <MenuItem value="command-ack">Command ack</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </Box>
      </Paper>

      {/* Event list */}
      <Paper sx={{ p: 1 }}>
        <List dense>
          {shown.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No events
            </Typography>
          )}
          {shown.map((e: any) => (
            <ListItem
              key={e.id}
              divider
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => e.node_id && navigate(`/nodes/${e.node_id}`)}
                >
                  <OpenInNewIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {new Date(e.ts).toLocaleString()}
                    </Typography>
                    <Chip
                      label={e.type?.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor:
                          e.type === "command-ack"
                            ? "#2E7D32"
                            : e.type === "auto-switch"
                            ? "#F39C12"
                            : e.type === "manual-switch"
                            ? "#0288D1"
                            : "#90A4AE",
                        color: "#fff",
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {e.node_id ? ` ${e.node_id}` : ""}
                    </Typography>
                  </Box>
                }
                secondary={e.details}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
