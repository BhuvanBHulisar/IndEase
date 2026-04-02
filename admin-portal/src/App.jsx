import AdminProfile from "./pages/AdminProfile";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import {
  Box,
  CircularProgress,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Toolbar,
  Typography,
} from "@mui/material";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Providers from "./pages/Providers";
import Jobs from "./pages/Jobs";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import SystemHealth from "./pages/SystemHealth";
import NotFound from "./pages/NotFound";
import { socket } from "./utils/socket";
import ThemeProviderWrapper from "./theme";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SupportRequests from "./pages/SupportRequests";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const sidebarWidth = 260;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar
        open={mobileOpen}
        onToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar sx={{ mb: 2 }} /> {/* Spacing for fixed header */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <Outlet />
        </Box>
        {/* Footer info/copyright */}
        <Box sx={{ mt: 6, textAlign: "center", opacity: 0.5, pb: 2 }}>
          <Typography variant="caption" color="text.disabled">
            Need help? Contact us at{" "}
            <a href="mailto:originode7@gmail.com" style={{ color: "#3b82f6", textDecoration: "none" }}>
              originode7@gmail.com
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Global App wrapper
const PortalRoutes = () => {
  const [socketReady, setSocketReady] = React.useState(false);

  React.useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      socket.auth = { token: adminToken };
      socket.connect();
    }
    setSocketReady(true);
    return () => socket.disconnect();
  }, []);

  if (!socketReady) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="providers" element={<Providers />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="health" element={<SystemHealth />} />
        <Route path="support" element={<SupportRequests />} />
        <Route path="admin/profile" element={<AdminProfile />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProviderWrapper>
      <BrowserRouter>
        <PortalRoutes />
      </BrowserRouter>
    </ThemeProviderWrapper>
  );
}
