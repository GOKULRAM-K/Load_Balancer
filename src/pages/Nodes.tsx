// src/pages/Nodes.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { computeStatus } from "../utils/status";
import { useSupabaseNodes } from "../hooks/useSupabaseNodes";

type Order = "asc" | "desc";

export default function Nodes() {
  const navigate = useNavigate();
  const { nodes, loading } = useSupabaseNodes();

  // filters & search
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [districtFilter, setDistrictFilter] = React.useState<string>("all");

  // sorting
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<string>("vuf");

  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // derive list with computed status
  const nodesWithStatus = React.useMemo(() => {
    return nodes.map((n) => {
      const st = computeStatus(n.telemetry);
      return {
        ...n,
        status: st.level,
        severity: st.severity,
        vuf: n.telemetry?.vuf ?? NaN,
        lastSeen: n.telemetry?.ts ?? 0,
      };
    });
  }, [nodes]);

  // districts for dropdown
  const districts = Array.from(
    new Set(nodesWithStatus.map((n) => n.district))
  ).sort();

  // filtering
  const filtered = nodesWithStatus.filter((n) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const hay = `${n.id} ${n.name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter !== "all" && n.status !== statusFilter) return false;
    if (districtFilter !== "all" && n.district !== districtFilter) return false;
    return true;
  });

  // sorting
  const sorted = React.useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      const valA = (a as any)[orderBy];
      const valB = (b as any)[orderBy];
      let cmp = 0;
      if (isNaN(valA) && isNaN(valB)) cmp = 0;
      else if (isNaN(valA)) cmp = 1;
      else if (isNaN(valB)) cmp = -1;
      else cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return order === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [filtered, order, orderBy]);

  const handleSort = (col: string) => {
    if (orderBy === col) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setOrderBy(col);
      setOrder("desc");
    }
  };

  const pageSlice = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <Typography>Loading nodes...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nodes
      </Typography>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            label="Search by ID or name"
            variant="outlined"
            size="small"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="degraded">Degraded</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>District</InputLabel>
            <Select
              label="District"
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              {districts.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows</InputLabel>
            <Select
              label="Rows"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Feeder</TableCell>
              <TableCell>District</TableCell>
              <TableCell sortDirection={orderBy === "vuf" ? order : false}>
                <TableSortLabel
                  active={orderBy === "vuf"}
                  direction={order}
                  onClick={() => handleSort("vuf")}
                >
                  VUF
                </TableSortLabel>
              </TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "severity"}
                  direction={order}
                  onClick={() => handleSort("severity")}
                >
                  Severity
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pageSlice.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                  {r.id}
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.feeder}</TableCell>
                <TableCell>{r.district}</TableCell>
                <TableCell>{isNaN(r.vuf) ? "—" : r.vuf.toFixed(3)}</TableCell>
                <TableCell>
                  <Chip label={r.mode?.toUpperCase() ?? "—"} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={r.status?.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor:
                        r.status === "critical"
                          ? "#E74C3C"
                          : r.status === "degraded"
                          ? "#F39C12"
                          : "#2ECC71",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ marginLeft: 8, color: "#666" }}>
                    {r.severity}/100
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/nodes/${r.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {pageSlice.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  No nodes match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value as string, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
}
