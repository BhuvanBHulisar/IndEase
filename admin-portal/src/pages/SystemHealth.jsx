import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Alert,
  LinearProgress,
  useTheme,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Dns as DnsIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  Wifi as WifiIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  DeleteOutline as ClearIcon,
  MonitorHeart as HealthIcon,
  Memory as MemoryIcon,
  Timer as TimerIcon,
  PeopleAlt as PeopleIcon,
  Hub as HubIcon,
  CheckCircleOutlined as CheckIcon,
  HighlightOff as CloseIcon,
  WarningAmberRounded as WarnIcon,
} from "@mui/icons-material";
import api from "../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS = { ok: "#10B981", warning: "#F59E0B", error: "#EF4444" };

const OVERALL_META = {
  healthy: {
    label: "All Systems Operational",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  degraded: {
    label: "System Degraded",
    color: "#92400E",
    bg: "#FEF3C7",
    border: "#FCD34D",
  },
  critical: {
    label: "Critical Issues Detected",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FCA5A5",
  },
};

const FIX_HINTS = {
  database:
    "Check your DATABASE_URL in server/.env\nMake sure Neon connection string includes ?sslmode=require",
  email:
    "Check SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env\nMake sure Gmail App Password is correct",
  razorpay: "Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env",
  socketio:
    "Check that the Socket.io server is running and not blocked by a proxy",
  environment: "Add the missing variable to server/.env and restart the server",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PulseDot = ({ status }) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.warning;
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
        transition: "background-color 0.4s",
        ...(status === "error" && {
          animation: "dotPulse 1.5s ease-in-out infinite",
          "@keyframes dotPulse": {
            "0%, 100%": { boxShadow: `0 0 0 0 ${color}80` },
            "50%": { boxShadow: `0 0 0 7px transparent` },
          },
        }),
      }}
    />
  );
};

const MiniStatCard = ({ icon, label, value, color = "#3b82f6", theme }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "16px",
      border: `1px solid ${theme.palette.divider}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2.5,
        bgcolor: `${color}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{  letterSpacing: 0.8 }}
      >
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  </Paper>
);

