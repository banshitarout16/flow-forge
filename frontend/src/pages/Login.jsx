import { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, Avatar, Link as MLink } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ orgSlug: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.canvas,
      }}
    >
      <Paper elevation={0} sx={{ p: 5, width: 420, border: `1px solid ${colors.line}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
          <Avatar sx={{ bgcolor: colors.red, fontFamily: "Poppins", fontWeight: 700 }}>F</Avatar>
          <Typography variant="h5">FlowForge</Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
          Sign in to manage your organization's work items.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Organization slug"
            name="orgSlug"
            placeholder="e.g. acme-hospital"
            value={form.orgSlug}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: colors.slate }}>
          New organization?{" "}
          <MLink component={Link} to="/register" sx={{ color: colors.red, fontWeight: 600 }}>
            Create one
          </MLink>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, textAlign: "center", color: colors.slate }}>
          Applying as staff, or raising a request?{" "}
          <MLink component={Link} to="/join" sx={{ color: colors.red, fontWeight: 600 }}>
            Get started here
          </MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
