import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Alert, Avatar, MenuItem, Link as MLink } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";

const RaiseRequest = () => {
  const { raiseComplaint, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgSlug: "", name: "", email: "", password: "",
    title: "", description: "", category: "General", priority: "Medium",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await raiseComplaint(form);
      navigate("/work-items");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.canvas, display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
      <Paper elevation={0} sx={{ p: 5, width: 500, border: `1px solid ${colors.line}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
          <Avatar sx={{ bgcolor: colors.red, fontFamily: "Poppins", fontWeight: 700 }}>F</Avatar>
          <Typography variant="h5">FlowForge</Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Raise a request or complaint
        </Typography>
        <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
          This goes straight to the team — no approval needed. You'll be signed in automatically.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Organization slug"
            name="orgSlug"
            placeholder="e.g. acme-bank"
            value={form.orgSlug}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField label="Your name" name="name" value={form.name} onChange={handleChange} required fullWidth />
          <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            helperText="Creates your account, or signs you in if you've raised a request before"
          />
          <TextField label="What's the issue?" name="title" value={form.title} onChange={handleChange} required fullWidth />
          <TextField
            label="Details"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField label="Category" name="category" value={form.category} onChange={handleChange} fullWidth />
          <TextField select label="Priority" name="priority" value={form.priority} onChange={handleChange} fullWidth>
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: colors.slate }}>
          <MLink component={Link} to="/join" sx={{ color: colors.red, fontWeight: 600 }}>
            ← Back
          </MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RaiseRequest;
