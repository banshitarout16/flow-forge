import { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, Avatar, Link as MLink } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";

const Register = () => {
  const { registerOrganization, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: "",
    domainType: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerOrganization(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        py: 4,
      }}
    >
      <Paper elevation={0} sx={{ p: 5, width: 460, border: `1px solid ${colors.line}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
          <Avatar sx={{ bgcolor: colors.red, fontFamily: "Poppins", fontWeight: 700 }}>F</Avatar>
          <Typography variant="h5">FlowForge</Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Set up your organization
        </Typography>
        <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
          Configure FlowForge for whatever your team fixes, tracks, or resolves.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Organization name" name="orgName" value={form.orgName} onChange={handleChange} required fullWidth />
          <TextField
            label="Domain type (optional)"
            name="domainType"
            placeholder="e.g. Hospital, Factory, IT Company"
            value={form.domainType}
            onChange={handleChange}
            fullWidth
          />
          <TextField label="Your name" name="adminName" value={form.adminName} onChange={handleChange} required fullWidth />
          <TextField
            label="Your email"
            name="adminEmail"
            type="email"
            value={form.adminEmail}
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
            helperText="At least 6 characters"
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? "Creating..." : "Create organization"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: colors.slate }}>
          Already have an account?{" "}
          <MLink component={Link} to="/login" sx={{ color: colors.red, fontWeight: 600 }}>
            Sign in
          </MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
