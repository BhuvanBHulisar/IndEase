import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  OutlinedInput,
  Button,
} from "@mui/material";
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SupportAgent as SupportAgentIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import api from "../services/api";

const SUPPORT_EMAIL = "originode7@gmail.com";

const statusColors = {
  open: "warning",
  resolved: "success",
  in_progress: "info",
};

const statusLabels = {
  open: "Open",
  resolved: "Resolved",
  in_progress: "In Progress",
};

const subjectColors = {
  "Payment Issue": "#ef4444",
  "Service Issue": "#f59e0b",
  "Account Issue": "#6366f1",
  Other: "#64748b",
  "General Support": "#14b8a6",
  "Machine Diagnosis Issue": "#8b5cf6",
  "Expert Consultation": "#10b981",
  "Billing Inquiry": "#f59e0b",
};

export default function SupportRequests() {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX 3 — Add error logging
      const res = await api.get("/admin/support");
      console.log('[Support] Fetched tickets:', res.data?.length);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Support] Fetch error:', err.response?.status, err.response?.data);
      setError(
        `Failed to load tickets: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // FIX 4 — Add auto-refresh every 30 seconds
  useEffect(() => {
    fetchTickets(); // Initial load
    const interval = setInterval(fetchTickets, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/support/${id}/status`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleReply = (email, subject) => {
    window.open(
      `mailto:${email}?subject=Re: Support Request - ${encodeURIComponent(subject)}`,
      "_blank"
    );
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.message?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: "linear-gradient(135deg, #14b8a6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SupportAgentIcon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
              Support Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All user support requests — reply via email or mark as resolved
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTickets} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.1em">
              Total Tickets
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.5}>
              {tickets.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, borderLeft: "4px solid #f59e0b" }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" color="warning.main" fontWeight={700} textTransform="uppercase" letterSpacing="0.1em">
              Open
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main" mt={0.5}>
              {openCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, borderLeft: "4px solid #10b981" }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" color="success.main" fontWeight={700} textTransform="uppercase" letterSpacing="0.1em">
              Resolved
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
              {resolvedCount}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <OutlinedInput
          placeholder="Search by name, email, subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          }
          size="small"
          sx={{ flex: 1, borderRadius: 2 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <SupportAgentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No support requests found
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            New tickets will appear here when users submit support requests
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#f8fafc" },
                    opacity: ticket.status === "resolved" ? 0.7 : 1,
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
                        {ticket.name || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.email || ticket.user_email || "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.subject}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: (subjectColors[ticket.subject] || "#64748b") + "18",
                        color: subjectColors[ticket.subject] || "#64748b",
                        border: `1px solid ${(subjectColors[ticket.subject] || "#64748b")}30`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 300,
                        fontSize: "0.82rem",
                      }}
                    >
                      {ticket.message || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={ticket.status || "open"}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        sx={{
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          "& .MuiSelect-select": { py: 0.75, px: 1.5 },
                        }}
                        renderValue={(val) => (
                          <Chip
                            label={statusLabels[val] || val}
                            size="small"
                            color={statusColors[val] || "default"}
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                          />
                        )}
                      >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={`Reply via email to ${ticket.email || ticket.user_email}`}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleReply(ticket.email || ticket.user_email, ticket.subject)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {ticket.status !== "resolved" && (
                        <Tooltip title="Mark as Resolved">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(ticket.id, "resolved")}
                            sx={{ borderRadius: 1.5 }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="caption" color="text.disabled">
          Need help? Contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#14b8a6", textDecoration: "none" }}>
            {SUPPORT_EMAIL}
          </a>
        </Typography>
      </Box>
    </Box>
  );
}
