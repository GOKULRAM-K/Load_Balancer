// src/components/EventLog.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export default function EventLog({ events }: { events: any[] }) {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">Event Log</Typography>
      <List dense>
        {events.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No events yet
          </Typography>
        )}
        {events
          .slice()
          .reverse()
          .map((e) => (
            <ListItem key={e.id}>
              <ListItemText
                primary={`${new Date(e.ts).toLocaleTimeString()} — ${e.type}`}
                secondary={e.details}
              />
            </ListItem>
          ))}
      </List>
    </Paper>
  );
}