const ServiceCard = ({
  title,
  icon,
  status,
  detail,
  errorMsg,
  hint,
  theme,
}) => {
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.warning;
  const isError = status === "error";
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: `1px solid ${isError ? "#EF444440" : theme.palette.divider}`,
        bgcolor: isError
          ? theme.palette.mode === "dark"
            ? "#3B0D0D"
            : "#FFF5F5"
          : theme.palette.background.paper,
        transition: "border-color 0.35s, background-color 0.35s",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${statusColor}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: statusColor,
              transition: "background-color 0.35s, color 0.35s",
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PulseDot status={status} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: statusColor,
              
              letterSpacing: 0.6,
              transition: "color 0.35s",
            }}
          >
            {status === "ok"
              ? "Online"
              : status === "warning"
                ? "Warning"
                : "Error"}
          </Typography>
        </Box>
      </Box>

      {/* Detail line */}
      {detail && (
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      )}

      {/* Error + hint */}
      <Collapse in={isError}>
        {(errorMsg || hint) && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "#FEE2E2",
              borderRadius: 2,
              border: "1px solid #FECACA",
            }}
          >
            {errorMsg && (
              <Typography
                variant="caption"
                sx={{ color: "#B91C1C", fontWeight: 700, display: "block" }}
              >
                {errorMsg}
              </Typography>
            )}
            {hint && (
              <Typography
                variant="caption"
                sx={{
                  color: "#991B1B",
                  display: "block",
                  mt: 0.5,
                  whiteSpace: "pre-line",
                }}
              >
                💡 {hint}
              </Typography>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SystemHealth() {
  const theme = useTheme();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [changeAlerts, setChangeAlerts] = useState([]);
  const prevChecksRef = useRef(null);

  // ── Fetch health data ──────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/system-health");
      setHealth(data);
      setFetchError(null);
      setLastUpdated(new Date());
      setSecondsAgo(0);

      // Detect changes from ok → error
      if (prevChecksRef.current) {
        const newAlerts = [];
        const prev = prevChecksRef.current;
        const curr = data.checks;
        const serviceMap = {
          database: "Database",
          email: "Email Service",
          razorpay: "Razorpay",
          socketio: "Socket.io",
        };
        for (const [key, label] of Object.entries(serviceMap)) {
          if (prev[key]?.status === "ok" && curr[key]?.status === "error") {
            newAlerts.push({
              id: `${key}-${Date.now()}`,
              key,
              label,
              message: curr[key]?.message,
            });
          }
        }
        if (newAlerts.length > 0) setChangeAlerts(newAlerts);
      }
      prevChecksRef.current = data.checks;
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch health data";
      if (err.code === "ERR_NETWORK" || msg.toLowerCase().includes("network")) {
        setFetchError(
          "Cannot reach the backend. Make sure the server is running on port 5000.",
        );
      } else {
        setFetchError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-refresh every 30s ─────────────────────────────────────────────────
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // ── "X seconds ago" counter ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Clear error log ────────────────────────────────────────────────────────
  const clearErrors = async () => {
    try {
      await api.delete("/admin/system-health/errors");
      setHealth((prev) => (prev ? { ...prev, recentErrors: [] } : prev));
    } catch (err) {
      console.error("Failed to clear errors:", err);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const dismissAlert = (id) =>
    setChangeAlerts((prev) => prev.filter((a) => a.id !== id));

  const formatSecondsAgo = (s) => {
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ${s % 60}s ago`;
  };

  const checks = health?.checks || {};
  const overall = health?.overall || "healthy";
  const meta = OVERALL_META[overall] || OVERALL_META.healthy;

  // ── Service card config ────────────────────────────────────────────────────
  const services = [
    {
      key: "database",
      title: "Database (PostgreSQL)",
      icon: <StorageIcon />,
      detail:
        checks.database?.status === "ok"
          ? `Response time: ${checks.database.responseTime}`
          : null,
      errorMsg: checks.database?.message,
      hint: FIX_HINTS.database,
    },
    {
      key: "apiRoutes",
      title: "API Server",
      icon: <DnsIcon />,
      detail:
        checks.apiRoutes?.status === "ok"
          ? `${checks.apiRoutes.count} routes active`
          : null,
    },
    {
      key: "email",
      title: "Email Service",
      icon: <EmailIcon />,
      detail: checks.email?.status === "ok" ? "SMTP connection verified" : null,
      errorMsg: checks.email?.message,
      hint: FIX_HINTS.email,
    },
    {
      key: "razorpay",
      title: "Payment Gateway",
      icon: <CreditCardIcon />,
      detail:
        checks.razorpay?.status === "ok" ? "Razorpay API reachable" : null,
      errorMsg: checks.razorpay?.message,
      hint: FIX_HINTS.razorpay,
    },
    {
      key: "socketio",
      title: "Real-time (Socket.io)",
      icon: <WifiIcon />,
      detail:
        checks.socketio?.status === "ok"
          ? `${checks.socketio.connectedClients} client${checks.socketio.connectedClients !== 1 ? "s" : ""} connected`
          : null,
      errorMsg: checks.socketio?.message,
      hint: FIX_HINTS.socketio,
    },
    {
      key: "environment",
      title: "Environment Config",
      icon: <TuneIcon />,
      detail: (() => {
        if (!checks.environment) return null;
        const missing = Object.entries(checks.environment)
          .filter(([, v]) => !v.exists)
          .map(([k]) => k);
        return missing.length === 0 ? "All required variables present" : null;
      })(),
      errorMsg: (() => {
        if (!checks.environment) return null;
        const missing = Object.entries(checks.environment)
          .filter(([, v]) => !v.exists)
          .map(([k]) => k);
        return missing.length > 0 ? `Missing: ${missing.join(", ")}` : null;
      })(),
      hint: FIX_HINTS.environment,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Page title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HealthIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800}>
            System Health
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {lastUpdated && (
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              Updated {formatSecondsAgo(secondsAgo)}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchHealth}
            disabled={loading}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Fetch error */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {fetchError}
        </Alert>
      )}

      {/* Change alerts (ok → error transitions) */}
      {changeAlerts.map((alert) => (
        <Alert
          key={alert.id}
          severity="error"
          onClose={() => dismissAlert(alert.id)}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <strong>{alert.label} connection lost!</strong>{" "}
          {alert.key === "database" &&
            "Check your Neon DATABASE_URL in server/.env"}
          {alert.key === "email" && "Check SMTP credentials in server/.env"}
          {alert.key === "razorpay" &&
            "Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env"}
          {alert.message && ` — ${alert.message}`}
        </Alert>
      ))}

      {/* Loading state */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 1, mb: 1.5 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", fontWeight: 500 }}
          >
            Checking system health…
          </Typography>
        </Box>
      )}

      {/* Overall status banner */}
      {health && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "16px",
            bgcolor: meta.bg,
            border: `1px solid ${meta.border}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "background-color 0.4s, border-color 0.4s",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: meta.color,
              flexShrink: 0,
              ...(overall !== "healthy" && {
                animation: "bannerPulse 2s ease-in-out infinite",
                "@keyframes bannerPulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }),
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: meta.color }}
            >
              {meta.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: meta.color, opacity: 0.8 }}
            >
              {new Date(health.timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={overall.toUpperCase()}
            size="small"
            sx={{
              bgcolor: meta.color,
              color: "#fff",
              fontWeight: 800,
              letterSpacing: 1,
              fontSize: "0.7rem",
            }}
          />
        </Paper>
      )}

      {/* Stats row */}
      {health && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatCard
              icon={<TimerIcon />}
              label="Server Uptime"
              value={health.uptime}
              color="#3b82f6"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatCard
              icon={<MemoryIcon />}
              label="Memory Usage"
              value={health.memory}
              color="#8b5cf6"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatCard
              icon={<PeopleIcon />}
              label="Connected Users"
              value={checks.socketio?.connectedClients ?? "—"}
              color="#10B981"
              theme={theme}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatCard
              icon={<HubIcon />}
              label="API Routes Active"
              value={checks.apiRoutes?.count ?? "—"}
              color="#F59E0B"
              theme={theme}
            />
          </Grid>
        </Grid>
      )}

      {/* Service cards grid */}
      {health && (
        <>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Service Checks
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {services.map((svc) => (
              <Grid item xs={12} sm={6} lg={4} key={svc.key}>
                <ServiceCard
                  title={svc.title}
                  icon={svc.icon}
                  status={checks[svc.key]?.status || "warning"}
                  detail={svc.detail}
                  errorMsg={svc.errorMsg}
                  hint={svc.hint}
                  theme={theme}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Environment variables */}
      {health && checks.environment && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TuneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Environment Variables
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {Object.entries(checks.environment).map(([name, { exists }]) => (
              <Tooltip
                key={name}
                title={
                  exists
                    ? `${name} is configured`
                    : `${name} is MISSING — add it to server/.env`
                }
              >
                <Chip
                  icon={
                    exists ? (
                      <CheckIcon style={{ fontSize: 14, color: "#065F46" }} />
                    ) : (
                      <CloseIcon style={{ fontSize: 14, color: "#991B1B" }} />
                    )
                  }
                  label={name}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    bgcolor: exists ? "#D1FAE5" : "#FEE2E2",
                    color: exists ? "#065F46" : "#991B1B",
                    border: `1px solid ${exists ? "#6EE7B7" : "#FCA5A5"}`,
                    "& .MuiChip-icon": { ml: 0.75 },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Paper>
      )}

      {/* Error log */}
      {health && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Recent Server Errors
              {health.recentErrors?.length > 0 && (
                <Chip
                  label={health.recentErrors.length}
                  size="small"
                  sx={{
                    ml: 1.5,
                    bgcolor: "#FEE2E2",
                    color: "#991B1B",
                    fontWeight: 700,
                    height: 20,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Typography>
            {health.recentErrors?.length > 0 && (
              <Button
                startIcon={<ClearIcon />}
                size="small"
                color="error"
                variant="outlined"
                onClick={clearErrors}
                sx={{ borderRadius: 2 }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Table or empty state */}
          {!health.recentErrors || health.recentErrors.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CheckIcon sx={{ fontSize: 40, color: "#10B981", mb: 1 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                No recent errors — all clear!
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.04)"
                        : "#F8FAFC",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      
                      letterSpacing: 0.5,
                    }}
                  >
                    Time
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      
                      letterSpacing: 0.5,
                    }}
                  >
                    Source
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      
                      letterSpacing: 0.5,
                    }}
                  >
                    Error
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {health.recentErrors.map((err, i) => (
                  <TableRow key={i} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        color: "text.secondary",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={err.source}
                        size="small"
                        sx={{
                          fontSize: "0.7rem",
                          fontFamily: "monospace",
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#EF4444",
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {err.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {/* Empty/loading state */}
      {!health && !loading && !fetchError && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography color="text.secondary">
            No health data available.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
