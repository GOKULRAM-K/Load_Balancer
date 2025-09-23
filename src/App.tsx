// src/App.tsx
import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Home from "./pages/Home";
import Nodes from "./pages/Nodes";
import NodeDetail from "./pages/NodeDetail";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import Help from "./pages/Help";

function RouteTabs() {
  const location = useLocation();
  const tabIndex = (() => {
    if (location.pathname.startsWith("/nodes/")) return 2;
    switch (location.pathname) {
      case "/":
        return 0;
      case "/nodes":
        return 1;
      case "/events":
        return 3;
      case "/reports":
        return 4;
      case "/help":
        return 5;
      default:
        return 0;
    }
  })();

  return (
    <Tabs value={tabIndex} textColor="inherit" indicatorColor="secondary">
      <Tab label="Home" component={Link} to="/" />
      <Tab label="Nodes" component={Link} to="/nodes" />
      <Tab label="Node Detail" component={Link} to="/nodes" />
      <Tab label="Events" component={Link} to="/events" />
      <Tab label="Reports" component={Link} to="/reports" />
      <Tab label="Help" component={Link} to="/help" />
    </Tabs>
  );
}

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 3 }}>
            SIH’25 — Feeder Balancer
          </Typography>
          <RouteTabs />
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT AREA — full width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 3,
          mb: 6,
          px: 3,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/nodes/:nodeId" element={<NodeDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Box>

      {/* FOOTER — full width */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          bgcolor: "background.paper",
          width: "100%",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          SIH'25 Demo • Built with React + MUI
        </Typography>
      </Box>
    </Box>
  );
}
