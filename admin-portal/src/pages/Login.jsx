import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  useTheme,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Shield,
  LockOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import api from "../services/api";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
`;

const gradientBg = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "admin@originode.com",
    password: "Demo@1234",
  });
  const theme = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;

    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data?.token) {
        // Backend returns { token, admin: { id, name, email, role } }
        const user = res.data.admin || res.data.user;
        if (user && user.role !== "admin") {
          setError("Access denied. Admin role required.");
          setLoading(false);
          return;
        }
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem(
          "adminUser",
          JSON.stringify(user || { email, role: "admin" }),
        );
        window.dispatchEvent(new Event("storage"));
        navigate("/");
      } else {
        setError("Invalid login response.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #334155)"
            : "linear-gradient(-45deg, #f8fafc, #e2e8f0, #cbd5e1, #ffffff)",
        backgroundSize: "400% 400%",
        animation: `${gradientBg} 15s ease infinite`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)",
          animation: `${floatAnimation} 8s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 70%)",
          animation: `${floatAnimation} 12s ease-in-out infinite reverse`,
        }}
      />

      <Fade in={true} timeout={1000}>
        <Grid
          container
          sx={{
            maxWidth: 1000,
            margin: 3,
            borderRadius: 6,
            overflow: "hidden",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(20px)",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(30, 41, 59, 0.6)"
                : "rgba(255, 255, 255, 0.7)",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Left Pane: Branding / Hero */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              p: 6,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.05) 100%)",
              borderRight: { md: `1px solid ${theme.palette.divider}` },
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "primary.main",
                mb: 3,
                animation: `${glowAnimation} 3s ease-in-out infinite`,
              }}
            >
              <Shield sx={{ fontSize: 45 }} />
            </Avatar>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                textAlign: "center",
                letterSpacing: "-1px",
                mb: 2,
                background: "linear-gradient(to right, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              origiNode
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontWeight: 500,
                maxWidth: 300,
              }}
            >
              Manage service experts, consumers, and platform operations from one place.
            </Typography>
          </Grid>

          {/* Right Pane: Login Form */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{ p: { xs: 4, md: 8 }, position: "relative" }}
          >
            <Box sx={{ maxWidth: 400, mx: "auto" }}>
              <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Admin Login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your admin account.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      transition: "all 0.3s",
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      transition: "all 0.3s",
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    letterSpacing: "0.5px",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)",
                    background: "linear-gradient(to right, #14b8a6, #6366f1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 28px rgba(59, 130, 246, 0.6)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 4,
                  textAlign: "center",
                  color: "text.secondary",
                  opacity: 0.7,
                }}
              >
                &copy; 2026 IndEase Systems.
              </Typography>
              <Box sx={{ mt: 1.5, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  <Typography
                    component={RouterLink}
                    to="/terms"
                    variant="caption"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Terms & Conditions
                  </Typography>
                  {" | "}
                  <Typography
                    component={RouterLink}
                    to="/privacy"
                    variant="caption"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Privacy Policy
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
};

export default Login;
