import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Link as MLink,
} from "@mui/material";
import api from "../api/axios";
import { colors } from "../theme/theme";

const roleCopy = {
  agent: {
    title: "Apply as an Agent",
    subtitle:
      "Tell us a bit about yourself. The hiring manager will review your application.",
  },
  manager: {
    title: "Apply as a Manager",
    subtitle:
      "Tell us about your experience. The hiring manager will review your application.",
  },
};

const Apply = () => {
  const { role } = useParams();
  const copy = roleCopy[role] || roleCopy.agent;

  const [form, setForm] = useState({
    orgSlug: "",
    name: "",
    email: "",
    password: "",
    department: "",
    experience: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/join-requests/apply", { ...form, requestedRole: role });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: colors.canvas,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        sx={{ p: 5, width: 460, border: `1px solid ${colors.line}` }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
          <Avatar
            sx={{ bgcolor: colors.red, fontFamily: "Poppins", fontWeight: 700 }}
          >
            F
          </Avatar>
          <Typography variant="h5">FlowForge</Typography>
        </Box>

        {submitted ? (
          <>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Application submitted
            </Typography>
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
              The hiring manager will review it soon. You'll be able to sign in
              with the password you set once it's approved.
            </Alert>
            <MLink
              component={Link}
              to="/join"
              sx={{ color: colors.red, fontWeight: 600 }}
            >
              ← Back to start
            </MLink>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              {copy.title}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
              {copy.subtitle}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Organization slug"
                name="orgSlug"
                placeholder="e.g. acme-bank"
                value={form.orgSlug}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Your name"
                name="name"
                value={form.name}
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
                label="Set a password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
                helperText="You'll use this to sign in once approved"
              />
              <TextField
                label="Department / area you'd work in"
                name="department"
                placeholder="e.g. IT & Systems, Customer Service"
                value={form.department}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label={
                  role === "manager"
                    ? "Relevant experience"
                    : "Skills or past experience"
                }
                name="experience"
                value={form.experience}
                onChange={handleChange}
                multiline
                minRows={3}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? "Submitting..." : "Submit application"}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: "center", color: colors.slate }}
            >
              <MLink
                component={Link}
                to="/join"
                sx={{ color: colors.red, fontWeight: 600 }}
              >
                ← Back
              </MLink>
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Apply;
